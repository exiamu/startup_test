# HANDOFF.md — Session Resume Document
<!-- Read this FIRST at the start of every AI session. -->
<!-- Update this at the END of every session. Target: ≤300 lines. -->
<!-- Archive overflow to .nexus/handoffs/archive/[date]-handoff.md -->

## Machine State
```
Project:      startup_test
Phase:        Runtime Build — 7-Day Execution Plan Active
Next Action:  Run a normal-machine browser test of the new active-mission and `Continue mission` flow, then move into token/budget-aware provider policy.
Blocker:      None for code work. Final browser-driven runtime verification still needs a normal machine because the sandbox here blocks local port binding.
Last Session: 2026-04-19 | Codex | Implemented active mission persistence plus the first explicit safe `Continue mission` action.
Tests:        `jarvis-ui` typecheck/build pass; health-check passes with only existing draft warnings; `/jarvis`, `/command`, `/queue`, mission routes, task-ledger flow, session-aware planning, provider readiness, provider fallback, bounded recovery, mission state, and active-mission continuation all build clean; live port bind blocked in sandbox.
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
- task records now persist in `.nexus/tasks/` and are linked to session turns plus execution records.
- planning now reads active session/task state and surfaces mission continuity in `/jarvis` and `/command`.
- provider readiness now surfaces whether Claude, Codex, or Gemini are actually runnable before execution is offered.
- execution now falls back to the next ready provider when the primary AI is unavailable.
- execution records now retain recovery notes, attempted providers, and retry counts when a launched run fails.
- Jarvis now retries once and can switch providers after a failed run before marking the execution failed.
- planning now derives a mission state and mission directive from active tasks, latest execution status, and recovery notes.
- `/jarvis` and `/command` now show whether Jarvis believes the mission is idle, advancing, recovering, or blocked.
- continuation requests now preserve mission focus when one active task is in flight.
- multiple active tasks now surface as ambiguity, and Jarvis pushes the commander to choose priority instead of widening scope blindly.
- active mission state now persists to `.nexus/mission/active.json` so the current objective, focus, status, and continue eligibility survive beyond a single page render.
- `/api/mission/active` now exposes the current mission contract to the UI layer.
- `/api/command/continue` now creates the next turn for the active mission when continuation is safe, then `/jarvis` and `/command` can launch it directly.
- `/queue` now shows the live active mission so runtime state is visible without opening raw files.

## Exact Resume Point
Next pass should validate and extend the new active-mission layer:
1.  Read:
    - `production/STATUS.md`
    - `production/plans/runtime_build_plan.md`
    - `production/outbox/reports/2026-04-10-codex-session-aware-planning-slice-08.md`
    - `production/outbox/reports/2026-04-10-codex-provider-readiness-slice-09.md`
    - `production/outbox/reports/2026-04-10-codex-provider-fallback-slice-10.md`
    - `production/outbox/reports/2026-04-10-codex-recovery-runtime-slice-11.md`
    - `production/outbox/reports/2026-04-10-codex-mission-state-slice-12.md`
    - `production/outbox/reports/2026-04-14-codex-mission-behavior-slice-13.md`
    - `production/outbox/reports/2026-04-19-codex-active-mission-continue-slice-14.md`
2.  Run one normal-machine browser test of `/jarvis` and `/command` using the new `Continue mission` action.
3.  Confirm that `.nexus/mission/active.json`, `.nexus/tasks/`, `.nexus/sessions/`, and `.nexus/execution/` stay aligned through plan -> execute -> recover -> continue.
4.  After runtime validation, design the next slice for token/budget-aware provider policy and stronger mission-manager rules.
5.  Keep the system explicit: safe continue is implemented, but autonomous continuation should not be widened until the policy layer is documented first.

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
| production/outbox/reports/2026-04-10-codex-task-ledger-slice-07.md | active | Codex implementation report for the first durable Jarvis task ledger |
| production/outbox/reports/2026-04-10-codex-session-aware-planning-slice-08.md | active | Codex implementation report for session-aware Jarvis planning |
| production/outbox/reports/2026-04-10-codex-provider-readiness-slice-09.md | active | Codex implementation report for provider readiness and execution gating |
| production/outbox/reports/2026-04-10-codex-provider-fallback-slice-10.md | active | Codex implementation report for first-pass provider fallback |
| production/outbox/reports/2026-04-10-codex-recovery-runtime-slice-11.md | active | Codex implementation report for bounded mid-run recovery and persisted recovery notes |
| production/outbox/reports/2026-04-10-codex-mission-state-slice-12.md | active | Codex implementation report for the first mission-state layer in the planner |
| production/outbox/reports/2026-04-14-codex-mission-behavior-slice-13.md | active | Codex implementation report for mission focus and ambiguity-aware continuation behavior |
| production/outbox/reports/2026-04-19-codex-active-mission-continue-slice-14.md | active | Codex implementation report for active mission persistence and the first explicit safe continue action |
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
| RUNTIME-001 | Jarvis now has sessions, tasks, executions, a direct `/jarvis` surface, session-aware planning, provider readiness, first-pass fallback, bounded recovery, mission state, an active mission contract, and one explicit continue action, but it still lacks token-aware policy, richer memory, and true autonomous continuation | Open | architect |
| TEST-001 | Clean drop-in repo passes init/health-check/build, but live browser verification still needs a normal machine because the sandbox blocks port binding | Open | architect/frontend |

## Next Session Recommended AI
**Codex** — validate the active-mission flow locally and then build token/budget-aware provider policy on top of it

---
<!-- Template for future session updates: -->
<!--
## 2026-04-05 Session — [AI used] — [Room]
### What changed
- bullet points
### Resume point
exact instruction
-->
