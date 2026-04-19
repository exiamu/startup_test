import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type {
  ActiveMissionRecord,
  CommandSessionRecord,
  CommandSessionTurn,
  ExecutionRecord,
  ExecutionStatus,
  MissionState,
  TaskRecord,
  TaskStatus
} from "@/modules/nexus-adapter/types";

export async function ensureDirectory(segments: string[]): Promise<string> {
  const dirPath = resolveInsideNexus(...segments);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

function getExecutionRecordPath(executionId: string): string {
  return resolveInsideNexus("execution", `${executionId}.json`);
}

function getSessionRecordPath(sessionId: string): string {
  return resolveInsideNexus("sessions", `${sessionId}.json`);
}

function getTaskRecordPath(taskId: string): string {
  return resolveInsideNexus("tasks", `${taskId}.json`);
}

function getActiveMissionPath(): string {
  return resolveInsideNexus("mission", "active.json");
}

function deriveMissionDirective(missionState: MissionState): string {
  if (missionState === "blocked") {
    return "Current work is blocked. Repair or reroute the active task before widening scope.";
  }

  if (missionState === "recovery") {
    return "Recovery is in progress. Let Jarvis stabilize the current task before starting unrelated work.";
  }

  if (missionState === "advancing") {
    return "A mission is already in motion. Continue or refine the active task instead of restarting from scratch.";
  }

  return "No mission is in flight. Shape the next bounded move.";
}

function deriveObjective(session: CommandSessionRecord): string {
  return session.turns[0]?.request ?? session.lastRequest ?? "No active objective recorded yet.";
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

export async function writeExecutionRecord(record: ExecutionRecord): Promise<void> {
  await ensureDirectory(["execution"]);
  const recordPath = getExecutionRecordPath(record.executionId);
  await fs.writeFile(recordPath, JSON.stringify(record, null, 2), "utf8");
}

export async function readExecutionRecord(executionId: string): Promise<ExecutionRecord | null> {
  try {
    const recordPath = getExecutionRecordPath(executionId);
    const raw = await fs.readFile(recordPath, "utf8");
    return JSON.parse(raw) as ExecutionRecord;
  } catch {
    return null;
  }
}

export async function writeCommandSession(session: CommandSessionRecord): Promise<void> {
  await ensureDirectory(["sessions"]);
  const sessionPath = getSessionRecordPath(session.sessionId);
  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), "utf8");
}

export async function writeTaskRecord(task: TaskRecord): Promise<void> {
  await ensureDirectory(["tasks"]);
  const taskPath = getTaskRecordPath(task.taskId);
  await fs.writeFile(taskPath, JSON.stringify(task, null, 2), "utf8");
}

export async function writeActiveMission(record: ActiveMissionRecord): Promise<void> {
  await ensureDirectory(["mission"]);
  const missionPath = getActiveMissionPath();
  await fs.writeFile(missionPath, JSON.stringify(record, null, 2), "utf8");
}

export async function clearActiveMission(): Promise<void> {
  try {
    await fs.unlink(getActiveMissionPath());
  } catch {
    // Nothing to clear.
  }
}

export async function readCommandSession(
  sessionId: string
): Promise<CommandSessionRecord | null> {
  try {
    const sessionPath = getSessionRecordPath(sessionId);
    const raw = await fs.readFile(sessionPath, "utf8");
    return JSON.parse(raw) as CommandSessionRecord;
  } catch {
    return null;
  }
}

export async function readTaskRecord(taskId: string): Promise<TaskRecord | null> {
  try {
    const taskPath = getTaskRecordPath(taskId);
    const raw = await fs.readFile(taskPath, "utf8");
    return JSON.parse(raw) as TaskRecord;
  } catch {
    return null;
  }
}

export async function readActiveMission(): Promise<ActiveMissionRecord | null> {
  try {
    const raw = await fs.readFile(getActiveMissionPath(), "utf8");
    return JSON.parse(raw) as ActiveMissionRecord;
  } catch {
    return null;
  }
}

