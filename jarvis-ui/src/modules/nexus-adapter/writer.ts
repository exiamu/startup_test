import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type {
  CommandSessionRecord,
  CommandSessionTurn,
  ExecutionRecord,
  ExecutionStatus,
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
  return updatedSession;
}

export async function updateTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
  executionId?: string;
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
    outputPath: input.outputPath ?? existing.outputPath,
    errorMessage: input.errorMessage ?? existing.errorMessage,
    updatedAt: now,
    completedAt:
      input.status === "completed" || input.status === "failed" ? now : existing.completedAt
  };

  await writeTaskRecord(updated);
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
      outputPath: updated.outputPath ?? undefined,
      errorMessage: updated.errorMessage ?? undefined
    });
  }

  return updated;
}
