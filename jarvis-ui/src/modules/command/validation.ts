import { buildCommandPlan } from "@/modules/command/engine";
import type {
  CommandValidationCase,
  CommandValidationReport,
  CommandValidationResult
} from "@/modules/command/types";

const VALIDATION_CASES: CommandValidationCase[] = [
  {
    id: "CMD-001",
    inputShape: "messy greenfield idea",
    request:
      "I need a SaaS to automate client intake and I only know the pain is all over email and spreadsheets",
    source: "direct",
    expectedIntent: ["new_idea"],
    expectedRooms: ["product", "architect"],
    expectedAis: ["Claude"],
    notes: "should surface ambiguity and push clarification"
  },
  {
    id: "CMD-002",
    inputShape: "frontend implementation",
    request: "Build the command center page UI and keep it clean on mobile",
    source: "direct",
    expectedIntent: ["implementation_task"],
    expectedRooms: ["frontend"],
    expectedAis: ["Codex"],
    notes: "should not route to architect by default"
  },
  {
    id: "CMD-003",
    inputShape: "backend implementation",
    request: "Add an API route that returns the launch package plan",
    source: "direct",
    expectedIntent: ["implementation_task"],
    expectedRooms: ["backend"],
    expectedAis: ["Codex"],
    notes: "should emphasize bounded execution"
  },
  {
    id: "CMD-004",
    inputShape: "debugging",
    request: "The startup status API is failing and I need the root cause",
    source: "direct",
    expectedIntent: ["debugging_task"],
    expectedRooms: ["backend"],
    expectedAis: ["Codex"],
    notes: "if issue spans systems, architect can appear in next moves"
  },
  {
    id: "CMD-005",
    inputShape: "architecture",
    request: "We need to decide whether command planning should be server-only or partly client-side",
    source: "direct",
    expectedIntent: ["architecture_task"],
    expectedRooms: ["architect"],
    expectedAis: ["Claude"],
    notes: "should frame tradeoffs"
  },
  {
    id: "CMD-006",
    inputShape: "review",
    request: "Review this flow for architecture drift and hidden risks",
    source: "direct",
    expectedIntent: ["review_task"],
    expectedRooms: ["architect"],
    expectedAis: ["Claude"],
    notes: "should remain judgment-oriented"
  },
  {
    id: "CMD-007",
    inputShape: "docs",
    request: "Write the README section for how command routing works",
    source: "direct",
    expectedIntent: ["documentation_task"],
    expectedRooms: ["writer"],
    expectedAis: ["Gemini"],
    notes: "Claude may appear as fallback for accuracy review"
  },
  {
    id: "CMD-008",
    inputShape: "brownfield continuation",
    request: "",
    source: "brownfield",
    expectedIntent: ["existing_project_learning"],
    expectedRooms: ["architect"],
    expectedAis: ["Claude"],
    notes: "should convert repo scan into the next bounded move"
  },
  {
    id: "CMD-009",
    inputShape: "security-flavored bug",
    request: "Auth token handling looks unsafe. Help me review it.",
    source: "direct",
    expectedIntent: ["debugging_task", "review_task"],
    expectedRooms: ["security"],
    expectedAis: ["Claude"],
    notes: "should not down-route to backend implementation by default"
  },
  {
    id: "CMD-010",
    inputShape: "testing",
    request: "We need coverage around command routing before we trust it",
    source: "direct",
    expectedIntent: ["implementation_task"],
    expectedRooms: ["qa"],
    expectedAis: ["Codex"],
    notes: "should frame test-first follow-up"
  },
  {
    id: "CMD-011",
    inputShape: "ambiguous multitask",
    request: "Fix the bug in the user profile API and update the CSS for the profile picture.",
    source: "direct",
    expectedIntent: ["debugging_task", "implementation_task"],
    expectedRooms: ["architect", "backend", "frontend"],
    expectedAis: ["Claude", "Codex"],
    notes: "multi-room tasks should ideally route to architect or the first mentioned room"
  },
  {
    id: "CMD-012",
    inputShape: "vague performance",
    request: "The site feels slow on mobile.",
    source: "direct",
    expectedIntent: ["debugging_task", "architecture_task", "next_step"],
    expectedRooms: ["architect", "frontend"],
    expectedAis: ["Claude", "Codex"],
    notes: "performance issues are often cross-cutting or UI-heavy"
  },
  {
    id: "CMD-013",
    inputShape: "marketing/content",
    request: "Draft a blog post about our new protocol hardening.",
    source: "direct",
    expectedIntent: ["documentation_task"],
    expectedRooms: ["marketing", "writer"],
    expectedAis: ["Gemini"],
    notes: "should recognize marketing/blog context"
  },
  {
    id: "CMD-014",
    inputShape: "devops/infrastructure",
    request: "The CI pipeline is failing on the linting step.",
    source: "direct",
    expectedIntent: ["debugging_task"],
    expectedRooms: ["devops"],
    expectedAis: ["Codex"],
    notes: "should route to devops for pipeline issues"
  },
  {
    id: "CMD-015",
    inputShape: "data/schema",
    request: "We need to add a last_login_at field to the users table and sync it with the login API.",
    source: "direct",
    expectedIntent: ["implementation_task"],
    expectedRooms: ["data", "backend"],
    expectedAis: ["Claude", "Codex"],
    notes: "schema changes should involve the data room"
  },
  {
    id: "CMD-016",
    inputShape: "high-level strategy",
    request: "What should our MVP scope be for the first customer pilot?",
    source: "direct",
    expectedIntent: ["new_idea", "architecture_task"],
    expectedRooms: ["product", "architect"],
    expectedAis: ["Claude"],
    notes: "strategy and scope are high-level tasks"
  },
  {
    id: "CMD-017",
    inputShape: "out-of-scope/nonsense",
    request: "Explain quantum physics to me.",
    source: "direct",
    expectedIntent: ["documentation_task", "next_step"],
    expectedRooms: ["writer", "architect"],
    expectedAis: ["Gemini", "Claude"],
    notes: "non-project tasks should be handled gracefully"
  },
  {
    id: "CMD-018",
    inputShape: "cross-cutting constraint",
    request: "Everything we build must be GDPR compliant. Check our current auth flow.",
    source: "direct",
    expectedIntent: ["review_task"],
    expectedRooms: ["security", "architect"],
    expectedAis: ["Claude"],
    notes: "compliance and security review"
  },
  {
    id: "CMD-019",
    inputShape: "specific code reference",
    request: "In jarvis-ui/src/modules/command/engine.ts, the intent classification logic looks too simple. Refactor it.",
    source: "direct",
    expectedIntent: ["implementation_task", "architecture_task"],
    expectedRooms: ["architect", "backend"],
    expectedAis: ["Claude", "Codex"],
    notes: "refactoring core logic often involves architect or the relevant domain"
  },
  {
    id: "CMD-020",
    inputShape: "rambling/poorly formatted",
    request: "ok so... i was thinking... maybe we can add a thing... like a chat box... but not exactly a chat box... you know? like for help. but it should be everywhere.",
    source: "direct",
    expectedIntent: ["new_idea", "implementation_task"],
    expectedRooms: ["product", "frontend"],
    expectedAis: ["Claude", "Codex"],
    notes: "should extract intent from messy natural language"
  }
] as const;

