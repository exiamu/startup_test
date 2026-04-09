# product Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-08 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: The project now has a real `/command` operator surface, onboarding continuation, brownfield continuation, and an executable baseline validation pass
Next Action: Tighten the product definition for daily-use Jarvis behavior, especially what should happen after successful validation and what “ready for real use” means

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| production/vault/FOUNDING_PROMPT.md | immutable original product intent | 2026-04-07 |
| production/vault/VISION.md | active product vision for the Jarvis system | 2026-04-07 |
| production/STATUS.md | current working state and next recommended work | 2026-04-08 |
| production/plans/next_master_plan.md | next capability layer after startup/onboarding | 2026-04-07 |
| production/plans/command_validation_matrix.md | baseline success criteria for `/command` | 2026-04-08 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| PR-001 | Jarvis must support small daily tasks, not only startup/project-setup flows | 2026-04-07 | Yes |
| PR-002 | Routing and model usage must remain explicit and explainable, not hidden behind vague AI behavior | 2026-04-07 | Yes |

## Known Issues / Blockers
- the baseline `/command` matrix is green, but broader real-world prompt coverage still needs to be proven
- the system is still proposal-first; product expectations must not drift into write automation without explicit approval
- post-validation product decisions still remain open around whether `/command` becomes the default operating landing surface

## What NOT To Touch (Owned By Other Rooms)
- architectural enforcement and ADR ownership belong to the architect room
- implementation details belong to the relevant implementation room
- See .nexus/ROUTING.md for room boundaries
