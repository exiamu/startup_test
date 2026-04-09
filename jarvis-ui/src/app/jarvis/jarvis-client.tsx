"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import type {
  CommandSessionRecord,
  ExecutionRecord
} from "@/modules/nexus-adapter/types";
import type { CommandPlan } from "@/modules/command/types";

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

async function executeLaunchPackage(input: {
  provider: string;
  room: string;
  intent: string;
  prompt: string;
  sessionId?: string | null;
  turnId?: string | null;
}): Promise<{ executionId: string; status: string }> {
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
  const [plan, setPlan] = useState<CommandPlan | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionRecord, setExecutionRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSessionId) {
      return;
    }

    fetchCommandSession(initialSessionId)
      .then((restored) => {
        setSession(restored);
        const latestTurn = restored.turns.at(-1);

        if (latestTurn?.executionId) {
          setExecutionId(latestTurn.executionId);
        }
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
      })
      .catch((planError) => {
        setError(planError instanceof Error ? planError.message : "Unknown Jarvis error.");
      })
      .finally(() => setLoading(false));
  };

  const handleExecute = () => {
    if (!plan) {
      return;
    }

    const primaryPackage = plan.launchPackages.find((item) => item.fit === "primary");

    if (!primaryPackage) {
      setError("Jarvis did not produce a primary execution package.");
      return;
    }

    setExecuting(true);
    setExecutionRecord(null);
    setError(null);

    executeLaunchPackage({
      provider: primaryPackage.ai.toLowerCase(),
      room: primaryPackage.room,
      intent: plan.classification.intent,
      prompt: primaryPackage.prompt,
      sessionId,
      turnId
    })
      .then((result) => {
        setExecutionId(result.executionId);
      })
      .catch((executionError) => {
        setError(
          executionError instanceof Error
            ? executionError.message
            : "Unknown execution error."
        );
        setExecuting(false);
      });
  };

  const latestTurn = session?.turns.at(-1) ?? null;

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
            <button className="primary-button" onClick={handleExecute} disabled={executing}>
              {executing ? "Executing..." : "Execute latest move"}
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
        {error ? <p className="error-text">{error}</p> : null}
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
            <li>Execution status: {latestTurn.executionStatus ?? "not started"}</li>
            <li>Execution id: {latestTurn.executionId ?? "none"}</li>
          </ul>
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
