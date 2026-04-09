# Workflow: Code Review

## Purpose
Review a pull request or code diff for quality, security, architecture alignment, and test coverage.

## Trigger
- New PR opened
- Human requests a review: "Review PR #X" or "Review these files"
- Scheduled review of a code branch

## Steps

### Step 1 — Claude (architect room) — Architecture Review
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

Provide Claude with:
- PR diff or list of changed files
- PR description / ticket context

Claude:
1. Reads `vault/DECISIONS.md` (checking for drift)
2. Reads `vault/ARCHITECTURE.md` (checking layer violations)
3. Reviews the diff for:
   - Architecture violations
   - Code quality issues
   - Missing tests
   - API contract changes (breaking?)
   - Performance concerns
4. Writes architecture review to `outbox/reports/[date]-review-pr[N]-arch.md`

**Verdict:** APPROVED / APPROVED WITH SUGGESTIONS / CHANGES REQUIRED / BLOCKED

---

### Step 2 — Security Review (if needed)
**Run if:** Changes touch auth, user input, external APIs, file handling, or data access

**Prompt:** `bash .nexus/scripts/room-enter.sh security` → paste into Claude

Claude:
1. Runs OWASP checklist on the diff
2. Writes security findings to `outbox/reports/[date]-review-pr[N]-security.md`

**Verdict:** PASS / CONDITIONAL PASS / FAIL

---

### Step 3 — Human Decision
Read both review reports.
- Both APPROVED → merge
- CHANGES REQUIRED → author fixes, re-review on the changed files only
- BLOCKED → escalate

---

## Fast-Track Review (for small, isolated changes)
For changes touching ≤2 files with no auth/data impact:

1. Claude in architect room
2. Single review covering both arch + quick security check
3. ~15 minute review

---

## PR Requirements Checklist (must pass before review)
- [ ] HANDOFF.md updated in the PR (or confirmed no session changes)
- [ ] vault/DECISIONS.md is append-only (no retroactive edits)
- [ ] All CI tests passing
- [ ] No merge conflicts
- [ ] PR description explains the WHY, not just the WHAT
