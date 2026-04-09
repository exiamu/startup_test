import { readQueueState } from "@/modules/nexus-adapter/reader";

export default async function QueuePage() {
  const queue = await readQueueState();

  return (
    <div className="grid">
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
    </div>
  );
}
