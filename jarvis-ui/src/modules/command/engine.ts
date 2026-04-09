import path from "node:path";
import { promises as fs } from "node:fs";

import { resolveInsideNexus, resolveNexusRoot } from "@/lib/nexus-path";
import { readOverviewState } from "@/modules/nexus-adapter/reader";
import { analyzeOnboardingInput } from "@/modules/onboarding/engine";
import type { OnboardingAnalysis } from "@/modules/onboarding/types";
import { scanProjectRoot } from "@/modules/project-discovery/reader";
import type { ProjectScan } from "@/modules/project-discovery/types";
import type {
  CommandClassification,
  CommandIntent,
  CommandPlan,
  CommandRecommendation,
  CommandSource,
  LaunchPackage,
  RoomAiContractEntry
} from "@/modules/command/types";

const DEFAULT_CONTRACT: RoomAiContractEntry[] = [
  {
    room: "architect",
    responsibility: "architecture, ADRs, technical review, orchestration",
    defaultAi: "Claude",
    secondaryAi: null,
    notes: "decision-making room"
  },
  {
    room: "frontend",
    responsibility: "UI implementation and client behavior",
    defaultAi: "Codex",
    secondaryAi: "Claude",
    notes: "Claude only for complex state/design review"
  },
  {
    room: "backend",
    responsibility: "API and service implementation",
    defaultAi: "Codex",
    secondaryAi: "Claude",
    notes: "Claude only for diagnosis/review/spec refinement"
  },
  {
    room: "security",
    responsibility: "threat modeling, auth review, vulnerability review",
    defaultAi: "Claude",
    secondaryAi: "Gemini",
    notes: "Gemini supports research only"
  },
  {
    room: "devops",
    responsibility: "CI/CD, infra implementation, deployment systems",
    defaultAi: "Codex",
    secondaryAi: "Claude",
    notes: "Claude for incident reasoning and infra design"
  },
  {
    room: "qa",
    responsibility: "test implementation and coverage work",
    defaultAi: "Codex",
    secondaryAi: "Claude",
    notes: "Claude for test strategy"
  },
  {
    room: "product",
    responsibility: "scope, PRDs, roadmap, acceptance criteria",
    defaultAi: "Claude",
    secondaryAi: "Gemini",
    notes: "Gemini may draft prose, Claude owns final scope gate"
  },
  {
    room: "writer",
    responsibility: "technical documentation and changelogs",
    defaultAi: "Gemini",
    secondaryAi: "Claude",
    notes: "Claude for technical accuracy review"
  },
  {
    room: "data",
    responsibility: "schema design, migrations, query design",
    defaultAi: "Claude",
    secondaryAi: "Codex",
    notes: "Claude owns design; Codex executes bounded migrations/queries"
  },
  {
    room: "marketing",
    responsibility: "positioning, launch copy, campaigns",
    defaultAi: "Gemini",
    secondaryAi: "Claude",
    notes: "Claude for strategy review when needed"
  }
];

const INTENT_LABELS: Record<CommandIntent, string> = {
  new_idea: "New idea shaping",
  existing_project_learning: "Existing-project understanding",
  implementation_task: "Implementation task",
  debugging_task: "Debugging task",
  documentation_task: "Documentation task",
  review_task: "Review task",
  architecture_task: "Architecture task",
  next_step: "Next-step guidance"
};

function dedupe(items: string[], limit = items.length): string[] {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function normalizeAiName(ai: string): string {
  const lower = ai.trim().toLowerCase();

  if (lower === "claude") return "Claude";
  if (lower === "codex") return "Codex";
  if (lower === "gemini") return "Gemini";

  return ai.trim();
}

function includesAny(text: string, hints: readonly string[]): boolean {
  return hints.some((hint) => text.includes(hint));
}

function extractMeaningfulLines(raw: string, limit: number): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("<!--")) return false;
      if (line.startsWith("|----")) return false;
      return (
        line.startsWith("#") ||
        line.startsWith("- ") ||
        line.startsWith("**") ||
        line.startsWith("Phase:") ||
        line.startsWith("Last Action:") ||
        line.startsWith("Next Action:")
      );
    })
    .slice(0, limit);
}

