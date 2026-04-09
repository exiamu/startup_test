# DECISIONS.md — Architecture Decision Records
<!-- APPEND ONLY. Never edit or delete past entries. -->
<!-- To change a decision: add a new ADR with status SUPERSEDES ADR-NNN -->
<!-- Format: ADR-NNN, Date, Status (PROPOSED / ACCEPTED / SUPERSEDED) -->

## How to Use
- **PROPOSED**: Decision under consideration — not yet binding
- **ACCEPTED**: Decision is locked — all AI must follow it
- **SUPERSEDED by ADR-NNN**: This decision was replaced — see the new ADR

When adding a new ADR:
1. Increment the number (ADR-001, ADR-002, ...)
2. Set status to PROPOSED initially
3. Get human approval before setting to ACCEPTED
4. Never modify once ACCEPTED — only supersede

---

## ADR-001 — Adopt NEXUS as AI Operations Protocol
**Date:** 2026-04-05
**Status:** ACCEPTED

**Context:**
Development requires multiple AI tools (Claude, Gemini, Codex) across many sessions.
Without a standardized protocol, context is lost between sessions, AIs contradict each other,
and token usage scales with project size rather than task size.

**Decision:**
We will use NEXUS — a filesystem-based AI operations protocol — as the standard for all
AI-assisted development on this project. All sessions start with NEXUS.md, all decisions
are recorded here, and all AI work is routed through the room system.

**Consequences:**
+ Context is preserved across sessions via HANDOFF.md
+ Token usage is minimized via room isolation (target: ~2,300 tokens/session overhead)
+ All AI tools (Claude, Gemini, Codex) operate consistently under one protocol
+ Decisions are auditable and immutable
- Sessions require a brief setup step (room-enter.sh)
- CONTEXT.md files require maintenance to stay current

**Locked:** YES — do not revisit without explicit human instruction

---
<!-- Add new ADRs below this line -->

## ADR-002 — Preserve founding prompt and establish a canonical room/AI contract
**Date:** 2026-04-07
**Status:** ACCEPTED

**Context:**
The original founding prompt defines the intent of the entire system and must remain
available for alignment checks as `.nexus` and `jarvis-ui` evolve. At the same time,
room ownership and AI routing had started to drift across NEXUS.md, ROUTING.md,
room prompts, and helper scripts.

**Decision:**
We will preserve the original project prompt in `production/vault/FOUNDING_PROMPT.md` as an
immutable reference. We will also use `contracts/ROOM_AI_CONTRACT.md` as the canonical
source for room ownership and default AI routing, and align all derived files to it.

**Consequences:**
+ The original project intent remains reviewable without being rewritten over time
+ Routing drift now has a single contract to validate against
+ Future `jarvis-ui` routing logic has a stable filesystem source of truth
- Existing docs and prompts require an alignment pass to remove conflicting wording
- Contract changes now require deliberate updates across dependent files

**Locked:** YES — do not revisit without explicit human instruction
