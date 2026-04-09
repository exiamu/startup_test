import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type {
  CommandSessionRecord,
  CommandSessionTurn,
  ExecutionRecord,
  ExecutionStatus
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

export async function updateCommandSessionTurnExecution(input: {
  sessionId: string;
  turnId: string;
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
            executionId: input.executionId ?? turn.executionId,
            executionStatus: input.executionStatus ?? turn.executionStatus
          }
        : turn
    )
  };

  await writeCommandSession(updatedSession);
  return updatedSession;
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
      executionId: updated.executionId,
      executionStatus: updated.status
    });
  }

  return updated;
}
