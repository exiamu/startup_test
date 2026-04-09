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

export type ExecutionRecord = {
  executionId: string;
  sessionId: string | null;
  provider: string;
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
};
