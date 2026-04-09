export type IdeaBuckets = {
  problem: string[];
  users: string[];
  outcomes: string[];
  technical: string[];
  business: string[];
  constraints: string[];
  unknowns: string[];
};

export type QuestionRound = {
  title: string;
  purpose: string;
  questions: string[];
};

export type DraftPreview = {
  commanderIntent: string[];
  vision: string[];
  constraints: string[];
  architecture: string[];
  mvpScope: string[];
  openQuestions: string[];
  nextActions: string[];
};

export type OnboardingReadiness = {
  confidence: "low" | "medium" | "high";
  strengths: string[];
  gaps: string[];
  contradictions: string[];
  recommendedMode: string;
  recommendedFirstRoom: string;
};

export type CommanderModel = {
  believes: string[];
  stillUnknown: string[];
  blockingDecisions: string[];
  tradeoffs: string[];
  firstExecutionSlice: string[];
  recommendedNextMoves: string[];
};

export type OnboardingAnalysis = {
  rawIdea: string;
  cleanedSummary: string[];
  buckets: IdeaBuckets;
  rounds: QuestionRound[];
  readiness: OnboardingReadiness;
  commanderModel: CommanderModel;
  draftPreview: DraftPreview;
};