export async function syncActiveMissionForSession(
  sessionId: string
): Promise<ActiveMissionRecord | null> {
  const session = await readCommandSession(sessionId);

  if (!session) {
    return null;
  }

  const taskIds = session.turns
    .map((turn) => turn.taskId)
    .filter((taskId): taskId is string => Boolean(taskId));
  const tasks = (
    await Promise.all(taskIds.map((taskId) => readTaskRecord(taskId)))
  ).filter((task): task is TaskRecord => Boolean(task));

  const activeTasks = tasks.filter(
    (task) => task.status !== "completed" && task.status !== "failed"
  );
  const blockedTasks = tasks.filter(
    (task) => task.status === "failed" || task.status === "blocked"
  );
  const latestTurn = session.turns.at(-1) ?? null;
  const latestExecution = latestTurn?.executionId
    ? await readExecutionRecord(latestTurn.executionId)
    : null;
  const recoverySignals = dedupe([
    ...blockedTasks.map((task) => {
      const detail = task.errorMessage ? `: ${task.errorMessage}` : "";
      return `Recovery needed for task "${task.title}" [${task.status}]${detail}`;
    }),
    ...(latestExecution?.recoveryNotes ?? [])
  ]).slice(0, 6);

  const missionState: MissionState =
    recoverySignals.length > 0
      ? latestTurn?.executionStatus === "failed" || latestTurn?.executionStatus === "blocked"
        ? "blocked"
        : "recovery"
      : activeTasks.length > 0 || latestTurn?.executionStatus === "running" || latestTurn?.executionStatus === "planned"
        ? "advancing"
        : "idle";

  const ambiguitySignals =
    activeTasks.length > 1
      ? [
          `Multiple active tasks are open (${activeTasks.length}). Jarvis should confirm priority before widening or rerouting work.`
        ]
      : [];

  const focusTask =
    activeTasks.length === 1
      ? activeTasks[0]
      : blockedTasks.length === 1
        ? blockedTasks[0]
        : null;

  const record: ActiveMissionRecord = {
    missionId: `mission-${session.sessionId}`,
    sessionId: session.sessionId,
    objective: deriveObjective(session),
    missionState,
    missionDirective: deriveMissionDirective(missionState),
    missionFocus: focusTask
      ? `${focusTask.title} via ${focusTask.room}/${focusTask.provider} [${focusTask.status}]`
      : null,
    ambiguitySignals,
    recoverySignals,
    activeTaskIds: activeTasks.map((task) => task.taskId),
    focusTaskId: focusTask?.taskId ?? null,
    latestTurnId: latestTurn?.turnId ?? null,
    latestExecutionId: latestTurn?.executionId ?? null,
    latestExecutionStatus: latestTurn?.executionStatus ?? null,
    recommendedRoom: latestTurn?.recommendedRoom ?? focusTask?.room ?? null,
    recommendedAi: latestTurn?.recommendedAi ?? null,
    canContinue:
      missionState === "advancing" &&
      activeTasks.length === 1 &&
      ambiguitySignals.length === 0 &&
      latestTurn?.executionStatus !== "failed" &&
      latestTurn?.executionStatus !== "blocked",
    updatedAt: new Date().toISOString()
  };

  await writeActiveMission(record);
  return record;
}

export async function createCommandSession(
  lastRequest?: string
): Promise<CommandSessionRecord> {
  const now = new Date().toISOString();
  const session: CommandSessionRecord = {
    sessionId: `session-${Date.now()}-${randomBytes(2).toString("hex")}`,
    createdAt: now,
    updatedAt: now,
    lastRequest: lastRequest ?? null,
    turns: []
  };

  await writeCommandSession(session);
  return session;
}

export async function appendCommandSessionTurn(input: {
  sessionId?: string | null;
  request: string;
  source: string;
  intent: string;
  summary: string;
  recommendedRoom: string;
  recommendedAi: string;
}): Promise<{ session: CommandSessionRecord; turn: CommandSessionTurn }> {
  const existing = input.sessionId ? await readCommandSession(input.sessionId) : null;
  const session = existing ?? (await createCommandSession(input.request));
  const now = new Date().toISOString();
  const turn: CommandSessionTurn = {
    turnId: `turn-${Date.now()}-${randomBytes(2).toString("hex")}`,
    createdAt: now,
    request: input.request,
    source: input.source,
    intent: input.intent,
    summary: input.summary,
    recommendedRoom: input.recommendedRoom,
    recommendedAi: input.recommendedAi,
    taskId: null,
    executionId: null,
    executionStatus: null
  };

  const updatedSession: CommandSessionRecord = {
    ...session,
    updatedAt: now,
    lastRequest: input.request,
    turns: [...session.turns, turn]
  };

  await writeCommandSession(updatedSession);
  await syncActiveMissionForSession(updatedSession.sessionId);
  return { session: updatedSession, turn };
}

export async function createTaskRecord(input: {
  sessionId?: string | null;
  turnId?: string | null;
  title: string;
  request: string;
  room: string;
  provider: string;
  intent: string;
}): Promise<TaskRecord> {
  const now = new Date().toISOString();
  const task: TaskRecord = {
    taskId: `task-${Date.now()}-${randomBytes(2).toString("hex")}`,
    sessionId: input.sessionId ?? null,
    turnId: input.turnId ?? null,
    executionId: null,
    title: input.title,
    request: input.request,
    room: input.room,
    provider: input.provider,
    intent: input.intent,
    status: "planned",
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    outputPath: null,
    errorMessage: null
  };

  await writeTaskRecord(task);
  if (task.sessionId) {
    await syncActiveMissionForSession(task.sessionId);
  }
  return task;
}

