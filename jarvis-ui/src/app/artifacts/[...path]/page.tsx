import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import {
  readArtifactDirectoryState,
  readArtifactFileState
} from "@/modules/nexus-adapter/reader";

type ArtifactPageProps = {
  params: Promise<{
    path: string[];
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
};

function parentSegments(segments: string[]): string[] {
  return segments.slice(0, -1);
}

export default async function ArtifactPathPage({
  params,
  searchParams
}: ArtifactPageProps) {
  const { path } = await params;
  const { view } = await searchParams;

  try {
    if (view === "file") {
      const file = await readArtifactFileState(path);
      const parent = parentSegments(path).join("/");

      return (
        <div className="grid">
          <section className="panel">
            <h2>{file.path}</h2>
            <p>
              <Link href={(parent ? `/artifacts/${parent}` : "/artifacts") as Route}>
                Back to directory
              </Link>
            </p>
          </section>
          <section className="panel">
            <h2>File contents</h2>
            <pre className="file-view">{file.content ?? "No content available."}</pre>
          </section>
        </div>
      );
    }

    const directory = await readArtifactDirectoryState(path);
    const parent = parentSegments(path).join("/");

    return (
      <div className="grid">
        <section className="panel">
          <h2>{directory.currentPath || ".nexus"}</h2>
          <p>
            <Link href={(parent ? `/artifacts/${parent}` : "/artifacts") as Route}>
              Up one level
            </Link>
          </p>
        </section>
        <section className="panel">
          <h2>Entries</h2>
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
  } catch {
    notFound();
  }
}
