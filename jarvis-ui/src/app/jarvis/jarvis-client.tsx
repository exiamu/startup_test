"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import type {
  ActiveMissionRecord,
  CommandSessionRecord,
  ExecutionRecord
} from "@/modules/nexus-adapter/types";
import type { CommandPlan } from "@/modules/command/types";
import type { ProviderRuntimeStatus } from "@/modules/providers/types";

async function fetchCommandPlan(input: {
  request: string;
  source: "direct";
  sessionId?: string | null;
}): Promise<{ sessionId: string; turnId: string; plan: CommandPlan }> {
  const response = await fetch("/api/command/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Failed to get Jarvis response.");
  }

  return response.json();
}

async function fetchCommandSession(sessionId: string): Promise<CommandSessionRecord> {
  const response = await fetch(`/api/command/session/${sessionId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to restore Jarvis session.");
  }

  return response.json();
}

async function fetchActiveMission(): Promise<ActiveMissionRecord | null> {
  const response = await fetch("/api/mission/active", {
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to read active mission.");
  }

  return response.json();
}

async function continueMission(input: {
  sessionId?: string | null;
}): Promise<{ sessionId: string; turnId: string; plan: CommandPlan }> {
  const response = await fetch("/api/command/continue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Jarvis could not continue the active mission.");
  }

  return response.json();
}

async function executeLaunchPackage(input: {
  provider: string;
  room: string;
  intent: string;
  request?: string;
  prompt: string;
  sessionId?: string | null;
  turnId?: string | null;
}): Promise<{
  executionId: string;
  status: string;
  providerUsed: string;
  fallbackFrom: string | null;
  recoveryNotes?: string[];
}> {
  const response = await fetch("/api/command/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Failed to start Jarvis execution.");
  }

  return response.json();
}

async function fetchExecutionRecord(executionId: string): Promise<ExecutionRecord> {
  const response = await fetch(`/api/command/execute/${executionId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to read execution status.");
  }

  return response.json();
}

async function fetchProviderStatuses(): Promise<ProviderRuntimeStatus[]> {
  const response = await fetch("/api/providers/status", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to read provider readiness.");
  }

  const body = (await response.json()) as { providers: ProviderRuntimeStatus[] };
  return body.providers;
}

const STARTERS = [
  "I have a rough product idea and need Jarvis to shape the first steps.",
  "Read what is here and tell me what should happen next.",
  "I need help building the next implementation slice.",
  "I want Jarvis to help me think through this project like a real operator."
] as const;

export function JarvisClient({
  initialSessionId
}: {
  initialSessionId: string | null;
}) {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [turnId, setTurnId] = useState<string | null>(null);
  const [session, setSession] = useState<CommandSessionRecord | null>(null);
  const [missionRecord, setMissionRecord] = useState<ActiveMissionRecord | null>(null);
  const [plan, setPlan] = useState<CommandPlan | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionRecord, setExecutionRecord] = useState<ExecutionRecord | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<ProviderRuntimeStatus[]>([]);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviderStatuses().then(setProviderStatuses).catch(() => {
      // Keep Jarvis usable if readiness cannot be read.
    });
    fetchActiveMission().then(setMissionRecord).catch(() => {
      // Keep Jarvis usable if mission state cannot be read.
    });
  }, []);

  useEffect(() => {
    if (!initialSessionId) {
      return;
    }

    fetchCommandSession(initialSessionId)
      .then(async (restored) => {
        setSession(restored);
        const latestTurn = restored.turns.at(-1);

        if (latestTurn?.executionId) {
          setExecutionId(latestTurn.executionId);
        }

        const mission = await fetchActiveMission();
        setMissionRecord(mission && mission.sessionId === restored.sessionId ? mission : null);
      })
      .catch((restoreError) => {
        setError(
          restoreError instanceof Error ? restoreError.message : "Unknown Jarvis restore error."
        );
      });
  }, [initialSessionId]);

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("sessionId", sessionId);
    window.history.replaceState({}, "", url.toString());
  }, [sessionId]);

  useEffect(() => {
    if (!executionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      fetchExecutionRecord(executionId)
        .then(async (record) => {
          setExecutionRecord(record);

          if (record.sessionId) {
            const nextSession = await fetchCommandSession(record.sessionId);
            setSession(nextSession);
            const mission = await fetchActiveMission();
            setMissionRecord(mission && mission.sessionId === nextSession.sessionId ? mission : null);
          }

          if (
            record.status === "completed" ||
            record.status === "failed" ||
            record.status === "blocked"
          ) {
            setExecuting(false);
            window.clearInterval(intervalId);
          }
        })
        .catch((executionError) => {
          setError(
            executionError instanceof Error
              ? executionError.message
              : "Unknown Jarvis execution error."
          );
          setExecuting(false);
          window.clearInterval(intervalId);
        });
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [executionId]);

  const askJarvis = () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    fetchCommandPlan({
      request: input,
      source: "direct",
      sessionId
    })
      .then(async (result) => {
        setPlan(result.plan);
        setSessionId(result.sessionId);
        setTurnId(result.turnId);
        setInput("");
        const nextSession = await fetchCommandSession(result.sessionId);
        setSession(nextSession);
        const mission = await fetchActiveMission();
        setMissionRecord(mission && mission.sessionId === result.sessionId ? mission : null);
      })
      .catch((planError) => {
        setError(planError instanceof Error ? planError.message : "Unknown Jarvis error.");
      })
      .finally(() => setLoading(false));
  };

  const startExecutionForPlan = async (nextPlan: CommandPlan, nextTurnId: string | null) => {
    const primaryPackage = nextPlan.launchPackages.find((item) => item.fit === "primary");

    if (!primaryPackage) {
      throw new Error("Jarvis did not produce a primary execution package.");
    }

    setExecuting(true);
    setExecutionRecord(null);
    setExecutionMessage(null);
    setError(null);

    const result = await executeLaunchPackage({
      provider: primaryPackage.ai.toLowerCase(),
      room: primaryPackage.room,
      intent: nextPlan.classification.intent,
      request: nextPlan.request,
      prompt: primaryPackage.prompt,
      sessionId,
      turnId: nextTurnId
    });

    setExecutionId(result.executionId);
    if (result.recoveryNotes?.length) {
      setExecutionMessage(result.recoveryNotes[result.recoveryNotes.length - 1] ?? null);
    } else if (result.fallbackFrom) {
      setExecutionMessage(
        `Jarvis switched from ${result.fallbackFrom} to ${result.providerUsed} because the primary provider was not ready.`
      );
    } else {
      setExecutionMessage(`Executing with ${result.providerUsed}.`);
    }
  };

  const handleExecute = () => {
    if (!plan) {
      return;
    }

    startExecutionForPlan(plan, turnId).catch((executionError) => {
      setError(
        executionError instanceof Error
          ? executionError.message
          : "Unknown execution error."
      );
      setExecuting(false);
    });
  };

  const handleContinueMission = () => {
    setLoading(true);
    setError(null);

    continueMission({ sessionId })
      .then(async (result) => {
        setPlan(result.plan);
        setSessionId(result.sessionId);
        setTurnId(result.turnId);
        const nextSession = await fetchCommandSession(result.sessionId);
        setSession(nextSession);
        const mission = await fetchActiveMission();
        setMissionRecord(mission && mission.sessionId === result.sessionId ? mission : null);
        await startExecutionForPlan(result.plan, result.turnId);
      })
      .catch((continueError) => {
        setError(
          continueError instanceof Error
            ? continueError.message
            : "Jarvis could not continue the mission."
        );
        setExecuting(false);
      })
      .finally(() => setLoading(false));
  };

  const latestTurn = session?.turns.at(-1) ?? null;
  const primaryPackage = plan?.launchPackages.find((item) => item.fit === "primary") ?? null;
  const primaryProviderStatus = primaryPackage
    ? providerStatuses.find((status) => status.name === primaryPackage.ai.toLowerCase())
    : null;

  return (
    <div className="grid">
      <section className="panel jarvis-panel">
        <h2>Talk To Jarvis</h2>
        <p className="jarvis-copy">
          Speak naturally. Jarvis will interpret the request, choose the right room and AI,
          and keep the session moving forward.
        </p>
        <textarea
          className="idea-input jarvis-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tell Jarvis what you need, what you are building, or what should happen next."
        />
        <div className="actions jarvis-actions">
          <button className="primary-button" onClick={askJarvis} disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Ask Jarvis"}
          </button>
          {plan ? (
            <button
              className="primary-button"
              onClick={handleExecute}
              disabled={executing || (primaryProviderStatus ? !primaryProviderStatus.ready : false)}
            >
              {executing ? "Executing..." : "Execute latest move"}
            </button>
          ) : null}
          {(plan?.runtimeContext.canContinue || missionRecord?.canContinue) ? (
            <button className="primary-button" onClick={handleContinueMission} disabled={loading || executing}>
              {loading ? "Continuing..." : "Continue mission"}
            </button>
          ) : null}
          {sessionId ? (
            <Link href={`/command?sessionId=${sessionId}` as Route} className="text-link">
              Open technical command view
            </Link>
          ) : null}
        </div>
        <div className="quick-prompt-row">
          {STARTERS.map((starter) => (
            <button key={starter} className="quick-prompt" onClick={() => setInput(starter)}>
              {starter}
            </button>
          ))}
        </div>
        {sessionId ? <p className="meta">Session: {sessionId}</p> : null}
        {executionMessage ? <p className="meta">{executionMessage}</p> : null}
        {primaryProviderStatus && !primaryProviderStatus.ready ? (
          <p className="error-text">
            Primary provider unavailable: {primaryProviderStatus.name} ({primaryProviderStatus.reason})
          </p>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel jarvis-panel">
        <h2>Provider readiness</h2>
        <ul className="list">
          {providerStatuses.map((provider) => (
            <li key={provider.name}>
              {provider.name}: {provider.ready ? "ready" : provider.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel jarvis-panel">
        <h2>Jarvis session</h2>
        <ul className="list">
          {session?.turns.length ? (
            [...session.turns].reverse().map((turn) => (
              <li key={turn.turnId}>
                <strong>Commander:</strong> {turn.request}
                <br />
                <span className="meta">
                  Jarvis routed this to {turn.recommendedRoom} via {turn.recommendedAi}
                  {turn.executionStatus ? ` [${turn.executionStatus}]` : ""}
                </span>
              </li>
            ))
          ) : (
            <li>No session turns yet.</li>
          )}
        </ul>
      </section>

      {plan ? (
        <>
          <section className="panel jarvis-panel">
            <h2>Mission continuity</h2>
            <ul className="list">
              <li>Mission state: {plan.runtimeContext.missionState}</li>
              <li>{plan.runtimeContext.missionDirective}</li>
              {plan.runtimeContext.objective ? <li>Objective: {plan.runtimeContext.objective}</li> : null}
              {plan.runtimeContext.missionFocus ? (
                <li>Mission focus: {plan.runtimeContext.missionFocus}</li>
              ) : null}
              <li>Continue eligible: {plan.runtimeContext.canContinue ? "yes" : "no"}</li>
              <li>Session: {plan.runtimeContext.sessionId ?? "new session"}</li>
              <li>
                Latest execution: {plan.runtimeContext.latestExecutionStatus ?? "no execution yet"}
              </li>
            </ul>
            <ul className="list">
              {plan.runtimeContext.ambiguitySignals.length > 0 ? (
                plan.runtimeContext.ambiguitySignals.map((signal) => <li key={signal}>{signal}</li>)
              ) : (
                <li>No mission ambiguity surfaced yet.</li>
              )}
            </ul>
            <ul className="list">
              {plan.runtimeContext.activeTasks.length > 0 ? (
                plan.runtimeContext.activeTasks.map((task) => <li key={task}>{task}</li>)
              ) : (
                <li>No active tasks surfaced yet.</li>
              )}
            </ul>
            <ul className="list">
              {plan.runtimeContext.recoverySignals.length > 0 ? (
                plan.runtimeContext.recoverySignals.map((signal) => <li key={signal}>{signal}</li>)
              ) : (
                <li>No recovery actions needed yet.</li>
              )}
            </ul>
          </section>

          <section className="panel jarvis-panel">
            <h2>Jarvis response</h2>
            <p className="command-summary">{plan.classification.summary}</p>
            <ul className="list">
              <li>Recommended room: {plan.recommendation.room}</li>
              <li>Recommended AI: {plan.recommendation.ai}</li>
              <li>Why: {plan.recommendation.reason}</li>
            </ul>
          </section>

          <section className="panel jarvis-panel">
            <h2>Proposed next moves</h2>
            <ul className="list">
              {plan.nextMoves.map((move) => (
                <li key={move}>{move}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {latestTurn ? (
        <section className="panel jarvis-panel">
          <h2>Current runtime state</h2>
          <ul className="list">
            <li>Last turn: {latestTurn.request}</li>
            <li>
              Execution status: {latestTurn.executionStatus ?? "not started"}
              {executionRecord ? ` via ${executionRecord.provider}` : ""}
            </li>
            <li>Execution id: {latestTurn.executionId ?? "none"}</li>
            {executionRecord?.retryCount ? (
              <li>Retries used: {executionRecord.retryCount}</li>
            ) : null}
          </ul>
          {executionRecord?.recoveryNotes.length ? (
            <ul className="list">
              {executionRecord.recoveryNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          {executionRecord?.status === "completed" && executionRecord.outputPath ? (
            <p>
              <Link href={`/artifacts/${executionRecord.outputPath}?view=file` as Route}>
                View latest execution output
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
