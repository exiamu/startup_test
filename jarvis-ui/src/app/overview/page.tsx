import { readOverviewState } from "@/modules/nexus-adapter/reader";

export default async function OverviewPage() {
  const overview = await readOverviewState();

  return (
    <div className="grid">
      <section className="panel">
        <h2>Project overview</h2>
        <p>
          This is the first filesystem-derived overview card. It reads straight from{" "}
          <span className="code">HANDOFF.md</span> and the core Nexus root checks.
        </p>
        <ul className="list">
          {overview.handoffSummary.length > 0 ? (
            overview.handoffSummary.map((line) => <li key={line}>{line}</li>)
          ) : (
            <li>No handoff summary lines detected yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Core contract</h2>
        <ul className="list">
          <li>Routing contract present: {overview.health.coreFiles.roomContract ? "yes" : "no"}</li>
          <li>Founding prompt present: {overview.health.coreFiles.foundingPrompt ? "yes" : "no"}</li>
          <li>Routing guide present: {overview.health.coreFiles.routing ? "yes" : "no"}</li>
        </ul>
      </section>
    </div>
  );
}