async function safeRead(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function readRoomContextBundle(room: string): Promise<{
  identity: string[];
  promptRules: string[];
  contextState: string[];
}> {
  const [roomRaw, promptRaw, contextRaw] = await Promise.all([
    safeRead(resolveInsideNexus("rooms", room, "ROOM.md")),
    safeRead(resolveInsideNexus("rooms", room, "PROMPT.md")),
    safeRead(resolveInsideNexus("rooms", room, "CONTEXT.md"))
  ]);

  return {
    identity: roomRaw ? extractMeaningfulLines(roomRaw, 6) : [],
    promptRules: promptRaw ? extractMeaningfulLines(promptRaw, 8) : [],
    contextState: contextRaw ? extractMeaningfulLines(contextRaw, 6) : []
  };
}

async function readRepoTruthSummary(): Promise<string[]> {
  const projectRoot = path.resolve(resolveNexusRoot(), "..");
  const files = [
    path.join(projectRoot, "production", "STATUS.md"),
    path.join(projectRoot, "production", "vault", "ARCHITECTURE.md"),
    path.join(projectRoot, "production", "vault", "CONSTRAINTS.md")
  ];

  const contents = await Promise.all(files.map((file) => safeRead(file)));

  return dedupe(
    contents.flatMap((content) => (content ? extractMeaningfulLines(content, 5) : [])),
    10
  );
}

async function readRoomAiContract(): Promise<RoomAiContractEntry[]> {
  try {
    const raw = await fs.readFile(
      resolveInsideNexus("contracts", "ROOM_AI_CONTRACT.md"),
      "utf8"
    );
    const lines = raw.split("\n");
    const headerIndex = lines.findIndex((line) =>
      line.includes("| Room | Primary Responsibility | Default AI | Secondary AI | Notes |")
    );

    if (headerIndex === -1) {
      return DEFAULT_CONTRACT;
    }

    const rows: RoomAiContractEntry[] = [];

    for (const line of lines.slice(headerIndex + 2)) {
      if (!line.startsWith("|")) {
        break;
      }

      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

      if (cells.length !== 5) {
        continue;
      }

      rows.push({
        room: cells[0],
        responsibility: cells[1],
        defaultAi: normalizeAiName(cells[2]),
        secondaryAi: cells[3] && cells[3] !== "None" ? normalizeAiName(cells[3]) : null,
        notes: cells[4] || null
      });
    }

    return rows.length > 0 ? rows : DEFAULT_CONTRACT;
  } catch {
    return DEFAULT_CONTRACT;
  }
}

function classifyIntent(request: string, source: CommandSource): CommandClassification {
  const trimmed = request.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    const intent = source === "brownfield" ? "existing_project_learning" : "next_step";
    return {
      intent,
      label: INTENT_LABELS[intent],
      summary:
        intent === "existing_project_learning"
          ? "No explicit task was given, so Jarvis should turn the current repo scan into an actionable next move."
          : "No explicit task was given, so Jarvis should recommend the next best move from current project state."
    };
  }

  if (source === "onboarding") {
    return {
      intent: "new_idea",
      label: INTENT_LABELS.new_idea,
      summary:
        "This request came from onboarding, so Jarvis is treating it as active project shaping rather than direct execution."
    };
  }

  let intent: CommandIntent = "next_step";

  if (
    includesAny(lower, [
      "scan",
      "understand",
      "learn this repo",
      "existing project",
      "brownfield",
      "map the codebase"
    ])
  ) {
    intent = "existing_project_learning";
  } else if (
    includesAny(lower, ["bug", "broken", "failing", "fix", "debug", "issue", "error", "regression", "slow", "performance"])
  ) {
    intent = "debugging_task";
  } else if (
    includesAny(lower, ["docs", "documentation", "readme", "guide", "changelog", "write up", "blog", "post", "article"])
  ) {
    intent = "documentation_task";
  } else if (
    includesAny(lower, ["review", "audit", "assess", "inspect", "check", "verify", "threat model"])
  ) {
    intent = "review_task";
  } else if (
    includesAny(lower, [
      "implement",
      "build",
      "add",
      "create",
      "wire",
      "refactor",
      "ship",
      "test",
      "coverage",
      "e2e",
      "qa",
      "sync"
    ])
  ) {
    intent = "implementation_task";
  } else if (
    includesAny(lower, ["architecture", "design", "plan", "workflow", "scope", "roadmap", "orchestrate", "mvp", "strategy"])
  ) {
    intent = "architecture_task";
  } else if (
    includesAny(lower, [
      "idea",
      "new project",
      "build a product",
      "mvp",
      "rough prompt",
      "saas",
      "marketplace",
      "platform",
      "automate client intake"
    ])
  ) {
    intent = "new_idea";
  }

  return {
    intent,
    label: INTENT_LABELS[intent],
    summary: `Jarvis classified this request as ${INTENT_LABELS[intent].toLowerCase()} based on the command wording and current project context.`
  };
}

