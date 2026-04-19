# Current Status

## Boundary
- `production/` is now the source of truth for building the Jarvis system in this repository
- `.nexus/` is back to being a portable install artifact with generic vault templates
- `.nexus/outbox/` is reserved for adopting-project runtime artifacts, while repository-specific Jarvis-build prompts now live in `production/outbox/`
- `jarvis-ui/` remains the reusable control surface over `.nexus`
- `README.md` now acts as the root entry document for the whole system and points people to the correct deeper docs

## Working State
- startup flow works
- portable launcher now exists at `bash .nexus/scripts/start-jarvis.sh`
- launcher now supports automatic dependency install when `jarvis-ui/node_modules` is missing
- `/` is the Jarvis activation screen
- `Start -> New / Existing` works
- `/command` now exists as the first real Jarvis operating surface
- `/command` now classifies user requests into intent and recommends room + AI + explicit routing reason
- `/command` now assembles deterministic proposal-first launch packages for Claude, Codex, and Gemini
- `/command` launch packages now pull room identity, room context, and repo-local production truth for stronger handoffs
- `/command` now persists a command session in `.nexus/sessions/` and can restore that session from `sessionId`
- `/queue` now exposes recent Jarvis sessions and recent executions as a lightweight runtime operations view
- `/jarvis` now exists as the first direct commander-facing Jarvis surface over the same runtime/session plumbing
- task records now persist in `.nexus/tasks/` so Jarvis work has a durable unit beyond chat turns and execution files
- command planning now reads active session/task state so Jarvis can respond with mission continuity instead of only the latest prompt
- provider readiness is now visible in `/jarvis` and `/command`, and dead execution paths are gated before launch
- Jarvis can now fall back to the next ready provider when the primary AI is unavailable
- Jarvis now performs bounded mid-run recovery by retrying once and switching providers when a launched run fails
- Jarvis planning now carries a mission state (`idle`, `advancing`, `recovery`, `blocked`) and a mission directive instead of treating every turn as a clean slate
- Jarvis now carries mission focus and ambiguity signals, so continuation requests can keep the current mission moving instead of always re-routing from zero
- active mission state now persists in `.nexus/mission/active.json` as a repo-local contract over the current session, task focus, execution status, and continue eligibility
- `/jarvis`, `/command`, and `/queue` now surface the active mission instead of forcing the operator to infer state from raw session history
- Jarvis now exposes an explicit `Continue mission` action when exactly one active task is in flight and continuation is safe
- onboarding and brownfield startup now hand off into `/command` instead of stopping at isolated analysis screens
- startup now exposes `Command` as a first-class path alongside `New` and `Existing`
- all room `CONTEXT.md` files now carry repo-aligned state instead of mixed init-era placeholders
- `/command/validation` now exists as an executable matrix view over routing behavior
- the start screen now exposes local startup status and the recommended boot command
- startup status now distinguishes `needs init`, `needs dependencies`, and `ready`
- copied installs now reset project identity, `HANDOFF.md`, and room `CONTEXT.md` files on first init
- blank-project onboarding exists and is now more adaptive
- onboarding now exposes Jarvis beliefs, unknowns, blocking decisions, live tradeoffs, and a proposed first execution slice
- existing-project startup now performs a deeper read-only learning pass
- brownfield startup now interprets architecture, flags risk, and recommends next room/AI moves plus draft room context packs
- onboarding and brownfield outputs are still proposal-oriented, not automatic writes
- a dedicated next master plan now exists for moving Jarvis into a real operating loop
- expanded `/command` validation matrix to 20 cases, including messy/complex multi-tasking and cross-cutting concerns
- improved `engine.ts` heuristics to handle multi-room tasks, marketing/strategy context, and data-specific keywords
- generalized brownfield discovery to detect polyglot runtimes, framework diversity, and sub-application boundaries

## Reality Check
- the system is now partway into runtime territory: `/command` can plan, execute, and persist a lightweight session, but it is not yet a full Jarvis-style operator
- `jarvis-ui` can now recommend a room, invoke a provider, persist execution state, and retain lightweight session history
- `jarvis-ui` now also has a direct `/jarvis` conversational surface, but it still routes through the same planning engine rather than a richer autonomous operator loop
- the runtime now has the beginnings of a true work backbone: sessions, tasks, and executions are linked, but Jarvis still does not reason over that graph autonomously
- the planning layer is now session-aware, but it still only uses lightweight continuity signals rather than performing deeper autonomous task management
- the runtime now knows whether providers are runnable and can switch before launch or once after a failed run, but it still lacks policy-rich recovery and autonomous continuation
- the runtime now has an active mission contract and one safe continuation action, but it still does not yet advance work autonomously on its own policy loop
- the planner now reacts better to active missions, but the operator still has to explicitly trigger continuation rather than letting Jarvis decide and run the next move itself
- there is still no token-budget awareness, autonomous rerouting/result-ingestion loop, or true mission manager
- direct conversation with Jarvis still routes through `/command` planning rather than a richer always-on commander runtime with memory and authority
- startup `New` and `Existing` paths are useful for first-fit project alignment, but they are only part of the system; Jarvis still needs a default day-to-day command and execution mode to feel like one working assistant
- the current repo is therefore strongest on protocol scaffolding, startup alignment, and early execution/session plumbing, and weakest on active orchestration

