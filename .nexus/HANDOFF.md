# HANDOFF.md — Session Resume Document
<!-- Read this FIRST at the start of every AI session. -->
<!-- Update this at the END of every session. Target: ≤300 lines. -->
<!-- Archive overflow to .nexus/handoffs/archive/[date]-handoff.md -->

## Machine State
```
Project:      startup_test
Phase:        Runtime Build — 7-Day Execution Plan Active
Next Action:  Run one manual local-machine browser test of `/jarvis` plus `/command` execution/session restore and capture any live runtime failures outside the sandbox.
Blocker:      Sandbox here blocks local port binding, so final browser-driven runtime verification must happen on a normal machine.
Last Session: 2026-04-09 | Codex | Added the first direct `/jarvis` commander-facing surface on top of the runtime/session layer.
Tests:        `jarvis-ui` build/typecheck pass; provider smoke tests pass; execution routes verified; command-session restore, runtime visibility, and `/jarvis` build clean; live port bind blocked in sandbox.
Build:        `jarvis-ui` production build is clean and stable.
```

## What Just Happened
- Gemini (acting as Architect) defined Slice 03 as the final bridge to a testable runtime.
- Codex implemented Slice 03: `/command` now triggers execution, polls status, and surfaces minimal runtime feedback.
- `init.sh` now creates the runtime directories needed by provider execution in fresh installs.
- `health-check.sh` now validates `providers.json`, `execution/`, `sessions/`, and provider scripts.
- The repo was copied into a clean adopting-project directory at `/tmp/jarvis-dropin-test`.
- The copied repo passed `init.sh`, `health-check.sh`, and `jarvis-ui` production build.
- `start-jarvis.sh` reached the `next dev` launch step and then failed only because this sandbox blocks port binding on `localhost:3000`.
- No code defects were exposed by the drop-in test path inside this environment.
- `/command` now creates lightweight session records in `.nexus/sessions/` and can restore them from `sessionId`.
- Execution records now link back to command-session turns so the runtime has a minimal continuity layer.
- `/queue` now exposes recent sessions and executions as a lightweight runtime operations surface.
- `/jarvis` now exists as the direct commander-facing entrypoint, with `/command` kept as the more technical operating view.

## Exact Resume Point
Next pass is a **manual live runtime check** on a normal local machine:
1.  Read:
    - `production/STATUS.md`
    - `production/plans/runtime_build_plan.md`
    - `production/outbox/reports/2026-04-09-codex-drop-in-empty-project-test.md`
    - `production/outbox/reports/2026-04-09-codex-command-session-runtime-slice-04.md`
    - `production/outbox/reports/2026-04-09-codex-runtime-visibility-slice-05.md`
    - `production/outbox/reports/2026-04-09-codex-direct-jarvis-surface-slice-06.md`
2.  On a normal machine, create a minimal repo containing only `.nexus/` and `jarvis-ui/`.
3.  Run `bash .nexus/scripts/init.sh`.
4.  Run `bash .nexus/scripts/start-jarvis.sh`.
5.  Open `/jarvis`, ask Jarvis for a next move, and confirm the session is created and visible.
6.  Execute the latest move, then confirm execution records and output artifacts are written under `.nexus/execution/`.
7.  Open `/command?sessionId=...` and confirm the technical view restores the same session from `.nexus/sessions/`.
8.  Record any live failures as the next bounded implementation slice instead of widening scope.

## Active Files For Claude
- `production/README.md`
- `production/STATUS.md`
- `production/plans/implementation_plan.md`
- `production/plans/runtime_build_plan.md`
- `production/outbox/prompts/2026-04-09-codex-frontend-command-execution-slice-03.md`
- `production/outbox/reports/2026-04-09-codex-backend-execution-runtime-slice-02.md`
- `production/vault/FOUNDING_PROMPT.md`
- `production/vault/ARCHITECTURE.md`
- `.nexus/HANDOFF.md`
- `.nexus/contracts/ROOM_AI_CONTRACT.md`
- `README.md`
- `jarvis-ui/src/modules/command/engine.ts`
- `jarvis-ui/src/modules/project-discovery/reader.ts`
- `jarvis-ui/src/app/command/command-client.tsx`