function inferRoomForImplementation(request: string): string {
  const lower = request.toLowerCase();

  // Multi-room heuristic: if both frontend and backend/data are mentioned, route to architect
  if (
    includesAny(lower, ["ui", "frontend", "page", "screen", "css", "layout", "component"]) &&
    includesAny(lower, ["api", "backend", "service", "endpoint", "server", "auth", "db", "database", "table", "field", "schema", "migration"])
  ) {
    return "architect";
  }

  if (includesAny(lower, ["engine", "protocol", "architecture", "nexus"])) {
    return "architect";
  }

  if (includesAny(lower, ["ui", "frontend", "page", "screen", "component", "css", "layout", "chat", "box", "modal"])) {
    return "frontend";
  }

  if (includesAny(lower, ["schema", "query", "migration", "database", "analytics", "report", "table", "field"])) {
    return "data";
  }

  if (includesAny(lower, ["api", "backend", "service", "endpoint", "server", "auth"])) {
    return "backend";
  }

  if (includesAny(lower, ["test", "coverage", "e2e", "vitest", "playwright", "jest"])) {
    return "qa";
  }

  if (includesAny(lower, ["deploy", "docker", "ci", "infra", "pipeline"])) {
    return "devops";
  }

  return "backend";
}

function inferRoomForDebugging(request: string): string {
  const lower = request.toLowerCase();

  // Multi-room heuristic for bugs too
  if (
    includesAny(lower, ["ui", "frontend", "page", "screen", "css", "layout", "component"]) &&
    includesAny(lower, ["api", "backend", "service", "endpoint", "server", "auth", "db", "database", "table", "field", "schema", "migration"])
  ) {
    return "architect";
  }

  // Performance/Slow/Core often starts at architect
  if (includesAny(lower, ["slow", "performance", "engine", "protocol", "architecture", "nexus"])) {
    return "architect";
  }

  if (includesAny(lower, ["auth", "security", "permission", "token", "vulnerability"])) {
    return "security";
  }

  if (includesAny(lower, ["ci", "deploy", "docker", "pipeline", "build server"])) {
    return "devops";
  }

  if (includesAny(lower, ["test", "flaky", "coverage", "assertion"])) {
    return "qa";
  }

  if (includesAny(lower, ["ui", "frontend", "screen", "component", "layout", "chat", "box", "modal"])) {
    return "frontend";
  }

  if (includesAny(lower, ["db", "database", "query", "migration", "table", "field", "schema"])) {
    return "data";
  }

  if (includesAny(lower, ["api", "backend", "service", "endpoint", "server"])) {
    return "backend";
  }

  return "backend";
}

