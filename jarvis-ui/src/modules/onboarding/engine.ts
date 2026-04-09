import type {
  CommanderModel,
  DraftPreview,
  IdeaBuckets,
  OnboardingAnalysis,
  OnboardingReadiness,
  QuestionRound
} from "@/modules/onboarding/types";

const PROBLEM_HINTS = [
  "problem",
  "pain",
  "friction",
  "manual",
  "mess",
  "broken",
  "slow",
  "waste",
  "need",
  "struggle"
] as const;

const USER_HINTS = [
  "user",
  "customer",
  "team",
  "developer",
  "founder",
  "operator",
  "client",
  "business",
  "buyer",
  "staff"
] as const;

const OUTCOME_HINTS = [
  "build",
  "ship",
  "launch",
  "mvp",
  "automate",
  "working",
  "production",
  "dashboard",
  "app",
  "platform",
  "tool",
  "workflow"
] as const;

const TECH_HINTS = [
  "api",
  "backend",
  "frontend",
  "python",
  "react",
  "next",
  "database",
  "mobile",
  "desktop",
  "script",
  "automation",
  "agent",
  "saas",
  "web",
  "integration"
] as const;

const BUSINESS_HINTS = [
  "money",
  "revenue",
  "sell",
  "market",
  "pricing",
  "growth",
  "customer",
  "profit",
  "internal efficiency",
  "save time",
  "reduce cost"
] as const;

const CONSTRAINT_HINTS = [
  "budget",
  "deadline",
  "security",
  "compliance",
  "fast",
  "cheap",
  "time",
  "hosting",
  "privacy",
  "hipaa",
  "soc 2",
  "gdpr",
  "local",
  "offline"
] as const;

const ROOM_BY_SIGNAL = [
  { room: "product", hints: ["user", "customer", "market", "pricing", "mvp", "workflow"] },
  { room: "architect", hints: ["platform", "architecture", "system", "integration", "backend"] },
  { room: "frontend", hints: ["ui", "frontend", "dashboard", "web app", "mobile"] },
  { room: "data", hints: ["data", "analytics", "pipeline", "database", "reporting"] }
] as const;

function splitThoughts(input: string): string[] {
  return input
    .split(/\n|[.!?]/g)
    .map((part) => part.replace(/^[-*]\s*/, "").trim())
    .filter((part) => part.length > 0);
}

