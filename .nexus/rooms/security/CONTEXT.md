# security Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-08 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: `/command` now routes security-flavored review prompts explicitly to the security room in the baseline validation pass
Next Action: Review whether launch packages and startup/onboarding flows expose any unsafe assumptions before write flows are ever introduced

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| .nexus/contracts/ROOM_AI_CONTRACT.md | canonical room and AI routing contract | 2026-04-07 |
| jarvis-ui/src/modules/command/engine.ts | security-related task classification and routing behavior | 2026-04-08 |
| jarvis-ui/src/modules/command/validation.ts | baseline validation includes security-flavored review coverage | 2026-04-08 |
| production/vault/CONSTRAINTS.md | safety and governance constraints for Jarvis | 2026-04-07 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| SEC-001 | Proposal-first behavior remains a safety boundary until explicit write approval exists | 2026-04-07 | Yes |
| SEC-002 | Security review and auth-risk prompts should prefer Claude over implementation-first routing | 2026-04-08 | Yes |

## Known Issues / Blockers
- there is no full security review of future write/approval flows yet because those flows are not implemented
- local-first trust assumptions are still acceptable for current build phase, but hosted deployment assumptions remain deferred
- broader prompt validation is still needed to ensure security-flavored tasks do not drift into backend implementation by mistake

## What NOT To Touch (Owned By Other Rooms)
- infrastructure enforcement belongs to devops
- core architecture decisions belong to architect
- See .nexus/ROUTING.md for room boundaries
