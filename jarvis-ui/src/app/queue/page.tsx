import Link from "next/link";
import type { Route } from "next";

import { readQueueState } from "@/modules/nexus-adapter/reader";

export default async function QueuePage() {
  const queue = await readQueueState();

  return (
    <div className="grid">
      <section className="panel">
        <h2>Active mission</h2>
        {queue.activeMission ? (
          <ul className="list">
            <li>Objective: {queue.activeMission.objective}</li>
            <li>State: {queue.activeMission.missionState}</li>
            <li>Directive: {queue.activeMission.missionDirective}</li>
            {queue.activeMission.missionFocus ? <li>Focus: {queue.activeMission.missionFocus}</li> : null}
            <li>Continue eligible: {queue.activeMission.canContinue ? "yes" : "no"}</li>
            {queue.activeMission.sessionId ? (
              <li>
                <Link href={`/jarvis?sessionId=${queue.activeMission.sessionId}` as Route}>
                  open mission session
                </Link>
              </li>
            ) : null}
          </ul>
        ) : (
          <p>No active mission recorded yet.</p>
        )}
      </section>

      <section className="panel">
        <h2>Inbox</h2>
        <ul className="list">
          {Object.entries(queue.inboxCounts).map(([name, count]) => (
            <li key={name}>
              {name}: {count}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Outbox</h2>
        <ul className="list">
          {Object.entries(queue.outboxCounts).map(([name, count]) => (
            <li key={name}>
              {name}: {count}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Recent tasks</h2>
        <ul className="list">
          {queue.recentTasks.length > 0 ? (
            queue.recentTasks.map((task) => (
              <li key={task.taskId}>
                {task.title} · {task.room} / {task.provider} / {task.status}
                {task.sessionId ? (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/jarvis?sessionId=${task.sessionId}` as Route}>
                      jarvis
                    </Link>
                  </>
                ) : null}
              </li>
            ))
          ) : (
            <li>No Jarvis tasks yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Recent sessions</h2>
        <ul className="list">
          {queue.recentSessions.length > 0 ? (
            queue.recentSessions.map((session) => (
              <li key={session.sessionId}>
                <Link href={`/command?sessionId=${session.sessionId}` as Route}>
                  {session.sessionId}
                </Link>
                : {session.turnCount} turns · {session.missionState}
                {session.missionFocus ? ` · ${session.missionFocus}` : ""}
                {session.lastRequest ? ` · ${session.lastRequest}` : ""}
              </li>
            ))
          ) : (
            <li>No Jarvis sessions yet.</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h2>Recent executions</h2>
        <ul className="list">
          {queue.recentExecutions.length > 0 ? (
            queue.recentExecutions.map((execution) => (
              <li key={execution.executionId}>
                {execution.provider} / {execution.room} / {execution.status}
                {execution.sessionId ? (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/command?sessionId=${execution.sessionId}` as Route}>
                      session
                    </Link>
                  </>
                ) : null}
                {execution.outputPath ? (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/artifacts/${execution.outputPath}?view=file` as Route}>
                      output
                    </Link>
                  </>
                ) : null}
              </li>
            ))
          ) : (
            <li>No executions yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