## Active Files
| File | Status | Notes |
|------|--------|-------|
| production/STATUS.md | active | Current state, reality check, and active next work |
| production/plans/implementation_plan.md | active | Governing roadmap for `.nexus` + `jarvis-ui` |
| production/plans/runtime_build_plan.md | active | New 7-day execution plan for the Jarvis runtime layer |
| production/outbox/prompts/2026-04-09-codex-frontend-command-execution-slice-03.md | historical | Completed Codex spec for frontend execution runtime slice 03 |
| production/outbox/reports/2026-04-09-codex-backend-provider-runtime-slice-01.md | active | Codex implementation report for completed provider runtime slice 01 |
| production/outbox/reports/2026-04-09-codex-backend-execution-runtime-slice-02.md | active | Codex implementation report for completed execution runtime slice 02 |
| production/outbox/reports/2026-04-09-codex-frontend-command-execution-slice-03.md | active | Codex implementation report for completed frontend execution runtime slice 03 |
| production/outbox/reports/2026-04-09-codex-drop-in-empty-project-test.md | active | Drop-in empty-project test result from a clean copied repo |
| production/outbox/reports/2026-04-09-codex-command-session-runtime-slice-04.md | active | Codex implementation report for lightweight command-session persistence |
| production/outbox/reports/2026-04-09-codex-runtime-visibility-slice-05.md | active | Codex implementation report for lightweight runtime visibility in `/queue` |
| production/outbox/reports/2026-04-09-codex-direct-jarvis-surface-slice-06.md | active | Codex implementation report for the first direct `/jarvis` surface |
| production/vault/FOUNDING_PROMPT.md | active | Immutable origin for the Jarvis system itself |
| production/vault/ARCHITECTURE.md | active | Current architecture truth, including the missing runtime layer |
| production/vault/VISION.md | active | Product vision for the Jarvis system in this repository |
| production/vault/CONSTRAINTS.md | active | Constraints for the Jarvis system in this repository |
| production/vault/DECISIONS.md | active | Jarvis system ADR history for this repository |
| production/README.md | active | Canonical doc map and repo-boundary guidance |
| README.md | active | Root overview and current product reality |
| .nexus/HANDOFF.md | active | Session resume point for any AI entering the repo |
| .nexus/contracts/ROOM_AI_CONTRACT.md | active | Canonical room and AI contract |
| .nexus/NEXUS.md | active | Portable protocol entrypoint and routing overview |
| production/plans/portable_boot_flow.md | active | Portable startup contract |
| production/plans/command_validation_matrix.md | active | Validation standard for `/command` routing behavior |
| production/plans/master_plan.md | historical | Early companion-app plan kept for lineage |
| production/plans/next_master_plan.md | historical | Bridge plan from startup into `/command`, kept for lineage |
| production/outbox/prompts/* | historical | Older prompts retained for audit trail and lineage |
| production/outbox/reports/* | historical | Older reports produced during earlier Jarvis-building reviews |
| jarvis-ui/src/modules/command/engine.ts | active | Current command planner and launch-package assembly |
| jarvis-ui/src/modules/project-discovery/reader.ts | active | Brownfield/project discovery logic |
| jarvis-ui/src/modules/nexus-adapter/reader.ts | active | Filesystem read adapter |
| jarvis-ui/src/app/command/command-client.tsx | active | Current `/command` UI surface |
| jarvis-ui/src/app/start/start-experience.tsx | active | Startup fitting flow |
| jarvis-ui/src/app/start/existing/page.tsx | active | Brownfield fitting flow |
| jarvis-ui/src/app/onboarding/onboarding-client.tsx | active | New-project fitting flow |

## Pending Decisions (Awaiting Human)
- None yet

## Known Issues
| ID | Description | Status | Room |
|----|-------------|--------|------|
| RUNTIME-001 | Jarvis now has a direct `/jarvis` surface plus session persistence, but it still lacks fallback policy, richer memory, and true autonomous continuation | Open | architect |
| TEST-001 | Clean drop-in repo passes init/health-check/build, but live browser verification still needs a normal machine because the sandbox blocks port binding | Open | architect/frontend |

## Next Session Recommended AI
**Codex** — fix only whatever a real local-machine `/jarvis` and `/command` runtime test exposes

---
<!-- Template for future session updates: -->
<!--
## 2026-04-05 Session — [AI used] — [Room]
### What changed
- bullet points
### Resume point
exact instruction
-->
