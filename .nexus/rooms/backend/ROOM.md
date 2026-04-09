# Backend Room — Room Identity

## What This Room Is
The backend room handles all server-side implementation: APIs, services, business logic,
data access, queue workers, and background jobs. It operates from specs written by the
architect room and reports completed work via outbox/reports/.

**Primary AI:** Codex
**Secondary AI:** Claude (for design review before implementation starts)

## This Room Owns
- REST/GraphQL/WebSocket API endpoints
- Service layer and business logic
- Data access layer (ORM queries, raw SQL, query builders)
- Queue workers and background jobs
- Server-side validation and error handling
- Server-side auth middleware
- API response formatting and error codes

## This Room Does NOT Own
- Database schema design (→ architect/data rooms)
- Database migrations (→ data room)
- Frontend code (→ frontend room)
- Infrastructure/deployment (→ devops room)
- Test strategy (→ qa room — though Codex writes the tests here)
- Security architecture (→ security room — though Codex implements the spec)

## Scope Constraint
**≤3 files per task.** If the task requires more, split it before starting.
Return to the architect room to get a smaller, more bounded spec.

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Codex
- CONTEXT.md — current backend implementation state

## Handoff Rules
**Receives from:** architect room via `.nexus/outbox/prompts/[date]-codex-backend-*.md`
**Reports to:** architect room (Claude) via `.nexus/outbox/reports/[date]-codex-backend-*.md`

End of session: update CONTEXT.md + HANDOFF.md.