function pickRecommendedRoom(
  classification: CommandClassification,
  request: string,
  onboarding: OnboardingAnalysis | null,
  scan: ProjectScan
): string {
  const lower = request.toLowerCase();

  switch (classification.intent) {
    case "new_idea":
      return onboarding?.readiness.recommendedFirstRoom ?? "product";
    case "existing_project_learning":
      return scan.recommendedActions[0]?.room ?? "architect";
    case "implementation_task":
      return inferRoomForImplementation(request);
    case "debugging_task":
      return inferRoomForDebugging(request);
    case "documentation_task":
      if (includesAny(lower, ["blog", "post", "marketing", "article"])) {
        return "marketing";
      }
      return "writer";
    case "review_task":
      if (
        includesAny(lower, [
          "security",
          "auth",
          "token",
          "unsafe",
          "vulnerability",
          "permission"
        ])
      ) {
        return "security";
      }
      if (includesAny(lower, ["compliance", "gdpr", "legal"])) {
        return "security";
      }
      return "architect";
    case "architecture_task":
      if (includesAny(lower, ["scope", "mvp", "strategy", "roadmap"])) {
        return "product";
      }
      return "architect";
    case "next_step":
      return scan.recommendedActions[0]?.room ?? "architect";
  }
}

function buildRecommendation(
  classification: CommandClassification,
  source: CommandSource,
  request: string,
  contract: RoomAiContractEntry[],
  onboarding: OnboardingAnalysis | null,
  scan: ProjectScan
): CommandRecommendation {
  const room = pickRecommendedRoom(classification, request, onboarding, scan);
  const contractEntry = contract.find((entry) => entry.room === room) ?? DEFAULT_CONTRACT[0];
  const sourceBasis = dedupe(
    [
      source === "onboarding"
        ? `Onboarding signal: recommended first room is ${onboarding?.readiness.recommendedFirstRoom ?? room}.`
        : "",
      source === "brownfield"
        ? `Brownfield signal: first recommended action is ${scan.recommendedActions[0]?.title ?? "not yet available"}.`
        : "",
      scan.architectureSignals[0] ? `Repo signal: ${scan.architectureSignals[0]}` : "",
      scan.riskAreas[0] ? `Risk signal: ${scan.riskAreas[0]}` : ""
    ],
    4
  );

  let reason = `${contractEntry.room} owns ${contractEntry.responsibility}, which matches this command best.`;

  if (classification.intent === "new_idea") {
    reason =
      onboarding?.draftPreview.nextActions[0] ??
      "This request is still in shaping mode, so Jarvis should route it through a decision-making room first.";
  } else if (classification.intent === "existing_project_learning") {
    reason =
      scan.recommendedActions[0]?.reason ??
      "The repo needs a stable architecture model before more aggressive task routing starts.";
  } else if (classification.intent === "implementation_task") {
    reason = `This is a bounded build request, so Jarvis is routing it to ${room} with an execution-first lens.`;
  } else if (classification.intent === "debugging_task") {
    reason = `This looks like an active issue, so Jarvis is routing it to ${room} for concrete diagnosis rather than broad project shaping.`;
  } else if (classification.intent === "documentation_task") {
    reason = "Documentation and drafting default to the writer room with Gemini unless a strategic decision is needed.";
  } else if (classification.intent === "review_task") {
    reason = "Review and contradiction resolution should stay explicit, so Jarvis is routing this through a judgment-oriented room.";
  } else if (classification.intent === "architecture_task") {
    reason = "Architecture and workflow decisions should stay in the architect room instead of being buried inside an implementation thread.";
  }

  return {
    room,
    ai: contractEntry.defaultAi,
    reason,
    contractBasis: `${contractEntry.room} defaults to ${contractEntry.defaultAi}${contractEntry.secondaryAi ? ` with ${contractEntry.secondaryAi} as fallback` : ""}. ${contractEntry.notes ?? ""}`.trim(),
    sourceBasis
  };
}

