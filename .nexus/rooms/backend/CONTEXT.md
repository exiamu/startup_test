# backend Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-07 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: Added the `/api/command/plan` route and deepened command planning so launch packages now include room context and repo-local production truth
Next Action: Tighten command-planner behavior, sharpen room-context selection, and reduce filesystem-heavy import spread where practical

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| jarvis-ui/src/app/api/command/plan/route.ts | server endpoint that assembles command plans | 2026-04-07 |
| jarvis-ui/src/modules/command/engine.ts | intent classification, routing, and launch package assembly | 2026-04-07 |
| jarvis-ui/src/modules/project-discovery/reader.ts | brownfield repo learning and signal extraction | 2026-04-07 |
| jarvis-ui/src/modules/nexus-adapter/reader.ts | safe read adapter over `.nexus` | 2026-04-07 |
| jarvis-ui/src/app/api/startup/status/route.ts | local launcher readiness API | 2026-04-07 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| BE-001 | Keep backend logic local-first and filesystem-backed instead of introducing a database for protocol truth | 2026-04-07 | Yes |
| BE-002 | Command planning should stay deterministic and explicit rather than vague model-driven routing magic | 2026-04-07 | Yes |

## Known Issues / Blockers
- build still emits a Turbopack trace warning because filesystem-heavy project discovery imports are scoped too broadly
- command package assembly is stronger now, but some room context inputs are still thin because many room `CONTEXT.md` files were generic until this phase
- write flows are intentionally absent; backend should keep proposal-first behavior until human-approved write rules exist
- normal-environment validation is still needed for dependency auto-install and full local run behavior outside sandbox limits

## What NOT To Touch (Owned By Other Rooms)
- room ownership and strategic routing rules belong to the architect/product contract
- visual hierarchy, styling, and route UX belong to the frontend room
- See .nexus/ROUTING.md for room boundaries
