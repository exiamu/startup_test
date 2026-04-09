"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import type { StartupStatus } from "@/modules/startup/types";

async function fetchStartupStatus(): Promise<StartupStatus> {
  const response = await fetch("/api/startup/status", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load startup status.");
  }

  return response.json();
}

export function StartExperience() {
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<StartupStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStartupStatus()
      .then(setStatus)
      .catch((startupError) => {
        setError(
          startupError instanceof Error ? startupError.message : "Unknown startup status error."
        );
      });
  }, []);

  return (
    <div className="start-shell">
      <div className={`start-core ${activated ? "start-core-active" : ""}`}>
        <span className="start-status">{activated ? "Jarvis awakened" : "Dormant system"}</span>
        <h1 className="start-title">Jarvis</h1>
        <p className="start-copy">
          {activated
            ? "Choose whether Jarvis is entering a new project or learning an existing one."
            : "Awaiting commander activation."}
        </p>

        <section className="start-status-board">
          <strong>Portable boot flow</strong>
          <p className="meta">
            Launch command: <span className="code">{status?.launchCommand ?? "bash .nexus/scripts/start-jarvis.sh"}</span>
          </p>
          <p className="meta">
            Local command center: <span className="code">{status?.uiUrl ?? "http://localhost:3000"}</span>
          </p>
          {error ? <p className="error-text">{error}</p> : null}
          {status ? (
            <ul className="list">
              {status.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          ) : (
            <p className="meta">Reading local startup status...</p>
          )}
        </section>

        {!activated ? (
          <button className="start-button" onClick={() => setActivated(true)}>
            Start
          </button>
        ) : (
          <>
            <div className="awakening-line">Commander recognized. Mission path required.</div>
            {status ? (
              <section className="start-guidance">
                <strong>
                  {status.readiness === "needs_init"
                    ? "Local setup still needs alignment"
                    : status.readiness === "needs_dependencies"
                      ? "Local setup needs dependencies before launch"
                      : "Local setup looks ready"}
                </strong>
                <ul className="list">
                  {status.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <div className="choice-grid choice-grid-activated">
              <Link className="choice-card" href={"/command" as Route}>
                <strong>Command</strong>
                <span>
                  Go straight into the Jarvis operating loop for a task, question, bug,
                  or next-step request.
                </span>
              </Link>
              <Link className="choice-card" href={"/start/new" as Route}>
                <strong>New</strong>
                <span>
                  Begin first-contact onboarding from a rough idea dump and let Jarvis shape
                  the project with you.
                </span>
              </Link>
              <Link className="choice-card" href={"/start/existing" as Route}>
                <strong>Existing</strong>
                <span>
                  Scan the current project structure, infer what exists, and let Jarvis adapt
                  itself professionally.
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
