import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

import { NextResponse } from "next/server";

import { resolveInsideNexus } from "@/lib/nexus-path";
import {
  attachTaskToCommandSessionTurn,
  createTaskRecord,
  ensureDirectory,
  updateExecutionStatus,
  writeExecutionRecord
} from "@/modules/nexus-adapter/writer";
import type { ExecutionRecord } from "@/modules/nexus-adapter/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    provider?: string;
    room?: string;
    intent?: string;
    prompt?: string;
    sessionId?: string | null;
    turnId?: string | null;
    request?: string;
    taskId?: string | null;
  };

  const provider = body.provider?.trim();
  const room = body.room?.trim();
  const intent = body.intent?.trim();
  const prompt = body.prompt;

  if (!provider || !room || !intent || !prompt) {
    return NextResponse.json(
      { error: "provider, room, intent, and prompt are required." },
      { status: 400 }
    );
  }

  const executionId = `${provider}-${Date.now()}-${randomBytes(2).toString("hex")}`;
  const createdAt = new Date().toISOString();
  let taskId = body.taskId ?? null;

  if (!taskId) {
    const task = await createTaskRecord({
      sessionId: body.sessionId ?? null,
      turnId: body.turnId ?? null,
      title: body.request?.trim() || `${intent} via ${room}`,
      request: body.request?.trim() || prompt,
      room,
      provider,
      intent
    });
    taskId = task.taskId;

    if (body.sessionId && body.turnId) {
      await attachTaskToCommandSessionTurn({
        sessionId: body.sessionId,
        turnId: body.turnId,
        taskId
      });
    }
  }

  const record: ExecutionRecord = {
    executionId,
    sessionId: body.sessionId ?? null,
    turnId: body.turnId ?? null,
    taskId,
    provider,
    room,
    intent,
    prompt,
    status: "planned",
    createdAt,
    startedAt: null,
    completedAt: null,
    outputPath: null,
    errorMessage: null,
    retryCount: 0
  };

  await writeExecutionRecord(record);

  const scriptPath = resolveInsideNexus("scripts", "providers", `invoke-${provider}.sh`);

  void (async () => {
    try {
      await updateExecutionStatus(executionId, "running");

      const child = spawn("bash", [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"]
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });

      child.on("error", async (error) => {
        await updateExecutionStatus(executionId, "failed", error.message);
      });

      child.on("close", async (code) => {
        if (code === 0) {
          try {
            await ensureDirectory(["execution"]);
            const relativeOutputPath = `execution/${executionId}-output.txt`;
            const outputPath = resolveInsideNexus(`${relativeOutputPath}`);
            await fs.writeFile(outputPath, stdout, "utf8");
            await updateExecutionStatus(executionId, "completed", undefined, relativeOutputPath);
          } catch (error) {
            await updateExecutionStatus(
              executionId,
              "failed",
              error instanceof Error ? error.message : "Failed to persist execution output."
            );
          }
        } else {
          await updateExecutionStatus(
            executionId,
            "failed",
            stderr.trim() || `Provider exited with code ${code ?? "unknown"}.`
          );
        }
      });

      child.stdin.write(prompt);
      child.stdin.end();
    } catch (error) {
      await updateExecutionStatus(
        executionId,
        "failed",
        error instanceof Error ? error.message : "Unknown execution failure."
      );
    }
  })();

  return NextResponse.json({ executionId, status: "planned" }, { status: 202 });
}
