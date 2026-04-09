"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

import type { OnboardingAnalysis } from "@/modules/onboarding/types";

const STARTER_TEXT =
  "Dump the messy first prompt here. Jarvis should turn rough intent into a structured starting point.";

async function analyzeIdea(idea: string): Promise<OnboardingAnalysis> {
  const response = await fetch("/api/onboarding/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idea })
  });

  if (!response.ok) {
    throw new Error("Failed to analyze onboarding input.");
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
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>None extracted yet.</li>}
      </ul>
    </section>
  );
}

export function OnboardingClient({ initialAi }: { initialAi: string }) {
  const [idea, setIdea] = useState("");
  const [analysis, setAnalysis] = useState<OnboardingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeIdea(idea);
      setAnalysis(result);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unknown onboarding error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2>First contact</h2>
        <p>
          This is the blank-project commander flow. Give Jarvis the rough, mumbled first
          version of the idea and it will break it into working structure instead of
          expecting a clean spec.
        </p>
        <p className="meta">Starting AI lens: {initialAi}</p>
        <p className="meta">
          This stage does not write into `.nexus`. It only structures understanding and
          prepares proposed drafts.
        </p>
        <textarea
          className="idea-input"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder={STARTER_TEXT}
        />
        <div className="actions">
          <button className="primary-button" onClick={handleAnalyze} disabled={loading || !idea.trim()}>
            {loading ? "Analyzing..." : "Analyze first prompt"}
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {analysis ? (
        <>
          <section className="panel">
            <h2>Readiness snapshot</h2>
            <ul className="list">
              <li>Draft confidence: {analysis.readiness.confidence}</li>
              <li>Recommended mode: {analysis.readiness.recommendedMode}</li>
              <li>Recommended first room: {analysis.readiness.recommendedFirstRoom}</li>
            </ul>
          </section>

          <Section title="Strengths already present" items={analysis.readiness.strengths} />
          <Section title="Gaps Jarvis still needs resolved" items={analysis.readiness.gaps} />
          <Section
            title="Detected tensions or contradictions"
            items={analysis.readiness.contradictions}
          />
          <Section title="What Jarvis believes right now" items={analysis.commanderModel.believes} />
          <Section
            title="What Jarvis still does not know"
            items={analysis.commanderModel.stillUnknown}
          />
          <Section
            title="Blocking decisions for the commander"
            items={analysis.commanderModel.blockingDecisions}
          />
          <Section
            title="Live tradeoffs Jarvis is tracking"
            items={analysis.commanderModel.tradeoffs}
          />
          <Section
            title="Proposed first execution slice"
            items={analysis.commanderModel.firstExecutionSlice}
          />
          <Section
            title="Jarvis recommended next moves"
            items={analysis.commanderModel.recommendedNextMoves}
          />

          <Section title="Cleaned summary" items={analysis.cleanedSummary} />
          <Section title="Problem signals" items={analysis.buckets.problem} />
          <Section title="User signals" items={analysis.buckets.users} />
          <Section title="Outcome signals" items={analysis.buckets.outcomes} />
          <Section title="Technical signals" items={analysis.buckets.technical} />
          <Section title="Business signals" items={analysis.buckets.business} />
          <Section title="Constraint signals" items={analysis.buckets.constraints} />
          <Section title="Unknowns" items={analysis.buckets.unknowns} />

          <section className="panel">
            <h2>Commander question rounds</h2>
            {analysis.rounds.map((round) => (
              <div key={round.title} className="round-block">
                <h3>{round.title}</h3>
                <p>{round.purpose}</p>
                <ul className="list">
                  {round.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <Section title="Commander intent proposal" items={analysis.draftPreview.commanderIntent} />
          <Section title="Draft vision" items={analysis.draftPreview.vision} />
          <Section title="Draft constraints" items={analysis.draftPreview.constraints} />
          <Section title="Draft architecture" items={analysis.draftPreview.architecture} />
          <Section title="Draft MVP scope" items={analysis.draftPreview.mvpScope} />
          <Section title="Open questions before approval" items={analysis.draftPreview.openQuestions} />
          <Section title="Recommended next actions" items={analysis.draftPreview.nextActions} />

          <section className="panel">
            <h2>Continue into Jarvis command</h2>
            <p>
              Move this draft into the real operating loop once you want an explicit room,
              AI, and launch package recommendation.
            </p>
            <p>
              <Link
                href={`/command?source=onboarding&request=${encodeURIComponent(idea)}` as Route}
              >
                Continue to /command with this idea
              </Link>
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
