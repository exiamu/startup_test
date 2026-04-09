import Link from "next/link";
import type { Route } from "next";

import { scanProjectRoot } from "@/modules/project-discovery/reader";

const aiOptions = [
  {
    name: "Claude",
    label: "Strategic scan",
    description: "Best default for understanding an unknown project and building a clean high-level model."
  },
  {
    name: "Codex",
    label: "Implementation scan",
    description: "Useful when the existing project already looks code-heavy and execution-focused."
  },
  {
    name: "Gemini",
    label: "Long-context scan",
    description: "Useful when the project is broad and needs a large-context first pass."
  }
] as const;

export default async function StartExistingProjectPage() {
  const scan = await scanProjectRoot();

  return (
    <div className="grid">
      <section className="panel">
        <h2>Existing project startup</h2>
        <p>
          Jarvis should inspect first, then adapt. This is the first project scan from the
          current root before deeper learning and normalization flows are added.
        </p>
        <p className="meta">
          This is a read-only learning pass. Jarvis should inspect structure, tooling,
          likely architecture, and unknowns before any project-specific drafts are proposed.
        </p>
        <ul className="list">
          <li>Project root: {scan.projectRoot}</li>
          {scan.likelyProjectType.map((type) => (
            <li key={type}>Signal: {type}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Runtime and framework signals</h2>
        <ul className="list">
          {scan.runtimes.length > 0 ? scan.runtimes.map((runtime) => <li key={runtime}>{runtime}</li>) : <li>No runtime signal detected yet.</li>}
          {scan.frameworks.length > 0 ? scan.frameworks.map((framework) => <li key={framework}>{framework}</li>) : <li>No framework signal detected yet.</li>}
          {scan.packageManagers.length > 0 ? scan.packageManagers.map((manager) => <li key={manager}>{manager}</li>) : <li>No explicit package manager signal detected yet.</li>}
        </ul>
      </section>

      <section className="panel">
        <h2>Testing and deployment signals</h2>
        <ul className="list">
          {scan.testing.length > 0 ? (
            scan.testing.map((item) => <li key={item}>Testing: {item}</li>)
          ) : (
            <li>No testing signal detected yet.</li>
          )}
          {scan.deployment.length > 0 ? (
            scan.deployment.map((item) => <li key={item}>Deployment: {item}</li>)
          ) : (
            <li>No deployment signal detected yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Project areas Jarvis should learn next</h2>
        <ul className="list">
          {scan.codeAreas.length > 0 ? (
            scan.codeAreas.map((area) => (
              <li key={area.path}>
                {area.path} · {area.kind}
                {area.sampleChildren.length > 0 ? ` · sample: ${area.sampleChildren.join(", ")}` : ""}
              </li>
            ))
          ) : (
            <li>No meaningful code areas detected yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Architecture interpretation</h2>
        <ul className="list">
          {scan.architectureSignals.length > 0 ? (
            scan.architectureSignals.map((signal) => <li key={signal}>{signal}</li>)
          ) : (
            <li>No strong architecture interpretation yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Risk areas Jarvis should respect</h2>
        <ul className="list">
          {scan.riskAreas.length > 0 ? (
            scan.riskAreas.map((risk) => <li key={risk}>{risk}</li>)
          ) : (
            <li>No major risk areas surfaced in the first pass.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Key manifests and files</h2>
        <ul className="list">
          {scan.keyFiles.length > 0 ? (
            scan.keyFiles.map((file) => <li key={file.path}>{file.path} · {file.reason}</li>)
          ) : (
            <li>No key manifests detected.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Manifest summaries</h2>
        <ul className="list">
          {scan.manifests.length > 0 ? (
            scan.manifests.map((manifest) => (
              <li key={manifest.path}>{manifest.path} · {manifest.summary.join(" | ")}</li>
            ))
          ) : (
            <li>No manifest summary available yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Open questions before Jarvis drafts context</h2>
        <ul className="list">
          {scan.unresolvedQuestions.length > 0 ? (
            scan.unresolvedQuestions.map((question) => <li key={question}>{question}</li>)
          ) : (
            <li>No major unknowns surfaced in the first pass.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Recommended next room and AI moves</h2>
        <p className="meta">
          These are draft routing suggestions only. Jarvis should recommend, not silently commit.
        </p>
        <ul className="list">
          {scan.recommendedActions.length > 0 ? (
            scan.recommendedActions.map((action) => (
              <li key={`${action.room}-${action.title}`}>
                {action.title} · {action.room} room · {action.ai} · {action.reason}
                {" · "}
                <Link
                  href={`/command?source=brownfield&request=${encodeURIComponent(action.title)}` as Route}
                >
                  launch through /command
                </Link>
              </li>
            ))
          ) : (
            <li>No strong next-room suggestion yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Continue into Jarvis command</h2>
        <p>
          Move this brownfield read into the operating loop when you want Jarvis to turn
          the repo scan into an explicit room, AI, and launch package recommendation.
        </p>
        <p>
          <Link href={"/command?source=brownfield" as Route}>
            Continue to /command from brownfield intake
          </Link>
        </p>
      </section>

      <section className="panel">
        <h2>Draft room context pack</h2>
        <p className="meta">
          Jarvis should eventually assemble this into a reusable room handoff, but it remains proposal-only here.
        </p>
        <ul className="list">
          {scan.roomContextPack.length > 0 ? (
            scan.roomContextPack.map((proposal) => (
              <li key={`${proposal.room}-${proposal.focus}`}>
                {proposal.room} · {proposal.ai} · {proposal.focus} · paths:{" "}
                {proposal.relevantPaths.length > 0 ? proposal.relevantPaths.join(", ") : "none yet"} ·
                questions:{" "}
                {proposal.openQuestions.length > 0 ? proposal.openQuestions.join(" | ") : "none"}
              </li>
            ))
          ) : (
            <li>No room context pack drafted yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Proposed brownfield draft</h2>
        <p className="meta">Proposal only. No `.nexus` writes should happen from this screen.</p>
        <ul className="list">
          {scan.proposedDraft.identity.map((item) => <li key={item}>{item}</li>)}
          {scan.proposedDraft.architecture.map((item) => <li key={item}>{item}</li>)}
          {scan.proposedDraft.nextActions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="panel">
        <h2>Top-level directories</h2>
        <ul className="list">
          {scan.topLevelDirectories.length > 0 ? (
            scan.topLevelDirectories.map((directory) => <li key={directory}>{directory}</li>)
          ) : (
            <li>No top-level directories detected.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Top-level files</h2>
        <ul className="list">
          {scan.topLevelFiles.length > 0 ? (
            scan.topLevelFiles.map((file) => <li key={file}>{file}</li>)
          ) : (
            <li>No top-level files detected.</li>
          )}
        </ul>
      </section>

      {aiOptions.map((option) => (
        <section className="panel" key={option.name}>
          <h2>
            {option.name} <span className="meta">({option.label})</span>
          </h2>
          <p>{option.description}</p>
          <p>
            <Link href={`/overview?startupAi=${option.name.toLowerCase()}` as Route}>
              Use {option.name} to start analysis
            </Link>
          </p>
        </section>
      ))}
    </div>
  );
}
