# Workflow: Security Audit

## Purpose
Comprehensive security review before production deployment or on a scheduled cadence.

## When To Run
- Before any production deployment (mandatory)
- After any auth/authorization changes
- After any new external API integrations
- Quarterly scheduled audit
- After any dependency updates

## Steps

### Step 1 — Scope Definition
Before starting, define what is being audited:
- [ ] New feature: [feature name, spec location]
- [ ] Full application: [version or date range]
- [ ] Specific component: [auth / payments / file upload / API]
- [ ] Dependency audit only

---

### Step 2 — Claude (security room) — Threat Modeling
**Prompt:** `bash .nexus/scripts/room-enter.sh security` → paste into Claude

Provide:
- The code to audit (file paths or diff)
- Feature description from product spec

Claude:
1. Runs STRIDE threat model
2. Maps data flows and trust boundaries
3. Identifies attack surface

---

### Step 3 — Claude (security room) — OWASP Review
Claude:
1. Runs OWASP Top 10 checklist (see shared-security.md)
2. Reviews auth implementation
3. Checks for secrets in code
4. Reviews input validation
5. Checks error messages for information leakage

---

### Step 4 — Dependency Audit
Claude or human:
```bash
# Node.js
npm audit --audit-level=moderate

# Python
pip-audit

# Review output for HIGH/CRITICAL CVEs
```

Write CVE findings to `outbox/reports/[date]-security-deps-[slug].md`

---

### Step 5 — Write Findings Report
Claude writes to `outbox/reports/[date]-security-audit-[slug].md`:
- Overall verdict: PASS / CONDITIONAL PASS / FAIL
- Each finding with: severity, location, exploitation scenario, remediation
- Pre-production sign-off checklist (completed)

---

### Step 6 — Human Review [GATE]
Read the security audit report.
- PASS → proceed to deployment
- CONDITIONAL PASS → fix MEDIUM issues, document accepted LOW findings
- FAIL → fix ALL CRITICAL and HIGH before any deployment discussion

---

### Step 7 — Sign-off Record
When approved, Claude appends to `vault/DECISIONS.md`:
```markdown
## ADR-NNN — Security Sign-off: [feature/version]
**Date:** [date]
**Status:** ACCEPTED
**Audited by:** Claude (security room) + Human review
**Findings:** [N critical, N high, N medium, N low]
**Disposition:** All critical/high resolved. [N medium accepted with rationale.]
```

---

## Automated Security Checks (GitHub Actions)
See `.nexus/github/workflows/nexus-security.yml` — runs on every PR.
The manual audit above supplements automated checks for production deployments.
