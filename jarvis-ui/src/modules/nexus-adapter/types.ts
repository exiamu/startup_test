export type NexusHealth = {
  root: string;
  exists: boolean;
  coreFiles: {
    nexus: boolean;
    handoff: boolean;
    routing: boolean;
    foundingPrompt: boolean;
    roomContract: boolean;
  };
};

export type OverviewState = {
  health: NexusHealth;
  handoffSummary: string[];
};

export type MissionState = "idle" | "advancing" | "recovery" | "blocked";

export type RoomState = {
  name: string;
  promptExists: boolean;
  contextExists: boolean;
  roomExists: boolean;
  currentState: string | null;
  nextAction: string | null;
};

export type VaultDocumentState = {
  name: string;
  exists: boolean;
  status: string | null;
  heading: string | null;
};

export type QueueState = {
  inboxCounts: Record<string, number>;
  outboxCounts: Record<string, number>;
  activeMission: ActiveMissionRecord | null;
  recentTasks: {
    taskId: string;
    title: string;
    room: string;
    provider: string;
    status: TaskStatus;
    updatedAt: string;
    sessionId: string | null;
    executionId: string | null;
  }[];
  recentSessions: {
    sessionId: string;
    updatedAt: string;
    turnCount: number;
    lastRequest: string | null;
    missionState: MissionState;
    missionFocus: string | null;
  }[];
  recentExecutions: {
    executionId: string;
    provider: string;
    room: string;
    status: ExecutionStatus;
    createdAt: string;
    outputPath: string | null;
    sessionId: string | null;
  }[];
};

export type RoomDetailState = {
  name: string;
  roomMarkdown: string | null;
  promptMarkdown: string | null;
  contextMarkdown: string | null;
};

export type ArtifactNode = {
  name: string;
  path: string;
  kind: "file" | "directory";
};

export type ArtifactDirectoryState = {
  currentPath: string;
  entries: ArtifactNode[];
};

export type ArtifactFileState = {
  path: string;
  content: string | null;
};

export type ExecutionStatus = "planned" | "running" | "completed" | "failed" | "blocked";

export type TaskStatus = "planned" | "running" | "completed" | "failed" | "blocked";

export type TaskRecord = {
  taskId: string;
  sessionId: string | null;
  turnId: string | null;
  executionId: string | null;
  title: string;
  request: string;
  room: string;
  provider: string;
  intent: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  outputPath: string | null;
  errorMessage: string | null;
};

export type ExecutionRecord = {
  executionId: string;
  sessionId: string | null;
  turnId: string | null;
  taskId: string | null;
  requestedProvider: string;
  provider: string;
  attemptedProviders: string[];
  fallbackFrom: string | null;
  room: string;
  intent: string;
  prompt: string;
  status: ExecutionStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  outputPath: string | null;
  errorMessage: string | null;
  retryCount: number;
  recoveryNotes: string[];
};

export type CommandSessionTurn = {
  turnId: string;
  createdAt: string;
  request: string;
  source: string;
  intent: string;
  summary: string;
  recommendedRoom: string;
  recommendedAi: string;
  taskId: string | null;
  executionId: string | null;
  executionStatus: ExecutionStatus | null;
};

export type CommandSessionRecord = {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  lastRequest: string | null;
  turns: CommandSessionTurn[];
};

export type ActiveMissionRecord = {
  missionId: string;
  sessionId: string;
  objective: string;
  missionState: MissionState;
  missionDirective: string;
  missionFocus: string | null;
  ambiguitySignals: string[];
  recoverySignals: string[];
  activeTaskIds: string[];
  focusTaskId: string | null;
  latestTurnId: string | null;
  latestExecutionId: string | null;
  latestExecutionStatus: ExecutionStatus | null;
  recommendedRoom: string | null;
  recommendedAi: string | null;
  canContinue: boolean;
  updatedAt: string;
};
