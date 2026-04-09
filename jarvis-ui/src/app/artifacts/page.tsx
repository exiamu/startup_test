import Link from "next/link";
import type { Route } from "next";

import { readArtifactDirectoryState } from "@/modules/nexus-adapter/reader";

export default async function ArtifactsPage() {
  const directory = await readArtifactDirectoryState();

  return (
    <div className="grid">
      <section className="panel">
        <h2>Artifact browser</h2>
        <p>
          Browse the portable NEXUS filesystem directly. Direct file viewing helps verify
          what the UI is actually deriving from.
        </p>
      </section>

      <section className="panel">
        <h2>Root</h2>
        <ul className="list">
          {directory.entries.map((entry) => (
            <li key={entry.path}>
              {entry.kind === "directory" ? (
                <Link href={`/artifacts/${entry.path}` as Route}>{entry.name}/</Link>
              ) : (
                <Link href={`/artifacts/${entry.path}?view=file` as Route}>{entry.name}</Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