function buildProjectSignals(scan: ProjectScan): string[] {
  return dedupe(
    [
      scan.likelyProjectType[0] ? `Project type: ${scan.likelyProjectType[0]}` : "",
      scan.frameworks.length > 0 ? `Frameworks: ${scan.frameworks.join(", ")}` : "",
      scan.runtimes.length > 0 ? `Runtimes: ${scan.runtimes.join(", ")}` : "",
      scan.testing.length > 0 ? `Testing: ${scan.testing.join(", ")}` : "",
      scan.deployment.length > 0 ? `Deployment: ${scan.deployment.join(", ")}` : "",
      scan.architectureSignals[0] ?? ""
    ],
    6
  );
}

function buildTaskContext(
  source: CommandSource,
  request: string,
  onboarding: OnboardingAnalysis | null,
  scan: ProjectScan
): string[] {
  if (source === "onboarding" && onboarding) {
    return dedupe(
      [
        ...onboarding.commanderModel.firstExecutionSlice,
        ...onboarding.commanderModel.blockingDecisions,
        ...onboarding.draftPreview.nextActions
      ],
      7
    );
  }

  if (source === "brownfield") {
    return dedupe(
      [
        ...scan.architectureSignals,
        ...scan.unresolvedQuestions,
        ...scan.recommendedActions.map((action) => `${action.title}: ${action.reason}`)
      ],
      7
    );
  }

  return dedupe(
    [
      request ? `Commander request: ${request.trim()}` : "",
      scan.architectureSignals[0] ?? "",
      scan.recommendedActions[0]
        ? `Current best repo move: ${scan.recommendedActions[0].title}`
        : ""
    ],
    5
  );
}

function packageFit(
  ai: string,
  recommendation: CommandRecommendation,
  entry: RoomAiContractEntry
): LaunchPackage["fit"] {
  if (ai === recommendation.ai) {
    return "primary";
  }

  if (entry.secondaryAi === ai) {
    return "supporting";
  }

  return "stretch";
}

function packageUsage(ai: string, fit: LaunchPackage["fit"], room: string): string {
  if (ai === "Claude") {
    return fit === "primary"
      ? `Use for the main ${room} decision, review, or scope call.`
      : "Use when the task needs deeper strategic judgment or contradiction resolution before execution.";
  }

  if (ai === "Codex") {
    return fit === "primary"
      ? `Use for bounded ${room} execution and concrete file-level progress.`
      : "Use when the commander wants a tighter implementation slice after the decision layer is clear.";
  }

  return fit === "primary"
    ? `Use for the main ${room} drafting, research, or long-context synthesis pass.`
    : "Use when the commander wants broader synthesis, documentation support, or ecosystem context around the task.";
}

function buildExpectedOutput(ai: string): string[] {
  if (ai === "Claude") {
    return [
      "Return the recommended approach and the main tradeoffs.",
      "Call out contradictions, missing information, and the smallest sensible next step.",
      "Keep the answer proposal-first unless explicit write approval exists."
    ];
  }

  if (ai === "Codex") {
    return [
      "Return the bounded execution slice, target files or surfaces, and verification plan.",
      "Keep implementation explicit and avoid widening scope beyond the requested task.",
      "Stay proposal-first unless explicit write approval exists."
    ];
  }

  return [
    "Return the synthesized context, research or documentation draft, and the key decisions still open.",
    "Make the long-context or drafting value visible rather than generic.",
    "Stay proposal-first unless explicit write approval exists."
  ];
}

function toTaggedBlock(tag: string, lines: string[]): string {
  return [`<${tag}>`, ...lines.map((line) => `- ${line}`), `</${tag}>`].join("\n");
}

