# Workflow: Idea → Spec

## Purpose
Transform a raw idea from inbox/ideas.md into an approved, architect-ready product spec.

## Trigger
User drops an idea in `.nexus/inbox/ideas.md`

## Steps

### Step 1 — Claude (product room) — ~20 min
**Prompt:** `bash .nexus/scripts/room-enter.sh product` → paste into Claude

1. Read the idea from `inbox/ideas.md`
2. Read `vault/VISION.md` (does this fit the north star?)
3. Read `vault/CONSTRAINTS.md` (is this allowed by hard limits?)
4. Read `rooms/product/CONTEXT.md` (what's already on the roadmap?)
5. Write a structured spec to `outbox/specs/[date]-product-spec-[slug].md`

**Spec must include:**
- User problem (1-2 sentences)
- Proposed solution (1 paragraph)
- Acceptance criteria (Given/When/Then format)
- Out-of-scope items (explicit list)
- Complexity estimate (S/M/L/XL)
- Success metric (one measurable)

6. Mark inbox idea as `[PROCESSED: spec written to outbox/specs/...]`
7. Update CONTEXT.md and HANDOFF.md

---

### Step 2 — Human Review [GATE]
**Action:** Read `outbox/specs/[date]-product-spec-[slug].md`
- Approve: rename to `APPROVED-[filename].md`
- Request changes: add notes at bottom, tell Claude in next session

**Do NOT proceed to Step 3 without an APPROVED spec.**

---

### Step 3 — Claude (architect room) — ~30 min
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

1. Read the APPROVED spec from outbox/specs/
2. Read `vault/ARCHITECTURE.md` and `vault/DECISIONS.md`
3. Design the technical approach
4. Write architectural design to `outbox/specs/[date]-architect-design-[slug].md`

**Design must include:**
- System components affected
- New data structures or schema changes
- API changes
- Dependencies on other rooms (frontend, backend, data, devops)
- Rollout strategy (flags? migrations? breaking changes?)

5. Log any new architectural decisions as PROPOSED in `vault/DECISIONS.md`
6. Update CONTEXT.md and HANDOFF.md

---

### Step 4 — Human Approval of Architecture [GATE]
**Action:** Review architectural design and proposed ADRs
- Change any PROPOSED ADRs to ACCEPTED (edit vault/DECISIONS.md)
- Or tell Claude to revise the design

**Do NOT proceed to Step 5 without ACCEPTED ADRs.**

---

### Step 5 — Hand off to implementation
Proceed to `workflows/architecture-to-code.md`

---

## Estimated Total Time
Simple feature: 1-2 hours (mostly human review time)
Complex feature: 3-5 hours

## Abort Conditions
- Idea contradicts vault/VISION.md → mark `[DEFERRED]` in inbox, tell human why
- Idea violates vault/CONSTRAINTS.md → mark `[BLOCKED: constraint]` in inbox
- Spec passes gate but architecture is too complex for current phase → propose phased approach
