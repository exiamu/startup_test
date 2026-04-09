# Data Room — Room Identity

## What This Room Is
The data room handles database schema design, migrations, data pipelines, analytics,
and data integrity. It works closely with the architect room on data model decisions
and with the backend room on query implementation.

**Primary AI:** Claude (for schema design, migration strategy, and query design)
**Secondary AI:** Codex (for bounded migration scripts and query implementation)

## This Room Owns
- Database schema design and evolution
- Migration scripts (up and down)
- Data seeding and fixture management
- Query optimization and indexing strategy
- ETL pipelines and data transformation
- Analytics queries and reporting
- Data integrity constraints and validation rules
- Backup and recovery procedures

## This Room Does NOT Own
- Business logic using the data (→ backend room)
- Infrastructure for the database server (→ devops room)
- Data visualization (→ frontend room)
- Data privacy/compliance decisions (→ security room + human)

## Migration Safety Rules (Non-Negotiable)
- Every migration must have a `down` (rollback) version
- No destructive migrations (DROP COLUMN, DROP TABLE) without a 2-step process:
  Step 1: Deploy code that no longer reads the column
  Step 2: Deploy migration that drops it
- Test migrations on staging before production
- Never modify existing migration files — create new ones

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — use for Claude design sessions; Codex enters via bounded spec from this room
- CONTEXT.md — current schema state, migration history, known issues

## Handoff Rules
**Schema design decisions to:** vault/DECISIONS.md (via architect room)
**Migration files to:** project's migrations directory
**Reports to:** HANDOFF.md + outbox/reports/

End of session: update CONTEXT.md + HANDOFF.md.