function includesHint(text: string, hints: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return hints.some((hint) => lower.includes(hint));
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

function firstOrFallback(items: string[], fallback: string): string {
  return items[0] ?? fallback;
}

function bucketize(thoughts: string[]): IdeaBuckets {
  const buckets: IdeaBuckets = {
    problem: [],
    users: [],
    outcomes: [],
    technical: [],
    business: [],
    constraints: [],
    unknowns: []
  };

  thoughts.forEach((thought) => {
    const lower = thought.toLowerCase();
    const matchedBuckets = new Set<keyof IdeaBuckets>();

    if (includesHint(lower, PROBLEM_HINTS)) {
      buckets.problem.push(thought);
      matchedBuckets.add("problem");
    }

    if (includesHint(lower, USER_HINTS) || /\bfor\s+[a-z]/i.test(thought)) {
      buckets.users.push(thought);
      matchedBuckets.add("users");
    }

    if (
      includesHint(lower, OUTCOME_HINTS) ||
      lower.startsWith("i want") ||
      lower.startsWith("we need") ||
      lower.includes("should")
    ) {
      buckets.outcomes.push(thought);
      matchedBuckets.add("outcomes");
    }

    if (includesHint(lower, TECH_HINTS)) {
      buckets.technical.push(thought);
      matchedBuckets.add("technical");
    }

    if (includesHint(lower, BUSINESS_HINTS)) {
      buckets.business.push(thought);
      matchedBuckets.add("business");
    }

    if (
      includesHint(lower, CONSTRAINT_HINTS) ||
      lower.includes("must") ||
      lower.includes("cannot") ||
      lower.includes("can't")
    ) {
      buckets.constraints.push(thought);
      matchedBuckets.add("constraints");
    }

    if (matchedBuckets.size === 0) {
      buckets.unknowns.push(thought);
    }
  });

  return {
    problem: dedupe(buckets.problem),
    users: dedupe(buckets.users),
    outcomes: dedupe(buckets.outcomes),
    technical: dedupe(buckets.technical),
    business: dedupe(buckets.business),
    constraints: dedupe(buckets.constraints),
    unknowns: dedupe(buckets.unknowns)
  };
}

function findContradictions(rawIdea: string, buckets: IdeaBuckets): string[] {
  const lower = rawIdea.toLowerCase();
  const contradictions: string[] = [];

  if (
    (lower.includes("fast") || lower.includes("quick")) &&
    (lower.includes("enterprise") || lower.includes("bank-grade") || lower.includes("fully secure"))
  ) {
    contradictions.push(
      "Speed is emphasized alongside enterprise-grade assurance. Jarvis should force a tradeoff between launch velocity and compliance depth."
    );
  }

  if (
    (lower.includes("cheap") || lower.includes("low budget")) &&
    (lower.includes("top tier") || lower.includes("best") || lower.includes("premium"))
  ) {
    contradictions.push(
      "Budget pressure conflicts with premium-scope expectations. Scope and quality targets need a harder first-release boundary."
    );
  }

  if (
    (lower.includes("simple script") || lower.includes("small tool")) &&
    (lower.includes("platform") || lower.includes("multi-tenant") || lower.includes("saas"))
  ) {
    contradictions.push(
      "The prompt mixes lightweight-tool language with platform-scale language. Jarvis should confirm the actual product shape before architecture hardens."
    );
  }

  if (buckets.outcomes.length > 0 && buckets.users.length === 0) {
    contradictions.push(
      "There is clear build intent, but the first real user or buyer is still missing."
    );
  }

  return contradictions;
}

function getGapList(buckets: IdeaBuckets): string[] {
  const gaps: string[] = [];

  if (buckets.problem.length === 0) {
    gaps.push("The core problem is still vague.");
  }

  if (buckets.users.length === 0) {
    gaps.push("The first real user or buyer is not yet clear.");
  }

  if (buckets.outcomes.length === 0) {
    gaps.push("The first successful outcome is not described concretely.");
  }

  if (buckets.technical.length === 0) {
    gaps.push("The product form is still open: app, automation, API, internal tool, or something else.");
  }

  if (buckets.constraints.length === 0) {
    gaps.push("Timeline, budget, security, or deployment constraints are still missing.");
  }

  return gaps;
}

function inferConfidence(
  buckets: IdeaBuckets,
  contradictions: string[]
): OnboardingReadiness["confidence"] {
  const strongBuckets = [
    buckets.problem,
    buckets.users,
    buckets.outcomes,
    buckets.technical,
    buckets.constraints
  ].filter((bucket) => bucket.length > 0).length;

  if (strongBuckets >= 4 && contradictions.length === 0) {
    return "high";
  }

  if (strongBuckets >= 3) {
    return "medium";
  }

  return "low";
}

function inferMode(buckets: IdeaBuckets): string {
  if (buckets.business.length > 0 && buckets.technical.length === 0) {
    return "Strategy-heavy greenfield";
  }

  if (buckets.technical.length > 0 && buckets.problem.length === 0) {
    return "Execution-heavy concept";
  }

  if (buckets.problem.length > 0 && buckets.outcomes.length > 0) {
    return "Balanced product shaping";
  }

  return "Exploratory first contact";
}

function inferFirstRoom(rawIdea: string): string {
  const lower = rawIdea.toLowerCase();

  for (const option of ROOM_BY_SIGNAL) {
    if (option.hints.some((hint) => lower.includes(hint))) {
      return option.room;
    }
  }

  return "architect";
}

function buildAdaptiveRound(
  title: string,
  purpose: string,
  questions: string[],
  includeWhen: boolean
): QuestionRound[] {
  return includeWhen ? [{ title, purpose, questions }] : [];
}

function buildQuestionRounds(
  buckets: IdeaBuckets,
  contradictions: string[],
  commanderModel: CommanderModel
): QuestionRound[] {
  const rounds: QuestionRound[] = [];

  rounds.push(
    ...buildAdaptiveRound(
      "Vision round",
      "Tighten why this project should exist and who it matters to first.",
      [
        buckets.problem.length === 0
          ? "What exact pain, waste, or failure are we removing first?"
          : "Which part of the problem hurts enough that it should anchor the first release?",
        buckets.users.length === 0
          ? "Who is the first real user, buyer, or operator?"
          : "Which user matters most in release one, and who can wait?",
        "Why does this need to exist now instead of later?"
      ],
      true
    )
  );

  rounds.push(
    ...buildAdaptiveRound(
      "Outcome round",
      "Turn rough intent into a first-release boundary Jarvis can plan against.",
      [
        buckets.outcomes.length === 0
          ? "What should a first successful version do end to end?"
          : "Which outcome is mandatory for MVP, and which outcomes are later-phase ambitions?",
        "What is explicitly out of scope for version one?",
        commanderModel.firstExecutionSlice[0] ??
          "What is the smallest complete slice we can finish without faking the core value?"
      ],
      true
    )
  );

  rounds.push(
    ...buildAdaptiveRound(
      "Product round",
      "Turn the idea into user flows and a sharper first delivery slice.",
      [
        "What is the first user-visible flow Jarvis should protect above everything else?",
        "What feature sounds exciting but should be cut from version one?",
        "What would make the first user say this is genuinely useful, not just interesting?"
      ],
      true
    )
  );

  rounds.push(
    ...buildAdaptiveRound(
      "Technical round",
      "Reduce product-shape ambiguity without locking architecture too early.",
      [
        buckets.technical.length === 0
          ? "Is this primarily a web app, automation system, API, script, internal tool, or platform?"
          : "Which technical shape should lead version one, even if the long-term system becomes broader?",
        "What existing tools, services, or codebases must it connect to?",
        "Are there any stack preferences, hosting assumptions, or non-negotiable technical constraints?"
      ],
      true
    )
  );

  rounds.push(
    ...buildAdaptiveRound(
      "Constraint round",
      "Expose the real limits shaping architecture and scope.",
      [
        buckets.constraints.length === 0
          ? "What budget, timeline, and deployment realities should constrain the first release?"
          : "Which stated constraints are truly hard limits versus preferences?",
        "How sensitive is the data or workflow this will touch?",
        "Who needs to approve this before it is considered real?"
      ],
      true
    )
  );

  if (buckets.business.length === 0) {
    rounds.push({
      title: "Business round",
      purpose: "Clarify how the project creates leverage so Jarvis can scope appropriately.",
      questions: [
        "Does this make money, save time, reduce cost, or create strategic leverage first?",
        "Who benefits enough to pay, sponsor, or adopt it?",
        "What business result matters most in the first release?"
      ]
    });
  }

  if (contradictions.length > 0) {
    rounds.push({
      title: "Tradeoff round",
      purpose: "Resolve conflicts before they harden into bad architecture or bloated scope.",
      questions: contradictions.map(
        (contradiction) => `Resolve this tension: ${contradiction}`
      )
    });
  }

  if (commanderModel.blockingDecisions.length > 0) {
    rounds.push({
      title: "Decision round",
      purpose: "Identify the calls the commander must make before Jarvis can confidently plan execution.",
      questions: commanderModel.blockingDecisions.map(
        (decision) => `Confirm this blocking decision: ${decision}`
      )
    });
  }

  return rounds;
}

function buildReadiness(rawIdea: string, buckets: IdeaBuckets): OnboardingReadiness {
  const contradictions = findContradictions(rawIdea, buckets);
  const gaps = getGapList(buckets);

  return {
    confidence: inferConfidence(buckets, contradictions),
    strengths: [
      buckets.problem.length > 0 ? "Jarvis has a visible problem signal to work from." : "",
      buckets.outcomes.length > 0
        ? "There is a concrete build or outcome signal already present."
        : "",
      buckets.technical.length > 0
        ? "The prompt includes at least one technical shape or implementation hint."
        : "",
      buckets.business.length > 0
        ? "Value creation or monetization intent is already visible."
        : ""
    ].filter(Boolean),
    gaps,
    contradictions,
    recommendedMode: inferMode(buckets),
    recommendedFirstRoom: inferFirstRoom(rawIdea)
  };
}

function buildCommanderModel(
  buckets: IdeaBuckets,
  readiness: OnboardingReadiness
): CommanderModel {
  const believes = [
    `Jarvis believes the core problem is: ${firstOrFallback(
      buckets.problem,
      "still not sharp enough to trust"
    )}`,
    `Jarvis believes the first user or buyer is: ${firstOrFallback(
      buckets.users,
      "still unclear"
    )}`,
    `Jarvis believes the first visible outcome is: ${firstOrFallback(
      buckets.outcomes,
      "still too vague"
    )}`,
    `Jarvis believes the leading product shape is: ${firstOrFallback(
      buckets.technical,
      "still open"
    )}`
  ];

  const stillUnknown = readiness.gaps.length > 0 ? readiness.gaps : ["Jarvis does not see critical gaps in the first pass."];

  const blockingDecisions = dedupe(
    [
      buckets.users.length === 0 ? "Name the first real user or buyer." : "",
      buckets.outcomes.length === 0 ? "Define the minimum complete outcome for version one." : "",
      buckets.technical.length === 0 ? "Choose the leading product form for release one." : "",
      buckets.constraints.length === 0 ? "Clarify the hard limits around time, budget, and deployment." : "",
      readiness.contradictions[0] ?? ""
    ].filter(Boolean)
  ).slice(0, 4);

  const tradeoffs =
    readiness.contradictions.length > 0
      ? readiness.contradictions
      : [
          buckets.business.length > 0 && buckets.constraints.length === 0
            ? "Growth or revenue ambition exists, but the cost/time constraints are still soft."
            : "",
          buckets.technical.length > 0 && buckets.users.length === 0
            ? "Implementation shape is forming faster than user clarity."
            : "",
          buckets.outcomes.length > 0 && buckets.problem.length === 0
            ? "Desired outcomes are clearer than the underlying pain they are supposed to solve."
            : ""
        ].filter(Boolean);

  const firstExecutionSlice = [
    `First execution slice: ${firstOrFallback(
      buckets.outcomes,
      "define the smallest complete flow before implementation planning begins"
    )}`,
    `Primary audience for that slice: ${firstOrFallback(
      buckets.users,
      "name the first operator, user, or buyer"
    )}`,
    "Everything outside the first demonstrable value loop should remain out of MVP until explicitly promoted."
  ];

  const recommendedNextMoves = [
    `Run the next question round through the ${readiness.recommendedFirstRoom} lens first.`,
    "Lock the MVP boundary before expanding features or architecture complexity.",
    "Keep turning rough signals into draft truth, not committed truth."
  ];

  return {
    believes,
    stillUnknown,
    blockingDecisions,
    tradeoffs,
    firstExecutionSlice,
    recommendedNextMoves
  };
}

function buildDraftPreview(
  buckets: IdeaBuckets,
  readiness: OnboardingReadiness,
  commanderModel: CommanderModel
): DraftPreview {
  return {
    commanderIntent: [
      `Proposed operating mode: ${readiness.recommendedMode}`,
      `Proposed first room: ${readiness.recommendedFirstRoom}`,
      `Commander signal: ${firstOrFallback(
        buckets.outcomes,
        "Jarvis still needs a firmer outcome statement before planning."
      )}`
    ],
    vision: [
      `Problem draft: ${firstOrFallback(
        buckets.problem,
        "The problem statement still needs tightening."
      )}`,
      `User draft: ${firstOrFallback(
        buckets.users,
        "The first real user or buyer is still unclear."
      )}`,
      `Outcome draft: ${firstOrFallback(
        buckets.outcomes,
        "The success state still needs clarification."
      )}`
    ],
    constraints: [
      `Constraint draft: ${firstOrFallback(
        buckets.constraints,
        "No hard constraints were stated yet."
      )}`,
      `Business draft: ${firstOrFallback(
        buckets.business,
        "The value model is still soft and should be clarified."
      )}`,
      `Draft confidence: ${readiness.confidence}`
    ],
    architecture: [
      "Keep `.nexus` portable and generic; project-specific truth should stay in proposal form until approved.",
      "Maintain read-heavy, approval-gated behavior before introducing any write automation.",
      `Probable product shape: ${firstOrFallback(
        buckets.technical,
        "Jarvis still needs a confirmed product form."
      )}`
    ],
    mvpScope: commanderModel.firstExecutionSlice,
    openQuestions:
      commanderModel.blockingDecisions.length > 0
        ? commanderModel.blockingDecisions
        : commanderModel.stillUnknown,
    nextActions: [
      ...commanderModel.recommendedNextMoves,
      `Prepare a proposal handoff for the ${readiness.recommendedFirstRoom} room once the commander confirms the direction.`
    ]
  };
}

export function analyzeOnboardingInput(rawIdea: string): OnboardingAnalysis {
  const thoughts = splitThoughts(rawIdea);
  const buckets = bucketize(thoughts);
  const cleanedSummary = dedupe(thoughts).slice(0, 12);
  const readiness = buildReadiness(rawIdea, buckets);
  const commanderModel = buildCommanderModel(buckets, readiness);

  return {
    rawIdea,
    cleanedSummary,
    buckets,
    rounds: buildQuestionRounds(buckets, readiness.contradictions, commanderModel),
    readiness,
    commanderModel,
    draftPreview: buildDraftPreview(buckets, readiness, commanderModel)
  };
}
