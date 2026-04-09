export type CommandSource = "direct" | "onboarding" | "brownfield";

export type CommandIntent =
  | "new_idea"
  | "existing_project_learning"
  | "implementation_task"
  | "debugging_task"
  | "documentation_task"
  | "review_task"
  | "architecture_task"
  | "next_step";

export type RoomAiContractEntry = {
  room: string;
  responsibility: string;
  defaultAi: string;
  secondaryAi: string | null;
  notes: string | null;
};

export type CommandClassification = {
  intent: CommandIntent;
  label: string;
  summary: string;
};

export type CommandRecommendation = {
  room: string;
  ai: string;
  reason: string;
  contractBasis: string;
  sourceBasis: string[];
};

export type LaunchPackage = {
  ai: string;
  room: string;
  fit: "primary" | "supporting" | "stretch";
  usage: string;
  contextUsed: string[];
  prompt: string;
};

export type CommandPlan = {
  source: CommandSource;
  request: string;
  classification: CommandClassification;
  recommendation: CommandRecommendation;
  projectState: {
    handoffSummary: string[];
    projectSignals: string[];
    riskAreas: string[];
  };
  nextMoves: string[];
  launchPackages: LaunchPackage[];
};

export type CommandValidationCase = {
  id: string;
  inputShape: string;
  request: string;
  source: CommandSource;
  expectedIntent: CommandIntent[];
  expectedRooms: string[];
  expectedAis: string[];
  notes: string;
};

export type CommandValidationResult = {
  testCase: CommandValidationCase;
  actualIntent: CommandIntent;
  actualRoom: string;
  actualAi: string;
  passed: boolean;
  mismatches: string[];
  reason: string;
};

export type CommandValidationReport = {
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  results: CommandValidationResult[];
};
