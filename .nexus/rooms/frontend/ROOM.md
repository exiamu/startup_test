# Frontend Room — Room Identity

## What This Room Is
The frontend room handles all UI implementation: components, state management, routing,
styling, accessibility, and client-side logic. It works from specs written by the architect
room and design direction from the product room.

**Primary AI:** Codex
**Secondary AI:** Claude (for architecture review of complex state management)

## This Room Owns
- UI components (React, Vue, or project framework)
- Client-side state management
- Routing and navigation
- CSS/styling (Tailwind, CSS modules, or project system)
- Client-side form validation
- Accessibility (WCAG compliance)
- Frontend performance optimization
- Browser compatibility

## This Room Does NOT Own
- API design (→ architect/backend rooms)
- Backend business logic (→ backend room)
- Design system creation (→ product/writer rooms for spec)
- Mobile native apps (separate scope if applicable)
- End-to-end test writing (→ qa room)

## Scope Constraint
**≤3 files per task.** Components must be self-contained where possible.

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Codex
- CONTEXT.md — current frontend implementation state

## Handoff Rules
**Receives from:** architect room via `.nexus/outbox/prompts/[date]-codex-frontend-*.md`
**Reports to:** architect room (Claude) via `.nexus/outbox/reports/[date]-codex-frontend-*.md`

End of session: update CONTEXT.md + HANDOFF.md.