function evaluateCaseResult(
  testCase: CommandValidationCase,
  actualIntent: string,
  actualRoom: string,
  actualAi: string,
  reason: string
): CommandValidationResult {
  const mismatches: string[] = [];

  if (!testCase.expectedIntent.includes(actualIntent as CommandValidationCase["expectedIntent"][number])) {
    mismatches.push(
      `Expected intent ${testCase.expectedIntent.join(" or ")}, got ${actualIntent}.`
    );
  }

  if (!testCase.expectedRooms.includes(actualRoom)) {
    mismatches.push(
      `Expected room ${testCase.expectedRooms.join(" or ")}, got ${actualRoom}.`
    );
  }

  if (!testCase.expectedAis.includes(actualAi)) {
    mismatches.push(
      `Expected AI ${testCase.expectedAis.join(" or ")}, got ${actualAi}.`
    );
  }

  return {
    testCase,
    actualIntent: actualIntent as CommandValidationResult["actualIntent"],
    actualRoom,
    actualAi,
    passed: mismatches.length === 0,
    mismatches,
    reason
  };
}

export async function runCommandValidationMatrix(): Promise<CommandValidationReport> {
  const results = await Promise.all(
    VALIDATION_CASES.map(async (testCase) => {
      const plan = await buildCommandPlan({
        request: testCase.request,
        source: testCase.source
      });

      return evaluateCaseResult(
        testCase,
        plan.classification.intent,
        plan.recommendation.room,
        plan.recommendation.ai,
        plan.recommendation.reason
      );
    })
  );

  const passed = results.filter((result) => result.passed).length;

  return {
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed
    },
    results
  };
}
