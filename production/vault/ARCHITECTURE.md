# ARCHITECTURE.md — System Architecture Reference
<!-- Updated by the architect room. Major changes require an ADR in DECISIONS.md. -->
<!-- This is the authoritative source for system design decisions. -->
<!-- Status: [DRAFT / ACTIVE] -->

## Status: DRAFT — substantive working draft as of 2026-04-07

---

## System Overview
The system has three primary layers: `.nexus`, which is the filesystem-native AI operations protocol; `jarvis-ui`, which is the human-facing control surface; and a Jarvis runtime layer, which is responsible for actually invoking and coordinating Claude, Codex, Gemini, and future providers. `.nexus` stores durable project state, room context, decisions, handoffs, inbox/outbox artifacts, execution logs, and workflow contracts; `jarvis-ui` reads and writes that state through a controlled adapter and should never become the authoritative source itself.

The design goal is portability. The same `.nexus` folder should be able to enter a new project or an existing one, establish context, and support coordinated Claude, Codex, and Gemini workflows with minimal overhead and clear governance. The control surface is not enough by itself: the system must also be able to execute work through whichever provider is currently available and appropriate.

## Architecture Style
Hybrid filesystem protocol plus companion application.

Rationale:
- the protocol layer must remain portable, inspectable, and tool-agnostic
- the UI layer can add usability and speed without owning business truth
- room isolation and handoff artifacts keep context windows smaller and behavior more deterministic

## Tech Stack
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Protocol | markdown + shell scripts | current repo standard | maximizes portability and inspectability |
| Frontend | Next.js App Router + TypeScript | current implementation | strong fit for UI + API in one repo |
| Backend/API | Next.js route handlers + Node.js filesystem access | current implementation | enough for local adapter and workflow APIs |
| Database | none for protocol truth | — | `.nexus` remains the persistent store |
| Cache | in-memory client/server state only | — | acceptable because `.nexus` is the durable layer |
| Auth | local project trust model initially | — | defer external auth until deployment model is real |
| Hosting | local-first during build; hosted later as needed | — | avoid premature deployment complexity |
| CI/CD | GitHub Actions | current | already present in repo scaffolding |

## System Diagram
```
User
  |
  v
jarvis-ui (Next.js app)
  |
  +----> Jarvis runtime
  |         |
  |         +----> provider adapters
  |         |         |
  |         |         +----> Claude command
  |         |         +----> Codex command
  |         |         +----> Gemini command
  |         |
  |         +----> routing / fallback / execution state
  |
  +----> NexusAdapter reader/writer
              |
              v
            .nexus/
              |
              +----> vault/            immutable or append-only project truth
              +----> rooms/            role-specific prompts and context
              +----> inbox/            human inputs and findings
              +----> outbox/           specs, prompts, reports, decisions
              +----> execution/        active tasks, logs, retries, status
              +----> scripts/          setup, validation, room entry, upgrades
              +----> workflows/        reusable operating procedures
```

## Key Boundaries

### Frontend Boundary
- Owns: human-facing navigation, state presentation, route-level UX, safe interaction flows
- Never does: become the authoritative source of durable project state
- Communicates via: local route handlers and adapter calls

### Backend Boundary
- Owns: adapter APIs, safe filesystem reads/writes, intent/launch assembly, provider execution, watch streams
- Never does: bypass `.nexus` contracts or write outside approved boundaries
- Exposes: local API routes for UI consumption

### Runtime Boundary
- Owns: taking a Jarvis task from recommendation into actual provider execution
- Owns: AI capability matching, provider availability, token-budget-aware fallback, and execution status transitions
- Never does: mutate project truth outside the writer/approval rules or silently switch providers without logging the decision
- Exposes: task execution, provider status, and run-history interfaces to the UI

### Protocol Boundary
- Owns: durable project state, contracts, room context, handoffs, decisions, human-audit trail
- Never does: depend on one UI implementation to remain usable
- Access pattern: controlled reader/writer adapter with path validation and atomic writes

## Data Flow
1. Human intent enters through terminal or `jarvis-ui`
2. Routing logic maps that intent to a room, AI, and workflow using canonical contracts
3. Launch package assembly pulls only the relevant `.nexus` context for that session
4. The Jarvis runtime chooses a provider, executes through a configured local command, and records state
5. The AI produces artifacts, reports, prompts, or decisions back into `.nexus`
6. `jarvis-ui` reflects updated state, approvals, next actions, and execution status from the filesystem

## Security Architecture
- Auth method: local trusted-user model during development
- Token storage: external AI credentials remain outside repo and outside `.nexus`
- API auth: local-only assumptions initially; hosted deployment auth is deferred
- Secrets management: environment variables and external secret stores only; never in prompts or tracked files

## Scalability Considerations
- Current scale target: one owner operating across many projects and sessions
- Known bottlenecks: markdown contract drift, parser ambiguity, and write-safety mistakes
- Scale-up strategy: stabilize contracts first, then add richer UI, stronger validation, and upgrade tooling

## External Dependencies
| Service | Purpose | Fallback if down |
|---------|---------|-----------------|
| Claude / Codex / Gemini | external AI execution surfaces | use another supported AI through the runtime policy and preserve state in `.nexus` |
| GitHub | workflow automation and repo integration | manual workflow via scripts and filesystem |

---
<!-- Changes to this document require: -->
<!-- 1. An ADR entry in production/vault/DECISIONS.md -->
<!-- 2. Human approval of the ADR -->
<!-- 3. Update the relevant room's CONTEXT.md -->