## Verified
- `.nexus/scripts/health-check.sh` passes
- `.nexus/scripts/init.sh` now re-aligns project identity even when copied from a previously configured repo
- throwaway portable repo test passed through copy + init + health-check + build; live dev-server bind could not be fully verified in sandbox because port 3000 is blocked here
- throwaway missing-dependency repo test now fails cleanly in skip mode with the expected guided install message
- brownfield recommendation heuristics were validated against real repo shapes (`work_folder` and `budgetting`) and refined to produce stronger room-context packs
- `jarvis-ui` typecheck and production build pass after `/command` and heuristic improvements
- a formal `/command` validation matrix now exists at `production/plans/command_validation_matrix.md` with 20 documented cases
- the executable `/command` validation pass is current on the baseline + expanded prompt set: 20/20 documented cases are now handled by improved heuristics
- a deep-dive Gemini system-engineer/debug prompt now exists at `production/outbox/prompts/2026-04-07-gemini-system-engineer-debug-deep-dive.md`
- the previous Turbopack filesystem tracing warning is no longer reproducing after the path-scoping fix and follow-up cleanup
- brownfield discovery now correctly identifies mixed-stack and sub-application boundaries without hardcoded project hints
- Day 1 maintenance fixes are complete: repo-specific `walkers_beast_app` heuristics were removed, `npm run lint` now exits 0, runtime directories are gitignored, and `.nexus/scripts/init.sh` now uses cross-platform in-place `sed`
- Gemini review and refinements were appended to `production/plans/runtime_build_plan.md`, including the recommendation to use an async execution model for provider runs
- runtime slice 01 is complete: `.nexus/providers.json`, provider adapter scripts, and the UI provider reader/types now exist and verify against the missing-credential contract
- runtime slice 02 is complete: execution types, Nexus writer utilities, async execute POST route, and execution-status polling route now exist and build cleanly
- runtime slice 03 is complete: `/command` now executes against the async backend, polls execution status, and bootstrap/health-check cover the runtime layer
- drop-in empty-project test passed through copy + init + health-check + build in a clean repo; live `/command` verification is blocked here only by sandbox port binding
- runtime slice 04 is complete: `/command` now persists lightweight session history, restores by `sessionId`, and links executions back to session turns
- runtime slice 05 is complete: `/queue` now shows recent sessions and executions so runtime state is visible without raw file browsing
- runtime slice 06 is complete: `/jarvis` now provides a direct conversation-style entrypoint for the commander on top of the existing session/runtime layer
- runtime slice 07 is complete: task records now persist in `.nexus/tasks/` and connect session turns to execution work
- runtime slice 08 is complete: Jarvis planning now reads session/task/execution continuity and surfaces it in `/jarvis` and `/command`
- runtime slice 09 is complete: provider readiness is now checked and surfaced before execution in `/jarvis` and `/command`
- runtime slice 10 is complete: provider fallback now switches execution to the next ready AI when the primary choice is unavailable
- runtime slice 11 is complete: execution records now persist retry/fallback recovery notes and Jarvis performs one bounded retry/switch loop after a provider fails mid-run
- runtime slice 12 is complete: the planner now derives a mission state and directive from sessions, tasks, executions, and recovery notes
- runtime slice 13 is complete: generic continuation requests now preserve mission focus or force priority clarification when multiple active tasks exist
- runtime slice 14 is complete: active mission state now persists to `.nexus/mission/active.json`, `/jarvis` and `/command` can issue a safe `Continue mission` action, and `/queue` surfaces the live mission contract

## Known Follow-Up
- automatic install path itself is implemented, but full online registry success cannot be verified in this sandbox
- live `next dev` startup on `localhost:3000` is still only partially verified here because the sandbox blocks port binding
- onboarding heuristics need more testing against messy real prompts
- brownfield learning heuristics still need testing against broader repo shapes beyond the first validated examples
- room context selection is still shallow and should grow more precise as more rooms become active
- write/approval flows remain intentionally absent to maintain proposal-first behavior
- provider execution now exists end-to-end through `/command`, and session history now persists in `.nexus/sessions/`, but both still need a real local-machine browser test outside this sandbox
- token-usage awareness still does not exist
- Jarvis can now continue one safe mission through an explicit action, but it still cannot autonomously decide and execute broader follow-up work without a human trigger
- a first direct Jarvis chat surface now exists at `/jarvis`, but it is still an early layer over the planning engine rather than a fuller autonomous commander runtime
- Jarvis still does not synthesize multi-step plans into an active task graph it can continue on its own; the new task ledger is only the first backbone for that
- Jarvis now sees continuity, but it still does not choose and continue a multi-step mission flow on its own
- Jarvis now switches when the primary provider is unavailable and can recover once after a failed run, but it still does not manage broader mission-level retry/re-routing policy
- Jarvis now names the mission state clearly, but it still needs stronger rules for when to continue automatically versus when to stop and ask the commander
- Jarvis now knows when to keep focus, surface the active mission, and offer a continue action, but it still does not auto-run the next obvious move without commander approval
- init.sh and health-check.sh now bootstrap and validate the runtime directories and provider-script contract
- the next unknown is what breaks, if anything, during a real drop-in empty-project test
- the next unknown is now narrower: whether a normal local machine exposes any live UI/runtime bugs once `/command` is exercised through the browser

## Next Recommended Work
1. Run one fresh local-machine test of the new active-mission and `Continue mission` flow through `/jarvis`, `/command`, and `/queue`
2. Add token/budget awareness so Jarvis can choose providers for availability, task fit, and spend limits
3. Deepen `/jarvis` from explicit continue actions into a policy-driven mission manager that can decide when to proceed, retry, switch providers, or stop for approval
4. Ingest execution outputs back into mission state so Jarvis can reason over results instead of only statuses
5. Expand runtime visibility from lightweight inspection into a fuller operations surface once the mission-manager layer starts making real decisions
