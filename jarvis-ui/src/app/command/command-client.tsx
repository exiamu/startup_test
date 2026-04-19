"use client";

import Link from "next/link";
import type { Route } from "next";
import { startTransition, useEffect, useState } from "react";

import type {
  ActiveMissionRecord,
  CommandSessionRecord,
  ExecutionRecord
} from "@/modules/nexus-adapter/types";
import type { CommandPlan, CommandSource, LaunchPackage } from "@/modules/command/types";
import type { ProviderRuntimeStatus } from "@/modules/providers/types";

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

async function fetchCommandSession(sessionId: string): Promise<CommandSessionRecord> {
  const response = await fetch(`/api/command/session/${sessionId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to read Jarvis session.");
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
  providerStatus,
  onExecute
}: {
  launchPackage: LaunchPackage;
  executionRecord: ExecutionRecord | null;
  executing: boolean;
  providerStatus: ProviderRuntimeStatus | null;
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
            <button
              className="primary-button"
              onClick={() => onExecute(launchPackage)}
              disabled={executing || (providerStatus ? !providerStatus.ready : false)}
            >
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
      {providerStatus && !providerStatus.ready ? (
        <p className="error-text">
          Provider unavailable: {providerStatus.name} ({providerStatus.reason})
        </p>
      ) : null}
      {executionRecord ? (
        <div className="meta">
          <p>
            Status: {executionRecord.status} via {executionRecord.provider}
            {executionRecord.retryCount > 0 ? ` · retries ${executionRecord.retryCount}` : ""}
          </p>
          {executionRecord.recoveryNotes.length > 0 ? (
            <ul className="list">
              {executionRecord.recoveryNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
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
  const [missionRecord, setMissionRecord] = useState<ActiveMissionRecord | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionRecord, setExecutionRecord] = useState<ExecutionRecord | null>(null);
  const [executingProvider, setExecutingProvider] = useState<string | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<ProviderRuntimeStatus[]>([]);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProviderStatuses().then(setProviderStatuses).catch(() => {
      // Keep command mode usable if readiness cannot be read.
    });
    fetchActiveMission().then(setMissionRecord).catch(() => {
      // Keep command mode usable if mission state cannot be read.
    });
  }, []);

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
          const mission = await fetchActiveMission();
          setMissionRecord(mission && mission.sessionId === result.sessionId ? mission : null);
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
      .then(async (session) => {
        setSessionRecord(session);
        const latestTurn = session.turns.at(-1);

        if (latestTurn) {
          setRequest(latestTurn.request);
        }

        const mission = await fetchActiveMission();
        setMissionRecord(mission && mission.sessionId === session.sessionId ? mission : null);
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
            const mission = await fetchActiveMission();
            setMissionRecord(mission && mission.sessionId === nextSession.sessionId ? mission : null);
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

  const startExecutionForPlan = async (nextPlan: CommandPlan, nextTurnId: string | null) => {
    const primaryPackage = nextPlan.launchPackages.find((item) => item.fit === "primary");

    if (!primaryPackage) {
      throw new Error("Jarvis did not produce a primary execution package.");
    }

    setExecutingProvider(primaryPackage.ai.toLowerCase());
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

  const handleExecute = (launchPackage: LaunchPackage) => {
    if (!plan) {
      return;
    }

    setExecutingProvider(launchPackage.ai.toLowerCase());
    setExecutionRecord(null);
    setExecutionMessage(null);
    setError(null);

    executeLaunchPackage({
      provider: launchPackage.ai.toLowerCase(),
      room: launchPackage.room,
      intent: plan.classification.intent,
      request,
      prompt: launchPackage.prompt,
      sessionId,
      turnId
    })
      .then((result) => {
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

  const handleContinueMission = () => {
    setLoading(true);
    setError(null);

    continueMission({ sessionId })
      .then(async (result) => {
        setPlan(result.plan);
        setSessionId(result.sessionId);
        setTurnId(result.turnId);
        const nextSession = await fetchCommandSession(result.sessionId);
        setSessionRecord(nextSession);
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
        setExecutingProvider(null);
      })
      .finally(() => setLoading(false));
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
          {(plan?.runtimeContext.canContinue || missionRecord?.canContinue) ? (
            <button className="primary-button" onClick={handleContinueMission} disabled={loading || Boolean(executingProvider)}>
              {loading ? "Continuing..." : "Continue mission"}
            </button>
          ) : null}
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
        {missionRecord?.objective ? <p className="meta">Mission objective: {missionRecord.objective}</p> : null}
        {missionRecord?.canContinue ? <p className="meta">Jarvis can safely continue the current mission.</p> : null}
        {executionMessage ? <p className="meta">{executionMessage}</p> : null}
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

          <Section title="Mission continuity" items={[
            `Mission state: ${plan.runtimeContext.missionState}`,
            plan.runtimeContext.missionDirective,
            ...(plan.runtimeContext.objective ? [`Objective: ${plan.runtimeContext.objective}`] : []),
            ...(plan.runtimeContext.canContinue ? ["Continue eligible: yes"] : ["Continue eligible: no"]),
            ...(plan.runtimeContext.missionFocus ? [`Mission focus: ${plan.runtimeContext.missionFocus}`] : []),
            ...plan.runtimeContext.ambiguitySignals,
            `Session: ${plan.runtimeContext.sessionId ?? "new session"}`,
            `Latest execution: ${plan.runtimeContext.latestExecutionStatus ?? "no execution yet"}`,
            ...plan.runtimeContext.activeTasks,
            ...plan.runtimeContext.recoverySignals,
            ...plan.runtimeContext.recentTurns
          ]} />

          <Section title="Project state signals" items={plan.projectState.projectSignals} />
          <Section title="Current handoff state" items={plan.projectState.handoffSummary} />
          <Section title="Why this route fits now" items={plan.recommendation.sourceBasis} />
          <Section title="Proposed next moves" items={plan.nextMoves} />
          <Section title="Risk areas to respect" items={plan.projectState.riskAreas} />

          {plan.launchPackages.map((launchPackage) => (
            <LaunchPackageCard
              key={launchPackage.ai}
              launchPackage={launchPackage}
              providerStatus={
                providerStatuses.find(
                  (status) => status.name === launchPackage.ai.toLowerCase()
                ) ?? null
              }
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
