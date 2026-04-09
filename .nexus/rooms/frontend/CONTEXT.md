# frontend Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-07 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: Added the first real `/command` operating surface and promoted `Command` into the startup activation choices
Next Action: Refine the Jarvis UI so `/command` feels like the main operator surface without losing the startup/onboarding/brownfield pathways

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| jarvis-ui/src/app/command/command-client.tsx | primary Jarvis operating UI for routing and launch packages | 2026-04-07 |
| jarvis-ui/src/app/start/start-experience.tsx | activation flow with direct `Command`, `New`, and `Existing` entry points | 2026-04-07 |
| jarvis-ui/src/app/onboarding/onboarding-client.tsx | blank-project first-contact flow and handoff into `/command` | 2026-04-07 |
| jarvis-ui/src/app/start/existing/page.tsx | brownfield learning surface and handoff into `/command` | 2026-04-07 |
| jarvis-ui/src/app/globals.css | current mission-control styling language | 2026-04-07 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| FE-001 | Keep Jarvis UI visually intentional and premium, but subordinate to `.nexus` filesystem truth | 2026-04-07 | Yes |
| FE-002 | `/command` is now a first-class operating surface rather than a hidden secondary page | 2026-04-07 | Yes |

## Known Issues / Blockers
- `/command` is useful now, but it still needs validation against messier day-to-day prompts before it should replace other entry flows by default
- the UI should feel more like a live operator and less like a report screen, but changes must remain grounded in explicit routing and package assembly
- current styling is coherent, but later polish should strengthen hierarchy, command readability, and flow between recommendation and launch package use
- avoid pushing write flows into the UI until explicit approval exists; current behavior remains proposal-first

## What NOT To Touch (Owned By Other Rooms)
- `.nexus` contracts, vault truth, and routing ownership belong to architect/product rooms
- filesystem write semantics and approval behavior are not frontend-owned decisions
- See .nexus/ROUTING.md for room boundaries
