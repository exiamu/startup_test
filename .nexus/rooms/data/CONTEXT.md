# data Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-08 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: The current Jarvis system remains filesystem-native and does not use a database for protocol truth; data-related routing exists mainly for future schema/query-specific task support
Next Action: Keep the data room dormant unless a real schema, migration, analytics, or structured query task enters the command flow

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| .nexus/contracts/ROOM_AI_CONTRACT.md | canonical data-room ownership and AI defaults | 2026-04-07 |
| production/vault/ARCHITECTURE.md | confirms `.nexus` as the persistent store instead of a database | 2026-04-08 |
| jarvis-ui/src/modules/command/engine.ts | command routing path for data-related prompts | 2026-04-08 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| DATA-001 | `.nexus` remains the durable system store; do not introduce a database for protocol truth during this phase | 2026-04-07 | Yes |

## Known Issues / Blockers
- there is no active schema/migration layer in this project today
- data-room routing exists, but it has not been deeply exercised because current work is command/orchestration-focused

## What NOT To Touch (Owned By Other Rooms)
- backend API logic belongs to backend
- architecture and persistence-boundary decisions belong to architect
- See .nexus/ROUTING.md for room boundaries
