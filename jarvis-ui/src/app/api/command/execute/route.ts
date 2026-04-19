import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

import { NextResponse } from "next/server";

import { resolveInsideNexus } from "@/lib/nexus-path";
import {
  attachTaskToCommandSessionTurn,
  createTaskRecord,
  ensureDirectory,
  updateExecutionRecordMetadata,
  updateExecutionStatus,
  writeExecutionRecord
} from "@/modules/nexus-adapter/writer";
import type { ExecutionRecord } from "@/modules/nexus-adapter/types";
import {
  readProviderConfig,
  selectExecutionProvider,
  selectExecutionProviderWithExclusions
} from "@/modules/providers/reader";

type ProviderRunResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

async function runProviderScript(provider: string, prompt: string): Promise<ProviderRunResult> {
  const scriptPath = resolveInsideNexus("scripts", "providers", `invoke-${provider}.sh`);

  return new Promise((resolve, reject) => {
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

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

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

  let selectedProvider = provider;
  let fallbackFrom: string | null = null;

  try {
    const selection = await selectExecutionProvider(provider);
    selectedProvider = selection.selectedProvider;
    fallbackFrom = selection.fallbackFrom;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No runnable provider is available."
      },
      { status: 409 }
    );
  }

  const executionId = `${selectedProvider}-${Date.now()}-${randomBytes(2).toString("hex")}`;
  const createdAt = new Date().toISOString();
  let taskId = body.taskId ?? null;

  if (!taskId) {
    const task = await createTaskRecord({
      sessionId: body.sessionId ?? null,
      turnId: body.turnId ?? null,
      title: body.request?.trim() || `${intent} via ${room}`,
      request: body.request?.trim() || prompt,
      room,
      provider: selectedProvider,
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
    requestedProvider: provider,
    provider: selectedProvider,
    attemptedProviders: [selectedProvider],
    fallbackFrom,
    room,
    intent,
    prompt,
    status: "planned",
    createdAt,
    startedAt: null,
    completedAt: null,
    outputPath: null,
    errorMessage: null,
    retryCount: 0,
    recoveryNotes:
      fallbackFrom !== null
        ? [`Provider switched before launch from ${fallbackFrom} to ${selectedProvider}.`]
        : []
  };

  await writeExecutionRecord(record);

  void (async () => {
    try {
      await updateExecutionStatus(executionId, "running");

      let activeProvider = selectedProvider;
      let attemptedProviders = [selectedProvider];
      let retryCount = 0;
      let recoveryNotes = [...record.recoveryNotes];

      while (true) {
        const result = await runProviderScript(activeProvider, prompt);

        if (result.code === 0) {
          try {
            await ensureDirectory(["execution"]);
            const relativeOutputPath = `execution/${executionId}-output.txt`;
            const outputPath = resolveInsideNexus(`${relativeOutputPath}`);
            await fs.writeFile(outputPath, result.stdout, "utf8");
            await updateExecutionRecordMetadata({
              executionId,
              provider: activeProvider,
              attemptedProviders,
              retryCount,
              recoveryNotes,
              errorMessage: null
            });
            await updateExecutionStatus(executionId, "completed", undefined, relativeOutputPath);
          } catch (error) {
            await updateExecutionStatus(
              executionId,
              "failed",
              error instanceof Error ? error.message : "Failed to persist execution output."
            );
          }

          break;
        }

        const providerConfig = await readProviderConfig(activeProvider);
        const canRetrySameProvider =
          Boolean(providerConfig) && retryCount < (providerConfig?.maxRetries ?? 0);
        const failureMessage =
          result.stderr.trim() || `Provider exited with code ${result.code ?? "unknown"}.`;

        if (canRetrySameProvider) {
          retryCount += 1;
          recoveryNotes = [
            ...recoveryNotes,
            `Retrying ${activeProvider} after failure: ${failureMessage}`
          ];
          await updateExecutionRecordMetadata({
            executionId,
            provider: activeProvider,
            attemptedProviders,
            retryCount,
            recoveryNotes,
            errorMessage: failureMessage
          });
          continue;
        }

        try {
          const recoverySelection = await selectExecutionProviderWithExclusions(
            provider,
            attemptedProviders
          );
          const nextProvider = recoverySelection.selectedProvider;

          if (nextProvider !== activeProvider) {
            attemptedProviders = [...attemptedProviders, nextProvider];
            recoveryNotes = [
              ...recoveryNotes,
              `Switching from ${activeProvider} to ${nextProvider} after failure: ${failureMessage}`
            ];
            activeProvider = nextProvider;
            await updateExecutionRecordMetadata({
              executionId,
              provider: activeProvider,
              attemptedProviders,
              fallbackFrom: record.fallbackFrom ?? provider,
              retryCount,
              recoveryNotes,
              errorMessage: failureMessage
            });
            continue;
          }
        } catch {
          // No further recovery provider is available. Fall through to failed status.
        }

        await updateExecutionRecordMetadata({
          executionId,
          provider: activeProvider,
          attemptedProviders,
          retryCount,
          recoveryNotes,
          errorMessage: failureMessage
        });
        await updateExecutionStatus(executionId, "failed", failureMessage);
        break;
      }
    } catch (error) {
      await updateExecutionStatus(
        executionId,
        "failed",
        error instanceof Error ? error.message : "Unknown execution failure."
      );
    }
  })();

  return NextResponse.json(
    {
      executionId,
      status: "planned",
      providerUsed: selectedProvider,
      fallbackFrom,
      recoveryNotes: record.recoveryNotes
    },
    { status: 202 }
  );
}
