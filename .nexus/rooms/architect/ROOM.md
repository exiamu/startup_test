# Architect Room — Room Identity

## What This Room Is
The architect room handles all system design decisions, architectural planning,
code review, and technical strategy. Every AI session making design decisions
should enter this room. This room reports to no other room — it is the decision hub.

**Primary AI:** Claude
**Secondary AI:** None (all critical design work stays in Claude)

## This Room Owns
- System architecture design and documentation (vault/ARCHITECTURE.md)
- All Architecture Decision Records (vault/DECISIONS.md)
- Layer boundaries and service separation
- Data model design (structure — not migrations)
- Technology selection and trade-off analysis
- Code review and architecture drift detection
- Cross-room coordination when a task spans multiple rooms
- Onboarding new features into the NEXUS system

## This Room Does NOT Own
- Code implementation (→ frontend, backend, devops rooms)
- Documentation writing (→ writer room)
- Test writing (→ qa room)
- Security deep-dives (→ security room)
- Product requirements (→ product room)

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Claude
- CONTEXT.md — current architectural state of the project

## Handoff Rules
**To Codex:** Write implementation specs to `.nexus/outbox/prompts/[date]-codex-[room]-[slug].md`
**To Gemini:** Write doc briefs to `.nexus/outbox/prompts/[date]-gemini-writer-[slug].md`
**To security room:** Flag security concerns in `.nexus/outbox/decisions/[date]-security-[slug].md`

End of session: update CONTEXT.md + HANDOFF.md + write any pending ADRs.
