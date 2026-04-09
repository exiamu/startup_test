export type ProjectFileSummary = {
  path: string;
  reason: string;
};

export type ProjectArea = {
  path: string;
  kind: string;
  sampleChildren: string[];
};

export type ManifestSummary = {
  path: string;
  summary: string[];
};

export type RecommendedAction = {
  title: string;
  room: string;
  ai: string;
  reason: string;
};

export type RoomContextProposal = {
  room: string;
  ai: string;
  focus: string;
  relevantPaths: string[];
  openQuestions: string[];
};

export type ProjectDraft = {
  identity: string[];
  architecture: string[];
  nextActions: string[];
};

export type ProjectScan = {
  projectRoot: string;
  topLevelDirectories: string[];
  topLevelFiles: string[];
  signals: {
    packageJson: boolean;
    pyproject: boolean;
    requirementsTxt: boolean;
    dockerfile: boolean;
    gitRepo: boolean;
    srcDir: boolean;
    appDir: boolean;
    tests: boolean;
    ci: boolean;
    readme: boolean;
  };
  likelyProjectType: string[];
  frameworks: string[];
  packageManagers: string[];
  runtimes: string[];
  testing: string[];
  deployment: string[];
  documentation: string[];
  manifests: ManifestSummary[];
  keyFiles: ProjectFileSummary[];
  codeAreas: ProjectArea[];
  architectureSignals: string[];
  riskAreas: string[];
  unresolvedQuestions: string[];
  recommendedActions: RecommendedAction[];
  roomContextPack: RoomContextProposal[];
  proposedDraft: ProjectDraft;
};
