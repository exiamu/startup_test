import Link from "next/link";
import type { Route } from "next";

const aiOptions = [
  {
    name: "Claude",
    href: "/onboarding?ai=claude",
    description: "Best for strategic first-pass clarification and architecture-heavy idea shaping."
  },
  {
    name: "Codex",
    href: "/onboarding?ai=codex",
    description: "Good when you want implementation-oriented structuring from the start."
  },
  {
    name: "Gemini",
    href: "/onboarding?ai=gemini",
    description: "Useful when the first pass is broad, research-heavy, or long-context oriented."
  }
] as const;

export default function StartNewProjectPage() {
  return (
    <div className="grid">
      <section className="panel">
        <h2>New project startup</h2>
        <p>
          Pick the AI Jarvis should use as the initial framing lens. This does not lock
          the whole project to one model; it only controls the first-contact pass.
        </p>
        <p className="meta">
          Jarvis stays in setup mode here. The project should remain generic until your
          answers are clarified and later approved for writing.
        </p>
      </section>

      {aiOptions.map((option) => (
        <section className="panel" key={option.name}>
          <h2>{option.name}</h2>
          <p>{option.description}</p>
          <p>
            <Link href={option.href as Route}>Start with {option.name}</Link>
          </p>
        </section>
      ))}
    </div>
  );
}