function buildLaunchPackages(
  classification: CommandClassification,
  recommendation: CommandRecommendation,
  contract: RoomAiContractEntry[],
  handoffSummary: string[],
  taskContext: string[],
  roomContext: {
    identity: string[];
    promptRules: string[];
    contextState: string[];
  },
  repoTruth: string[]
): LaunchPackage[] {
  const roomEntry = contract.find((entry) => entry.room === recommendation.room) ?? DEFAULT_CONTRACT[0];
  const projectContext = dedupe(
    [
      ...handoffSummary,
      ...taskContext,
      ...roomContext.identity,
      ...roomContext.contextState,
      ...repoTruth
    ],
    14
  );

  return ["Claude", "Codex", "Gemini"].map((ai) => {
    const fit = packageFit(ai, recommendation, roomEntry);
    const contextUsed = dedupe(
      [
        "handoff summary",
        "project discovery signals",
        `${recommendation.room} room identity`,
        `${recommendation.room} room context`,
        "repo-local production truth",
        `${recommendation.room} room prompt rules`
      ],
      6
    );

    return {
      ai,
      room: recommendation.room,
      fit,
      usage: packageUsage(ai, fit, recommendation.room),
      contextUsed,
      prompt: [
        `You are operating as ${ai} for the ${recommendation.room} room.`,
        toTaggedBlock("task_intent", [
          `Task intent: ${classification.label}`,
          `Why Jarvis routed here: ${recommendation.reason}`,
          `Room contract basis: ${recommendation.contractBasis}`
        ]),
        toTaggedBlock("project_context", projectContext),
        toTaggedBlock("room_guidance", roomContext.promptRules),
        toTaggedBlock("operating_rules", [
          "Keep `.nexus` portable and generic.",
          "Treat `production/` as repo-specific Jarvis build truth when it exists.",
          "Stay proposal-first; do not introduce write flows unless explicitly approved."
        ]),
        toTaggedBlock("expected_output", buildExpectedOutput(ai))
      ].join("\n")
    };
  });
}

function buildNextMoves(
  classification: CommandClassification,
  recommendation: CommandRecommendation,
  onboarding: OnboardingAnalysis | null,
  scan: ProjectScan
): string[] {
  if (classification.intent === "new_idea" && onboarding) {
    return dedupe(
      [
        ...(onboarding.rounds[0]?.questions ?? []),
        ...onboarding.commanderModel.recommendedNextMoves,
        `Launch ${recommendation.ai} in the ${recommendation.room} room with the package below.`
      ],
      5
    );
  }

  if (classification.intent === "existing_project_learning") {
    return dedupe(
      [
        ...scan.unresolvedQuestions,
        ...scan.recommendedActions.map(
          (action) => `${action.room} + ${action.ai}: ${action.title}`
        ),
        `Start with ${recommendation.room} + ${recommendation.ai} to convert repo scan into a bounded next move.`
      ],
      5
    );
  }

  return dedupe(
    [
      `Route this request to ${recommendation.room} + ${recommendation.ai}.`,
      "Use the primary package first and only widen scope if the answer exposes a real blocker.",
      scan.riskAreas[0] ? `Respect this risk first: ${scan.riskAreas[0]}` : ""
    ],
    4
  );
}

export async function buildCommandPlan(input: {
  request?: string;
  source?: CommandSource;
}): Promise<CommandPlan> {
  const request = input.request?.trim() ?? "";
  const source = input.source ?? "direct";
  const [contract, overview, scan] = await Promise.all([
    readRoomAiContract(),
    readOverviewState(),
    scanProjectRoot()
  ]);

  const onboarding =
    source === "onboarding" && request ? analyzeOnboardingInput(request) : null;
  const classification = classifyIntent(request, source);
  const recommendation = buildRecommendation(
    classification,
    source,
    request,
    contract,
    onboarding,
    scan
  );
  const taskContext = buildTaskContext(source, request, onboarding, scan);
  const [roomContext, repoTruth] = await Promise.all([
    readRoomContextBundle(recommendation.room),
    readRepoTruthSummary()
  ]);

  return {
    source,
    request,
    classification,
    recommendation,
    projectState: {
      handoffSummary: overview.handoffSummary,
      projectSignals: buildProjectSignals(scan),
      riskAreas: scan.riskAreas.slice(0, 4)
    },
    nextMoves: buildNextMoves(classification, recommendation, onboarding, scan),
    launchPackages: buildLaunchPackages(
      classification,
      recommendation,
      contract,
      overview.handoffSummary,
      taskContext,
      roomContext,
      repoTruth
    )
  };
}
