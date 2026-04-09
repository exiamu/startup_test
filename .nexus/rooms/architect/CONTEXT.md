# architect Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-09 by Codex -->

## Current State
Phase: Runtime Build — 7-Day Execution Plan Active
Last Action: Completed Gemini architect review and refinement of `production/plans/runtime_build_plan.md`. Added Async Execution Model, Token Safety Limits, and Day 1 Pre-Build Audit.
Next Action: Execute Day 1: Gemini Pre-Build Utility & Pattern Audit, then Codex maintenance fixes and `.gitignore` setup.

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| .nexus/contracts/ROOM_AI_CONTRACT.md | canonical room and AI ownership | 2026-04-07 |
| .nexus/NEXUS.md | master context loader and quick routing | 2026-04-07 |
| production/README.md | repo-local boundary between portable install and Jarvis product truth | 2026-04-07 |
| README.md | root overview and usage guide for the full system | 2026-04-07 |
| production/vault/FOUNDING_PROMPT.md | immutable origin for the Jarvis system itself | 2026-04-07 |
| production/vault/DECISIONS.md | Jarvis system ADR history for this repository | 2026-04-07 |
| production/vault/VISION.md | current Jarvis system vision draft | 2026-04-07 |
| production/vault/CONSTRAINTS.md | current Jarvis system hard constraints draft | 2026-04-07 |
| production/vault/ARCHITECTURE.md | current Jarvis system architecture draft | 2026-04-07 |
| production/plans/implementation_plan.md | execution roadmap for `.nexus` and `jarvis-ui` | 2026-04-07 |
| production/plans/next_master_plan.md | historical bridge plan from startup into `/command`; keep for lineage only | 2026-04-09 |
| production/plans/portable_boot_flow.md | documented portable local startup contract | 2026-04-07 |
| production/policies/BUILD_AND_RELEASE.md | build/release policy for the Jarvis system repo | 2026-04-07 |
| production/outbox/prompts/2026-04-07-codex-next-master-plan.md | historical prompt artifact from an earlier operating-loop phase | 2026-04-09 |
| .nexus/scripts/init.sh | project bootstrap and identity setup | 2026-04-07 |
| .nexus/scripts/start-jarvis.sh | one-command local Jarvis launcher for copied installs | 2026-04-07 |
| .nexus/scripts/health-check.sh | readiness and contract validation | 2026-04-07 |
| jarvis-ui/src/modules/nexus-adapter/reader.ts | first read adapter implementation | 2026-04-07 |
| jarvis-ui/src/app/page.tsx | first command-center placeholder screen | 2026-04-07 |
| jarvis-ui/src/app/overview/page.tsx | first overview screen | 2026-04-07 |
| jarvis-ui/src/app/rooms/page.tsx | rooms grid from `.nexus` state | 2026-04-07 |
| jarvis-ui/src/app/rooms/[room]/page.tsx | room detail file inspection | 2026-04-07 |
| jarvis-ui/src/app/vault/page.tsx | vault overview from `.nexus` state | 2026-04-07 |
| jarvis-ui/src/app/queue/page.tsx | inbox/outbox summary from `.nexus` state | 2026-04-07 |
| jarvis-ui/src/app/artifacts/[...path]/page.tsx | filesystem artifact browsing | 2026-04-07 |
| .nexus/workflows/blank-project-onboarding.md | first-contact onboarding behavior | 2026-04-07 |
| jarvis-ui/src/app/onboarding/page.tsx | first-contact onboarding route | 2026-04-07 |
| jarvis-ui/src/modules/onboarding/engine.ts | adaptive first-contact analysis engine with contradictions/gaps/proposal drafts | 2026-04-07 |
| jarvis-ui/src/app/onboarding/onboarding-client.tsx | first-contact UI with live Jarvis belief/tradeoff model | 2026-04-07 |
| jarvis-ui/src/app/start/start-experience.tsx | commander activation flow | 2026-04-07 |
| jarvis-ui/src/modules/startup/status.ts | startup readiness model for local Jarvis boot flow | 2026-04-07 |
| jarvis-ui/src/modules/project-discovery/reader.ts | deeper read-only existing-project learning pass | 2026-04-07 |
| jarvis-ui/src/app/start/existing/page.tsx | brownfield startup report with next room/AI/context-pack proposals | 2026-04-07 |
| jarvis-ui/src/modules/command/engine.ts | shared planner for intent classification, routing, and launch packages | 2026-04-07 |
| jarvis-ui/src/modules/command/validation.ts | executable validation matrix for command routing | 2026-04-08 |
| jarvis-ui/src/app/api/command/plan/route.ts | server command-planning endpoint | 2026-04-07 |
| jarvis-ui/src/app/command/command-client.tsx | real `/command` operating surface | 2026-04-07 |
| jarvis-ui/src/app/api/command/validate/route.ts | validation endpoint for the command matrix | 2026-04-08 |
| jarvis-ui/src/app/command/validation/page.tsx | command validation UI surface | 2026-04-08 |
| production/plans/command_validation_matrix.md | expected behavior matrix for `/command` validation | 2026-04-07 |
| production/STATUS.md | current state, reality check, and active next work | 2026-04-09 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| ADR-002 | Preserve founding prompt as immutable reference and add canonical room/AI contract | 2026-04-07 | Yes |