export async function attachTaskToCommandSessionTurn(input: {
  sessionId: string;
  turnId: string;
  taskId: string;
}): Promise<CommandSessionRecord> {
  const session = await readCommandSession(input.sessionId);

  if (!session) {
    throw new Error(`Session record not found: ${input.sessionId}`);
  }

  const updatedSession: CommandSessionRecord = {
    ...session,
    updatedAt: new Date().toISOString(),
    turns: session.turns.map((turn) =>
      turn.turnId === input.turnId
        ? {
            ...turn,
            taskId: input.taskId
          }
        : turn
    )
  };

  await writeCommandSession(updatedSession);
  await syncActiveMissionForSession(updatedSession.sessionId);
  return updatedSession;
}

export async function updateCommandSessionTurnExecution(input: {
  sessionId: string;
  turnId: string;
  taskId?: string;
  executionId?: string;
  executionStatus?: ExecutionStatus;
}): Promise<CommandSessionRecord> {
  const session = await readCommandSession(input.sessionId);

  if (!session) {
    throw new Error(`Session record not found: ${input.sessionId}`);
  }

  const updatedSession: CommandSessionRecord = {
    ...session,
    updatedAt: new Date().toISOString(),
    turns: session.turns.map((turn) =>
      turn.turnId === input.turnId
        ? {
            ...turn,
            taskId: input.taskId ?? turn.taskId,
            executionId: input.executionId ?? turn.executionId,
            executionStatus: input.executionStatus ?? turn.executionStatus
          }
        : turn
    )
  };

  await writeCommandSession(updatedSession);
  await syncActiveMissionForSession(updatedSession.sessionId);
  return updatedSession;
}

export async function updateTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
  executionId?: string;
  provider?: string;
  outputPath?: string;
  errorMessage?: string;
}): Promise<TaskRecord> {
  const existing = await readTaskRecord(input.taskId);

  if (!existing) {
    throw new Error(`Task record not found: ${input.taskId}`);
  }

  const now = new Date().toISOString();
  const updated: TaskRecord = {
    ...existing,
    status: input.status,
    executionId: input.executionId ?? existing.executionId,
    provider: input.provider ?? existing.provider,
    outputPath: input.outputPath ?? existing.outputPath,
    errorMessage: input.errorMessage ?? existing.errorMessage,
    updatedAt: now,
    completedAt:
      input.status === "completed" || input.status === "failed" ? now : existing.completedAt
  };

  await writeTaskRecord(updated);
  if (updated.sessionId) {
    await syncActiveMissionForSession(updated.sessionId);
  }
  return updated;
}

export async function updateExecutionRecordMetadata(input: {
  executionId: string;
  provider?: string;
  attemptedProviders?: string[];
  fallbackFrom?: string | null;
  retryCount?: number;
  recoveryNotes?: string[];
  errorMessage?: string | null;
}): Promise<ExecutionRecord> {
  const existing = await readExecutionRecord(input.executionId);

  if (!existing) {
    throw new Error(`Execution record not found: ${input.executionId}`);
  }

  const updated: ExecutionRecord = {
    ...existing,
    provider: input.provider ?? existing.provider,
    attemptedProviders: input.attemptedProviders ?? existing.attemptedProviders,
    fallbackFrom: input.fallbackFrom === undefined ? existing.fallbackFrom : input.fallbackFrom,
    retryCount: input.retryCount ?? existing.retryCount,
    recoveryNotes: input.recoveryNotes ?? existing.recoveryNotes,
    errorMessage: input.errorMessage === undefined ? existing.errorMessage : input.errorMessage
  };

  await writeExecutionRecord(updated);

  if (updated.taskId) {
    await updateTaskStatus({
      taskId: updated.taskId,
      status: updated.status,
      executionId: updated.executionId,
      provider: updated.provider,
      outputPath: updated.outputPath ?? undefined,
      errorMessage: updated.errorMessage ?? undefined
    });
  }

  return updated;
}

export async function updateExecutionStatus(
  executionId: string,
  status: ExecutionStatus,
  errorMessage?: string,
  outputPath?: string
): Promise<ExecutionRecord> {
  const existing = await readExecutionRecord(executionId);

  if (!existing) {
    throw new Error(`Execution record not found: ${executionId}`);
  }

  const now = new Date().toISOString();
  const updated: ExecutionRecord = {
    ...existing,
    status,
    startedAt:
      status === "running" && existing.startedAt === null ? now : existing.startedAt,
    completedAt:
      status === "completed" || status === "failed" ? now : existing.completedAt,
    errorMessage: errorMessage ?? existing.errorMessage,
    outputPath: outputPath ?? existing.outputPath
  };

  await writeExecutionRecord(updated);

  if (updated.sessionId && updated.turnId) {
    await updateCommandSessionTurnExecution({
      sessionId: updated.sessionId,
      turnId: updated.turnId,
      taskId: updated.taskId ?? undefined,
      executionId: updated.executionId,
      executionStatus: updated.status
    });
  }

  if (updated.taskId) {
    await updateTaskStatus({
      taskId: updated.taskId,
      status: updated.status,
      executionId: updated.executionId,
      provider: updated.provider,
      outputPath: updated.outputPath ?? undefined,
      errorMessage: updated.errorMessage ?? undefined
    });
  }

  return updated;
}
