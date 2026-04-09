import { promises as fs } from "node:fs";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type { ExecutionRecord, ExecutionStatus } from "@/modules/nexus-adapter/types";

export async function ensureDirectory(segments: string[]): Promise<string> {
  const dirPath = resolveInsideNexus(...segments);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

function getExecutionRecordPath(executionId: string): string {
  return resolveInsideNexus("execution", `${executionId}.json`);
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
  return updated;
}