## Known Issues / Blockers
- `production/vault/VISION.md`, `production/vault/CONSTRAINTS.md`, and `production/vault/ARCHITECTURE.md` now hold the Jarvis system truth for this repository, while `.nexus/vault/*` has been reset to generic install templates
- `production/vault/DECISIONS.md` now holds the Jarvis system ADR history for this repository, while `.nexus/vault/DECISIONS.md` is back to an empty portable template
- portable startup now has a documented launcher path and UI readiness card, and first init now resets copied HANDOFF/CONTEXT state for the adopting project
- portable startup now distinguishes init/dependency/readiness states and can attempt automatic dependency install when `node_modules` is missing
- onboarding is now adaptive and more explicitly “Jarvis-like,” exposing what it believes, what it does not know, what decisions block progress, and what first slice it wants to execute, but it still needs runtime iteration against real messy commander prompts
- existing-project startup now reads manifests and project areas, interprets likely architecture, flags risk, and recommends next room/AI/context-pack proposals, but the heuristics still need validation against more mature repo shapes
- validation against `work_folder` and `budgetting` improved the brownfield path substantially; context packs now prioritize meaningful source/runtime areas instead of noisy support folders
- the first `/command` operating loop is now implemented and the baseline executable matrix is green; the next step is broader validation against messier prompts and repo shapes
- `frontend`, `backend`, `qa`, and `writer` room contexts now reflect actual working state, which improves command-package usefulness outside the architect lane
- Jarvis-build prompts now live in `production/outbox/` instead of `.nexus/outbox/`; `.nexus/outbox/` is reserved for adopting-project runtime artifacts
- Gemini's tracing fix now verifies in a real build; Codex cleaned up the workaround and the warning is not currently reproducing
- `/command` packages now have stronger structural boundaries through tagged sections, which should make Claude/Gemini/Codex handoffs easier to parse
- Full localhost boot and online install success cannot be proven end-to-end here because the sandbox blocks port binding and external registry access
- the active architectural gap is no longer startup alignment; it is the missing runtime layer that can actually invoke Claude, Codex, and Gemini and persist execution state
- some discovery notes and historical prompt artifacts remain valuable for lineage, but `production/STATUS.md`, `production/plans/implementation_plan.md`, and `production/vault/ARCHITECTURE.md` now override them when guidance conflicts

## What NOT To Touch (Owned By Other Rooms)
- See .nexus/ROUTING.md for room boundaries
