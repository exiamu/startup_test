import { readVaultState } from "@/modules/nexus-adapter/reader";

export default async function VaultPage() {
  const docs = await readVaultState();

  return (
    <div className="grid">
      {docs.map((doc) => (
        <section className="panel" key={doc.name}>
          <h2>{doc.name}</h2>
          <ul className="list">
            <li>Exists: {doc.exists ? "yes" : "no"}</li>
            <li>Status: {doc.status ?? "not declared"}</li>
            <li>Heading: {doc.heading ?? "not found"}</li>
          </ul>
        </section>
      ))}
    </div>
  );
}
