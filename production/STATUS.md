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
- the system currently behaves like a local planning and routing console, not a full Jarvis-style operator
- `jarvis-ui` can recommend a room, an AI, and a launch package, but it does not yet invoke Claude, Codex, or Gemini directly
- there is no provider runtime yet for bash/python-based AI launch commands, token-budget awareness, fallback switching, or result ingestion
- there is no persistent execution loop yet for `planned -> running -> blocked -> rerouted -> completed`
- direct conversation with Jarvis currently routes through `/command` classification rather than a true always-available commander session with memory and execution authority
- startup `New` and `Existing` paths are useful for first-fit project alignment, but they are only part of the system; Jarvis still needs a default day-to-day command and execution mode to feel like one working assistant
- the current repo is therefore strongest on protocol scaffolding, startup alignment, and prompt assembly, and weakest on active orchestration

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

## Known Follow-Up
- automatic install path itself is implemented, but full online registry success cannot be verified in this sandbox
- live `next dev` startup on `localhost:3000` is still only partially verified here because the sandbox blocks port binding
- onboarding heuristics need more testing against messy real prompts
- brownfield learning heuristics still need testing against broader repo shapes beyond the first validated examples
- room context selection is still shallow and should grow more precise as more rooms become active
- write/approval flows remain intentionally absent to maintain proposal-first behavior
- provider execution now exists end-to-end through `/command`, but it still needs a real drop-in empty-project test outside this working repo
- token-usage awareness and provider fallback policy do not exist yet
- Jarvis cannot yet continue work autonomously after choosing a room and AI
- direct always-on commander chat does not exist yet as a first-class runtime mode
- init.sh and health-check.sh now bootstrap and validate the runtime directories and provider-script contract
- the next unknown is what breaks, if anything, during a real drop-in empty-project test
- the next unknown is now narrower: whether a normal local machine exposes any live UI/runtime bugs once `/command` is exercised through the browser

## Next Recommended Work
1. Run one real manual local-machine test of `/command` execution outside the sandbox and capture any runtime failures
2. Fix whatever breaks in that live manual test before widening scope again
3. Implement session persistence and memory so history is not lost on refresh
4. Add minimal runtime-state visibility so execution records can be inspected without curl
5. Add provider fallback and token-usage policy once the single-provider runtime path is proven
