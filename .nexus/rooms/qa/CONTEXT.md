# qa Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-07 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: Added a formal `/command` validation target in production docs and verified typecheck/build after command-planner upgrades
Next Action: Turn the validation matrix into repeatable checks for routing quality, package usefulness, and brownfield/onboarding continuation credibility

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| production/plans/command_validation_matrix.md | explicit expected behavior for `/command` | 2026-04-07 |
| production/STATUS.md | current verified state and known follow-up items | 2026-04-07 |
| jarvis-ui/src/modules/command/engine.ts | routing behavior under validation | 2026-04-07 |
| jarvis-ui/src/app/command/command-client.tsx | user-facing output for recommendation and package review | 2026-04-07 |
| jarvis-ui/package.json | current verification commands: `typecheck`, `build` | 2026-04-07 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| QA-001 | `/command` should be evaluated with an explicit prompt/repo matrix, not only developer intuition | 2026-04-07 | Yes |
| QA-002 | Typecheck and production build are mandatory checks before closing implementation passes | 2026-04-07 | Yes |

## Known Issues / Blockers
- there are no automated tests yet for command classification, room routing, or package assembly
- validation currently exists as a documented matrix, not as executable tests
- sandbox limits still block full localhost run validation and online dependency-install verification
- brownfield heuristics and messy-prompt handling still need broader real-world coverage

## What NOT To Touch (Owned By Other Rooms)
- fixing implementation bugs belongs to the relevant implementation room once QA identifies them
- deployment pipeline ownership belongs to devops
- See .nexus/ROUTING.md for room boundaries
