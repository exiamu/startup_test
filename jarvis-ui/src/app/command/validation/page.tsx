import { runCommandValidationMatrix } from "@/modules/command/validation";

export default async function CommandValidationPage() {
  const report = await runCommandValidationMatrix();

  return (
    <div className="grid">
      <section className="panel">
        <h2>Command validation</h2>
        <p>
          This is the first executable pass over the `/command` validation matrix. It
          checks whether the current planner is routing the documented prompt set to the
          expected intent, room, and AI.
        </p>
        <ul className="list">
          <li>Total cases: {report.summary.total}</li>
          <li>Passed: {report.summary.passed}</li>
          <li>Failed: {report.summary.failed}</li>
        </ul>
      </section>

      {report.results.map((result) => (
        <section className="panel" key={result.testCase.id}>
          <h2>
            {result.testCase.id} · {result.passed ? "pass" : "fail"}
          </h2>
          <p>{result.testCase.request || "No explicit request. Brownfield continuation case."}</p>
          <ul className="list">
            <li>Input shape: {result.testCase.inputShape}</li>
            <li>Expected intent: {result.testCase.expectedIntent.join(" or ")}</li>
            <li>Expected room: {result.testCase.expectedRooms.join(" or ")}</li>
            <li>Expected AI: {result.testCase.expectedAis.join(" or ")}</li>
            <li>Actual intent: {result.actualIntent}</li>
            <li>Actual room: {result.actualRoom}</li>
            <li>Actual AI: {result.actualAi}</li>
            <li>Routing reason: {result.reason}</li>
            <li>Notes: {result.testCase.notes}</li>
          </ul>
          {result.mismatches.length > 0 ? (
            <>
              <h3>Mismatches</h3>
              <ul className="list">
                {result.mismatches.map((mismatch) => (
                  <li key={mismatch}>{mismatch}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ))}
    </div>
  );
}
