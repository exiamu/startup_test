"use client";

import Link from "next/link";
import type { Route } from "next";
import { startTransition, useEffect, useState } from "react";

import type {
  CommandSessionRecord,
  ExecutionRecord
} from "@/modules/nexus-adapter/types";
import type { CommandPlan, CommandSource, LaunchPackage } from "@/modules/command/types";

async function fetchCommandPlan(input: {
  request: string;
  source: CommandSource;
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
    throw new Error("Failed to assemble Jarvis command plan.");
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

async function fetchCommandSession(sessionId: string): Promise<CommandSessionRecord> {
  const response = await fetch(`/api/command/session/${sessionId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to read Jarvis session.");
  }

  return response.json();
}

function Section({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="list">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>Nothing surfaced yet.</li>}
      </ul>
    </section>
  );
}

function SessionPanel({
  session
}: {
  session: CommandSessionRecord;
}) {
  return (
    <section className="panel command-panel">
      <h2>Jarvis session</h2>
      <p className="meta">Session: {session.sessionId}</p>
      <p className="meta">Updated: {new Date(session.updatedAt).toLocaleString()}</p>
      <ul className="list">
        {session.turns.length > 0 ? (
          [...session.turns].reverse().map((turn) => (
            <li key={turn.turnId}>
              <strong>{turn.recommendedRoom}</strong> via {turn.recommendedAi}: {turn.request}
              {turn.executionStatus ? ` [${turn.executionStatus}]` : ""}
            </li>
          ))
        ) : (
          <li>No turns yet.</li>
        )}
      </ul>
    </section>
  );
}

function LaunchPackageCard({
  launchPackage,
  executionRecord,
  executing,
  onExecute
}: {
  launchPackage: LaunchPackage;
  executionRecord: ExecutionRecord | null;
  executing: boolean;
  onExecute: (launchPackage: LaunchPackage) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(launchPackage.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="panel package-panel">
      <div className="package-header">
        <div>
          <h2>{launchPackage.ai}</h2>
          <p className="meta">
            {launchPackage.room} room · {launchPackage.fit}
          </p>
        </div>
        <div className="actions">
          {launchPackage.fit === "primary" ? (
            <button className="primary-button" onClick={() => onExecute(launchPackage)} disabled={executing}>
              {executing ? "Executing..." : "Execute"}
            </button>
          ) : null}
          <button className="primary-button" onClick={handleCopy}>
            {copied ? "Copied" : "Copy package"}
          </button>
        </div>
      </div>
      <p>{launchPackage.usage}</p>
      <p className="meta">Context used: {launchPackage.contextUsed.join(" · ")}</p>
      {executionRecord ? (
        <div className="meta">
          <p>Status: {executionRecord.status}</p>
          {executionRecord.status === "completed" && executionRecord.outputPath ? (
            <p>
              Output:{" "}
              <Link href={`/artifacts/${executionRecord.outputPath}?view=file` as Route}>
                view execution output
              </Link>
            </p>
          ) : null}
          {executionRecord.status === "failed" && executionRecord.errorMessage ? (
            <p className="error-text">{executionRecord.errorMessage}</p>
          ) : null}
        </div>
      ) : null}
      <pre className="file-view package-copy">{launchPackage.prompt}</pre>
    </section>
  );
}

const QUICK_PROMPTS = [
  "Implement a new frontend command panel that routes tasks explicitly.",
  "Help me debug a failing API route and tell me which room and AI should own it.",
  "Read this repo and tell me the best next move.",
  "Turn this rough product idea into the first sensible room launch."
] as const;

export function CommandClient({
  initialRequest,
  initialSource,
  initialSessionId
}: {
  initialRequest: string;
  initialSource: CommandSource;
  initialSessionId: string | null;
}) {
  const [request, setRequest] = useState(initialRequest);
  const [source, setSource] = useState<CommandSource>(initialSource);
  const [plan, setPlan] = useState<CommandPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [turnId, setTurnId] = useState<string | null>(null);
  const [sessionRecord, setSessionRecord] = useState<CommandSessionRecord | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionRecord, setExecutionRecord] = useState<ExecutionRecord | null>(null);
  const [executingProvider, setExecutingProvider] = useState<string | null>(null);

  const runPlan = (nextRequest: string, nextSource: CommandSource) => {
    setLoading(true);
    setError(null);

    startTransition(() => {
      fetchCommandPlan({ request: nextRequest, source: nextSource, sessionId })
        .then(async (result) => {
          setPlan(result.plan);
          setSessionId(result.sessionId);
          setTurnId(result.turnId);
          const nextSession = await fetchCommandSession(result.sessionId);
          setSessionRecord(nextSession);
        })
        .catch((planError) => {
          setError(planError instanceof Error ? planError.message : "Unknown command error.");
        })
        .finally(() => setLoading(false));
    });
  };

  useEffect(() => {
    if (!initialSessionId) {
      return;
    }

    fetchCommandSession(initialSessionId)
      .then((session) => {
        setSessionRecord(session);
        const latestTurn = session.turns.at(-1);

        if (latestTurn) {
          setRequest(latestTurn.request);
        }
      })
      .catch(() => {
        // If restore fails, keep the page usable rather than blocking.
      });
  }, [initialSessionId]);

  useEffect(() => {
    if (initialRequest.trim() || initialSource === "brownfield") {
      runPlan(initialRequest, initialSource);
    }
  }, [initialRequest, initialSource]);

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
            setSessionRecord(nextSession);
          }

          if (
            record.status === "completed" ||
            record.status === "failed" ||
            record.status === "blocked"
          ) {
            setExecutingProvider(null);
            window.clearInterval(intervalId);
          }
        })
        .catch((executionError) => {
          setError(
            executionError instanceof Error
              ? executionError.message
              : "Unknown execution status error."
          );
          setExecutingProvider(null);
          window.clearInterval(intervalId);
        });
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [executionId]);

  const handleExecute = (launchPackage: LaunchPackage) => {
    if (!plan) {
      return;
    }

    setExecutingProvider(launchPackage.ai.toLowerCase());
    setExecutionRecord(null);
    setError(null);

    executeLaunchPackage({
      provider: launchPackage.ai.toLowerCase(),
      room: launchPackage.room,
      intent: plan.classification.intent,
      prompt: launchPackage.prompt,
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
        setExecutingProvider(null);
      });
  };

  return (
    <div className="grid command-grid">
      <section className="panel command-panel command-input-panel">
        <h2>/command</h2>
        <p>
          This is Jarvis&apos;s real operating surface. Feed it a task, idea, bug, review
          request, or a plain &quot;what should happen next&quot; prompt and it will classify
          the intent, recommend the room and AI, and assemble deterministic launch packages.
        </p>
        <p className="meta">
          Jarvis stays explicit here: routing is tied to room ownership and launch packages
          remain proposal-first.
        </p>

        <label className="field-label" htmlFor="command-source">
          Source
        </label>
        <select
          id="command-source"
          className="command-select"
          value={source}
          onChange={(event) => setSource(event.target.value as CommandSource)}
        >
          <option value="direct">Direct command</option>
          <option value="onboarding">Onboarding continuation</option>
          <option value="brownfield">Brownfield continuation</option>
        </select>

        <label className="field-label" htmlFor="command-request">
          Commander request
        </label>
        <textarea
          id="command-request"
          className="idea-input"
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          placeholder="Describe the task, bug, request, review, or rough idea."
        />

        <div className="actions command-actions">
          <button
            className="primary-button"
            onClick={() => runPlan(request, source)}
            disabled={loading || (!request.trim() && source !== "brownfield")}
          >
            {loading ? "Routing..." : "Assemble command plan"}
          </button>
          <Link href={"/start" as Route} className="text-link">
            Return to startup flow
          </Link>
        </div>

        <div className="quick-prompt-row">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className="quick-prompt"
              onClick={() => {
                setRequest(prompt);
                setSource("direct");
                runPlan(prompt, "direct");
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {sessionId ? <p className="meta">Active session: {sessionId}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {sessionRecord ? <SessionPanel session={sessionRecord} /> : null}

      {plan ? (
        <>
          <section className="panel command-panel">
            <h2>Jarvis routing recommendation</h2>
            <p className="command-summary">{plan.classification.summary}</p>
            <ul className="list">
              <li>Intent: {plan.classification.label}</li>
              <li>Recommended room: {plan.recommendation.room}</li>
              <li>Recommended AI: {plan.recommendation.ai}</li>
              <li>Why: {plan.recommendation.reason}</li>
              <li>Contract basis: {plan.recommendation.contractBasis}</li>
            </ul>
          </section>

          <Section title="Project state signals" items={plan.projectState.projectSignals} />
          <Section title="Current handoff state" items={plan.projectState.handoffSummary} />
          <Section title="Why this route fits now" items={plan.recommendation.sourceBasis} />
          <Section title="Proposed next moves" items={plan.nextMoves} />
          <Section title="Risk areas to respect" items={plan.projectState.riskAreas} />

          {plan.launchPackages.map((launchPackage) => (
            <LaunchPackageCard
              key={launchPackage.ai}
              launchPackage={launchPackage}
              executionRecord={
                executionRecord && executionRecord.provider === launchPackage.ai.toLowerCase()
                  ? executionRecord
                  : null
              }
              executing={executingProvider === launchPackage.ai.toLowerCase()}
              onExecute={handleExecute}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
