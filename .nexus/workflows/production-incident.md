# Workflow: Production Incident Response

## Purpose
Structured response to production issues that minimizes downtime and prevents recurrence.

## Severity Levels
- **SEV1:** Full outage — no users can use core functionality → respond immediately
- **SEV2:** Partial outage — major feature broken, significant user impact → respond within 15 min
- **SEV3:** Degraded performance — slow, intermittent issues → respond within 1 hour

## Phase 1: Triage (0-5 minutes)

### Human + Claude (devops room)
**Prompt:** `bash .nexus/scripts/room-enter.sh devops` → paste into Claude

1. Declare severity level
2. Identify blast radius: who is affected, what is broken
3. Check: is this a deployment-related regression?
   - If YES: execute rollback immediately (see deployment.md rollback plan)
   - If NO: proceed to Phase 2

Write immediately to HANDOFF.md:
```
[INCIDENT SEV[N]] [feature/system affected] — declared [HH:MM]
Status: INVESTIGATING
```

---

## Phase 2: Mitigation (5-30 minutes)

### Goal: Restore service first. Root cause second.

Options (fastest to slowest):
1. **Feature flag off** — disable the broken feature if isolated
2. **Rollback** — revert the last deployment
3. **Scale up** — if it's a capacity issue
4. **Database query kill** — if a runaway query is causing load
5. **Rate limit** — if it's an abuse/traffic spike

Claude (devops room):
1. Identify the fastest mitigation path
2. Codex implements if code change is needed (≤3 files, emergency scope)
3. Deploy mitigation

Update HANDOFF.md with mitigation status every 15 minutes until resolved.

---

## Phase 3: Root Cause Analysis (after service restored)

### Claude (backend + architect rooms)
1. Read logs from the incident window
2. Trace the failure path
3. Identify the root cause (not just the symptom)
4. Write RCA to `outbox/reports/[date]-incident-rca-[slug].md`

RCA format:
```markdown
# Incident RCA: [title]
Severity: SEV[N]
Duration: [start] → [end] ([N] minutes)
Impact: [users affected, features broken]

## Timeline
- [HH:MM] First alert / report
- [HH:MM] Triage started
- [HH:MM] Mitigation applied
- [HH:MM] Service restored

## Root Cause
[Specific, technical explanation — not "human error"]

## Contributing Factors
[What conditions allowed this to happen]

## Fix Applied
[What was done to restore service]

## Prevention
[What changes prevent this from happening again]
- [ ] Task: [action item] → [owner / room]
- [ ] Task: [action item] → [owner / room]
```

---

## Phase 4: Follow-up (within 48 hours)

1. Human reviews RCA
2. Prevention tasks enter `inbox/requests.md`
3. RCA is appended as a note to `vault/DECISIONS.md` if an architectural change is needed
4. Post-mortem shared with team (if applicable)

---

## Communication Template (for user-facing incidents)
```
Status Update — [HH:MM]
We are investigating an issue affecting [feature].
Impact: [who/what is affected]
Status: [Investigating / Identified / Monitoring / Resolved]
Next update: [HH:MM]
```
