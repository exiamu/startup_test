# Workflow: Deployment

## Purpose
Deploy a code change safely from local to staging to production with rollback readiness.

## Prerequisites (all must be met before starting)
- [ ] Code review: APPROVED (see code-review.md)
- [ ] Security audit: PASS or CONDITIONAL PASS (see security-audit.md)
- [ ] All CI tests: GREEN
- [ ] QA: all tests passing
- [ ] Rollback plan: documented (see Step 2)
- [ ] No active incidents in production

## Steps

### Step 1 — Codex (devops room) — Pre-Deployment Check
**Prompt:** `bash .nexus/scripts/room-enter.sh devops` → paste into Codex

Codex:
1. Verifies all prerequisites above are met
2. Reviews deployment scripts for correctness
3. Confirms environment variables are configured in target environment
4. Confirms monitoring alerts are set up for new features

**If any prerequisite is missing: HALT. Write `[DEPLOY BLOCKED: reason]` to HANDOFF.md.**

---

### Step 2 — Document Rollback Plan
Before deploying, Claude in architect room writes `outbox/reports/[date]-rollback-[slug].md`:
```markdown
# Rollback Plan: [feature/version]
## To roll back this deployment:
1. [Specific step 1]
2. [Specific step 2]
## Database migrations to reverse (if any):
- Run: [migration rollback command]
## Feature flags to disable:
- [flag name] → set to false
## Estimated rollback time: [N minutes]
## Rollback decision owner: [who decides to roll back]
```

---

### Step 3 — Staging Deployment
Codex (devops room):
1. Deploy to staging environment
2. Run health check: `[health check URL]` returns 200
3. Run smoke test suite
4. Verify monitoring dashboard shows no anomalies (5 min observation)

Write `outbox/reports/[date]-staging-deploy-[slug].md` with results.

**If staging fails: debug in devops/backend rooms, do not proceed to production.**

---

### Step 4 — Human Approval for Production [GATE]
**Human must explicitly say "deploy to production"** — no AI deploys to production unilaterally.

Review:
- Staging deployment report
- Rollback plan
- Any open incidents or known issues

---

### Step 5 — Production Deployment
Codex (devops room) with human present:
1. Deploy using blue-green or canary strategy (per ARCHITECTURE.md)
2. Monitor for 15 minutes post-deployment:
   - Error rate: should not spike
   - Response time: should not degrade
   - Key business metrics: should be normal
3. If anomaly detected: execute rollback plan immediately

Write `outbox/reports/[date]-production-deploy-[slug].md`.

---

### Step 6 — Post-Deployment
Codex:
1. Update HANDOFF.md with deployment status and new version
2. Update `rooms/devops/CONTEXT.md`
3. Archive rollback plan (keep for 30 days)

Claude (writer room, optional):
- Update CHANGELOG.md with release notes

---

## Emergency Rollback
If production is degraded post-deployment:
1. Execute rollback plan immediately (do not wait for root cause)
2. Declare [INCIDENT] — start `workflows/production-incident.md`
3. Do not redeploy until root cause is identified and fixed
