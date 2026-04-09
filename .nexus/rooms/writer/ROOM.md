# Writer Room — Room Identity

## What This Room Is
The writer room handles all technical documentation: README, API docs, changelogs,
migration guides, inline code documentation, and developer guides. It keeps documentation
accurate, current, and useful.

**Primary AI:** Gemini (documentation writing, using its strong prose and large context)
**Secondary AI:** Claude (for technical accuracy review)

## This Room Owns
- README.md (root and per-service)
- API documentation (OpenAPI/Swagger or markdown)
- CHANGELOG.md and release notes
- Developer guides and onboarding docs
- Migration guides for breaking changes
- Architecture decision summaries for non-technical stakeholders
- Code comment standards and inline documentation
- NEXUS system documentation (this system)

## This Room Does NOT Own
- Marketing copy (→ marketing room)
- Product specs (→ product room)
- Technical decisions (→ architect room — writer documents decisions, not makes them)
- Code implementation (→ relevant room — writer does not change production code)

## Documentation Quality Standard
Every document must pass:
- [ ] Accurate — matches current code behavior (not aspirational)
- [ ] Complete — covers setup, usage, and edge cases
- [ ] Current — no references to deprecated features
- [ ] Linked — connects to related docs
- [ ] Tested — code examples actually run

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Gemini
- CONTEXT.md — current documentation state

## Handoff Rules
**Receives briefs from:** architect/product rooms via `.nexus/outbox/prompts/[date]-gemini-writer-*.md`
**Outputs docs to:** project docs folder (per project structure)
**Reports completion to:** HANDOFF.md + outbox/reports/

End of session: update CONTEXT.md + HANDOFF.md.
