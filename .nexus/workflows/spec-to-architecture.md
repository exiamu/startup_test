# Workflow: Spec → Architecture

## Purpose
Transform an approved product spec into a detailed technical architecture design.
This is the bridge between "what to build" and "how to build it."

## Trigger
Approved product spec in `outbox/specs/APPROVED-[date]-product-spec-[slug].md`

## Steps

### Step 1 — Claude (architect room) — System Impact Analysis
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

1. Read the approved product spec
2. Read `vault/ARCHITECTURE.md` (current system design)
3. Read `vault/DECISIONS.md` (existing constraints)
4. Map which layers are affected: frontend / backend / data / devops / security
5. Identify integration points with existing code

---

### Step 2 — Claude — Design Options
For significant features, Claude writes 2 design options to `outbox/decisions/[date]-arch-options-[slug].md`:

```markdown
## Option A: [approach name]
Architecture: [description]
Affected files: [list]
Trade-offs:
  + [pro 1]
  + [pro 2]
  - [con 1]
  - [con 2]
Complexity: S / M / L / XL
Risk: LOW / MEDIUM / HIGH

## Option B: [approach name]
[same structure]

## Recommendation
Option [A/B] because [specific reasoning tied to vault/CONSTRAINTS.md and VISION.md]
```

---

### Step 3 — Human Decision [GATE]
Choose Option A or B (or request a third option).
Tell Claude: "Go with Option [X]."

---

### Step 4 — Claude — Detailed Architecture Design
Claude writes full design to `outbox/specs/[date]-architect-design-[slug].md`:

```markdown
# Architecture Design: [feature]
Based on: [spec filename]
Option chosen: [A/B]

## System Components Affected
[List each layer and what changes]

## New/Modified Data Structures
[Schema changes, new types, API request/response shapes]

## API Changes
[New endpoints or modified endpoints with full signatures]

## Room Implementation Plan
| Room | Task | Files | Complexity | Dependencies |
|------|------|-------|-----------|--------------|
| data | [task] | [files] | [S/M/L] | none |
| backend | [task] | [files] | [S/M/L] | data room done |
| frontend | [task] | [files] | [S/M/L] | backend done |
| qa | [task] | [files] | [S/M] | all above done |

## Rollout Strategy
[Feature flags? Migrations? Breaking changes? Phased rollout?]

## Security Considerations
[Auth required? Data sensitivity? Call security room?]
```

---

### Step 5 — Claude — Write ADRs
For any new technology choices or significant architectural decisions:
Append to `vault/DECISIONS.md` as PROPOSED.