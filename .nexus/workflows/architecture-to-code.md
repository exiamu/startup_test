# Workflow: Architecture → Code

## Purpose
Transform an approved architectural design into implemented, tested code.

## Trigger
Approved spec in `outbox/specs/APPROVED-[date]-architect-design-[slug].md`

## Steps

### Step 1 — Claude (architect room) — Write Codex Specs
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

For each room that needs implementation (frontend, backend, data, devops):

1. Read the approved architectural design
2. Write a bounded Codex spec (≤3 files) to `outbox/prompts/[date]-codex-[room]-[slug].md`

**Each Codex spec must include:**
- Exact file paths to create or modify
- Function signatures and types
- Expected behavior in plain English
- Edge cases to handle
- Example inputs and expected outputs
- Which existing patterns to follow (file path references)
- Test cases required

3. Update HANDOFF.md with: "Specs written for [room(s)], awaiting Codex implementation"

---

### Step 2 — Codex Implementation (per room)
**Prompt:** `bash .nexus/scripts/room-enter.sh [room]` → paste into Codex
Then: "Read `outbox/prompts/[date]-codex-[room]-[slug].md` and implement it."

Codex:
1. Reads the spec
2. Reads existing code patterns (≤3 file scan per spec)
3. Implements
4. Writes tests
5. Writes completion report to `outbox/reports/[date]-codex-[room]-[slug].md`

**Run rooms in dependency order:**
1. data room (schema/migrations — if any)
2. backend room (APIs and services)
3. frontend room (UI consuming the APIs)
4. qa room (tests if not written inline)
5. devops room (if deployment config changes)

---

### Step 3 — Claude Review (architect room)
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

1. Read all Codex completion reports from `outbox/reports/`
2. Review the actual diffs (read the changed files)
3. Check for:
   - Alignment with the spec
   - Architecture drift
   - Security issues (flag for security room if needed)
   - Test coverage
4. Write review to `outbox/reports/[date]-review-[slug].md`

**Decision:**
- APPROVED → proceed to security audit (Step 4)
- CHANGES REQUIRED → write new Codex specs for revisions, repeat Step 2

---

### Step 4 — Security Audit (security room)
Run if: new auth, new endpoints, file uploads, external integrations, or user input handling

**Prompt:** `bash .nexus/scripts/room-enter.sh security` → paste into Claude

1. Read the changed files and Codex reports
2. Run OWASP checklist
3. Write findings to `outbox/reports/[date]-security-audit-[slug].md`

**Decision:**
- PASS or CONDITIONAL PASS → proceed to Step 5
- FAIL → fix issues (back to Step 2), then re-audit

---

### Step 5 — QA Verification (qa room)
**Prompt:** `bash .nexus/scripts/room-enter.sh qa` → paste into Codex

1. Review test coverage from Codex reports
2. Write missing tests
3. Report final pass/fail count

---

### Step 6 — Ready for Deployment
Proceed to `workflows/deployment.md`

---

## Estimated Total Time
Simple feature (backend only): 2-4 hours
Full-stack feature: 4-8 hours
Complex feature with migrations: 1-2 days

## Abort Conditions
- Codex reports more than 3 files needed → re-scope in architect room
- Security audit returns FAIL with CRITICAL findings → halt, fix first
- Tests reveal a design flaw → return to architect room for redesign
