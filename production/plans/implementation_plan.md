# NEXUS + Jarvis UI Implementation Plan

## Purpose
This document is the execution plan for turning the current `.nexus` scaffold into a portable, production-worthy system and building `jarvis-ui` as the primary control surface for it.

Reference anchors for this roadmap:
- Immutable founding prompt: `production/vault/FOUNDING_PROMPT.md`
- Canonical room and AI routing: `.nexus/contracts/ROOM_AI_CONTRACT.md`
- Build and release policy: `production/policies/BUILD_AND_RELEASE.md`

The target outcome is:
- `.nexus` can be dropped into a brand new project and guided to first-use cleanly
- `.nexus` can be added to an existing project and adapt to that project safely
- `jarvis-ui` can operate as a mission-control layer over `.nexus` without becoming a second source of truth
- the overall system feels like one coherent Jarvis-style assistant, not a pile of prompt files
- Jarvis can directly invoke and coordinate Claude, Codex, and Gemini through configurable local commands instead of stopping at recommendation-only routing

---

## Product Goal
Build a filesystem-native AI operating layer plus companion UI that can:
- understand the current project state
- route work to the right room, tool, and workflow
- execute that work through the available AI provider, not just suggest it
- preserve context across sessions
- manage handoffs, approvals, and decisions
- switch providers when token limits, failures, or task fit require it
- support direct “talk to Jarvis” command-and-response usage outside startup-only flows
- work in greenfield and brownfield projects
- stay strict about safety, scope, and auditability

---

## Non-Negotiable Principles
1. `.nexus` is the source of truth. `jarvis-ui` reads and writes through a controlled adapter only.
2. Portability beats cleverness. A copied `.nexus` folder must work with minimal setup in another repo.
3. One contract per behavior. Routing, room ownership, file conventions, and safety rules cannot live in conflicting forms.
4. Setup must be verifiable. A fresh install should either pass validation cleanly or fail with actionable errors.
5. Human-gated changes stay human-gated. Vault decisions, approvals, and scope changes must remain explicit.
6. Existing-project onboarding must be additive, not destructive. NEXUS should discover and adapt before it writes.
7. The UI must feel intentional and premium, but never hide the underlying filesystem model.

---

## Current State Summary
The project now has a hardened portable `.nexus`, adaptive onboarding, deeper brownfield learning, and a first real `/command` operating loop.

Main gaps:
- the current system is still recommendation-first; it does not yet execute work through Claude, Codex, or Gemini
- there is no provider adapter layer, runtime state machine, execution log, or fallback policy
- `/command` now passes the baseline validation matrix, but routing and launch packaging still need validation against a broader prompt and repo matrix
- room-aware context selection for launch packages is still first-pass and should grow more precise
- write/approval flows remain intentionally absent
- local-first filesystem access remains a deployment constraint even though the earlier Turbopack tracing warning is no longer reproducing

This means the correct next move is not more startup-path polish by itself. The right move is to turn the routing shell into a working Jarvis runtime: direct commander interaction, provider execution, fallback behavior, and persistent execution state. Startup alignment, package quality, and write approval still matter, but they now sit underneath the more urgent “make Jarvis actually operate” requirement.

---

## Delivery Strategy
Work in five tracks, in order of dependency:

1. Protocol Hardening
Stabilize `.nexus` so it is a trustworthy portable system.

2. Project Onboarding
Make NEXUS capable of entering a new or existing repo and establishing clean project identity and context.

3. Jarvis UI Foundation
Build the app shell and filesystem adapter against the hardened protocol.

4. Jarvis Runtime
Build the direct Jarvis command surface, provider adapters, execution loop, and AI fallback behavior.

5. Jarvis Workflows
Add writing flows, approvals, launch packages, and active session support around the live runtime.

Do not treat startup UX or routing heuristics as sufficient product completion before Track 4 exists.

---

## Phase 1: Harden `.nexus` Core
Goal: make the filesystem protocol internally consistent and safe to reuse.

### Work Items
- Define a single canonical routing contract.
- Align `NEXUS.md`, `ROUTING.md`, room prompts, room identity files, and agent files to that contract.
- Decide which responsibilities belong to room prompts vs. agent definitions vs. workflows.
- Update `init.sh` to fully initialize project identity, not just partial placeholders.
- Update `health-check.sh` to fail on unresolved critical placeholders and contract mismatches.
- Decide which files are allowed to remain template-grade after init and mark them explicitly.
- Fix script execute-bit expectations and portability assumptions.
- Remove or quarantine Windows `Zone.Identifier` artifacts from distributable content.
- Define versioning for `.nexus` itself.

### Acceptance Criteria
- A fresh `.nexus` copy can be initialized without manual guesswork.
- `health-check.sh` fails when critical identity or vault setup is incomplete.
- room-to-AI mapping is identical everywhere.
- every script and workflow matches the documented behavior.
- no critical contradictions remain between core docs and enforcement code.

### Suggested Deliverables
- `.nexus/contracts/` or a clearly defined canonical contract section in existing files
- updated scripts
- updated room and agent definitions
- updated validation rules
- a NEXUS version field and changelog policy

---

## Phase 2: Build New-Project and Existing-Project Onboarding
Goal: make NEXUS usable both in empty repos and in mature codebases.

### Work Items
- Implement dedicated blank-project first-contact mode using `.nexus/workflows/blank-project-onboarding.md`
- Design onboarding modes:
  - `greenfield`: create identity, vision, constraints, initial room contexts
  - `brownfield`: inspect repo structure, infer stack, summarize architecture candidates, flag unknowns
- Expand `init.sh` into a real setup flow or create a new onboarding script with modes.
- Add project discovery rules:
  - detect stack
  - detect package manager / runtime
  - detect app folders and services
  - detect test frameworks
  - detect deployment footprint where possible
- Create a brownfield import summary output:
  - project identity draft
  - architecture draft
  - key files per room
  - unresolved decisions requiring human confirmation
  - recommended next room and AI actions
  - draft room context pack proposals
- Define safe write boundaries during onboarding.
- Ensure onboarding never overwrites real project files outside `.nexus`.

### Acceptance Criteria
- in a new repo, NEXUS can initialize a clean working baseline
- in a blank repo, Jarvis can conduct multi-round commander dialogue from a messy first prompt and convert it into structured drafts
- in an existing repo, NEXUS can generate a usable first-pass context pack
- onboarding outputs are reviewable before being locked into vault files
- setup is additive and reversible

### Suggested Deliverables
- onboarding script or script suite
- project discovery checklist
- import report template
- first-session architect workflow for brownfield adoption

---

## Phase 3: Lock the Filesystem Contract for UI Consumption
Goal: make `.nexus` stable enough that `jarvis-ui` can trust it.

### Work Items
- Define exact schemas for:
  - HANDOFF
  - room state
  - inbox items
  - outbox items
  - decisions / ADRs
  - approval states
- Decide whether markdown stays free-form, structured-by-convention, or partly frontmatter-backed.
- Standardize filenames and approval/archive semantics.
- Define append-only behavior for vault decisions precisely.
- Decide what the UI may edit directly and what must go through proposal flows.
- Add a compatibility strategy for future `.nexus` upgrades.

### Acceptance Criteria
- a parser can read all core files deterministically
- write rules are explicit enough for one adapter implementation
- approval and archive semantics are machine-readable
- old `.nexus` installations can be upgraded safely or flagged as incompatible

---

## Phase 4: Build `jarvis-ui` Foundation
Goal: create the companion app shell with read-only visibility into `.nexus`.

### Scope
- app scaffold
- `.env`-driven root path
- filesystem adapter read layer
- markdown rendering
- overview screens
- room screens
- queue screens
- artifact browser
- SSE watcher for live refresh

### Work Items
- Create `jarvis-ui/` in this repo.
- Implement project discovery and path validation first.
- Build `NexusAdapter` read layer before UI pages.
- Create a clean visual language:
  - high-contrast mission control aesthetic
  - strong typography
  - restrained motion
  - mobile-safe layout
- Build these initial routes:
  - `/command`
  - `/overview`
  - `/rooms`
  - `/queue`
  - `/vault`
  - `/artifacts`
  - `/execution`
- Add robust empty states for half-configured projects.

### Acceptance Criteria
- UI boots against this repo’s `.nexus`
- UI can also point at another project’s `.nexus` via config
- all primary reads work without mutation
- the app remains useful even when the project is partially configured

---

## Phase 5: Build Safe Write Flows
Goal: allow controlled updates without breaking the filesystem contract.

### Scope
- room context editing
- inbox append / mark flows
- outbox generation
- approval / archive actions
- end-session handoff updates
- decision proposal append flow

### Work Items
- Build a single writer adapter with path guards and atomic writes.
- Add backups for editable context files.
- Add append-only enforcement for `vault/DECISIONS.md`.
- Add diff preview before handoff writes.
- Add filename collision handling.
- Add approval actions that rename or move files consistently.

### Acceptance Criteria
- no UI route writes directly to disk without adapter checks
- vault immutability is enforced in code, not by convention alone
- every write operation is reversible where appropriate
- audit trail remains clear in filesystem history

---

## Phase 6: Build Jarvis Runtime and Command Flow
Goal: make the UI behave like one working assistant while still using `.nexus` as the durable operating layer.

### Scope
- direct commander conversation surface
- natural-language command intake
- intent classification
- room / AI routing preview and execution
- launch package assembly
- provider adapters for Claude, Codex, and Gemini
- configurable bash/python launch commands per provider
- token / availability / fallback policy
- execution logging and state transitions
- active session tracking
- return-to-session workflow

### Work Items
- build a first-class `Jarvis` mode where the user can talk to the system directly without going through startup-only flows
- implement routing-table mirror from the canonical routing contract
- build an intent classifier with deterministic first-pass rules
- assemble launch packages from:
  - room prompt
  - room context
  - handoff
  - relevant vault sections
  - selected inbox/outbox context
- support model-specific launch formatting for Claude, Codex, and Gemini
- create provider adapters that can invoke available AIs through configurable shell commands
- persist provider configuration, task status, and execution history in `.nexus`
- define state transitions such as `planned`, `running`, `blocked`, `rerouted`, `completed`, and `failed`
- implement fallback rules when a provider is unavailable, out of budget, or a poor fit for the current task
- create session state store
- build end-session flow that writes handoff updates cleanly

### Current Progress
- first-pass `/command` route is implemented as the main operating surface
- deterministic intent classification now produces room + AI + explainable routing reasons
- deterministic proposal-first launch packages now exist for Claude, Codex, and Gemini
- launch packages now include room identity/context and repo-local production truth summaries
- onboarding and brownfield startup now continue into `/command`
- startup now exposes a direct `Command` path for day-to-day use instead of only startup mode selection
- `/command` validation expectations now live in `production/plans/command_validation_matrix.md`
- `/command/validation` now executes the baseline matrix and is currently green on the documented 10-case prompt set
- room-context selection is still shallow and should be improved before write flows are introduced
- provider execution is not implemented yet
- fallback switching is not implemented yet
- direct always-on Jarvis conversation mode is not implemented yet
- execution persistence and task lifecycle tracking are not implemented yet

### Acceptance Criteria
- user can talk to Jarvis directly from the main surface
- Jarvis can type a request, choose a room/AI, and either execute it or explain exactly why execution is blocked
- provider invocation is configurable through local commands rather than hardcoded to one environment
- launch package assembly is deterministic and traceable
- task execution state is persisted and reviewable in `.nexus`
- session closure updates project state without manual file editing
- fallback between providers is explicit, governed, and observable

---

## Phase 7: Upgrade Automation and Governance
Goal: make the system maintainable over time.

### Work Items
- fix GitHub workflows so enforcement matches policy
- upgrade secret scanning to base-aware or full-tree checks
- strengthen append-only decision enforcement
- improve docs/link validation
- define quarterly `.nexus` upgrade flow
- define migration path for older `.nexus` installs

### Acceptance Criteria
- workflows catch the classes of drift they claim to catch
- upgrades can be applied intentionally and safely
- operators can tell which NEXUS version a project is running

---

## Recommended Implementation Order
1. Canonical routing and room contract
2. `init.sh` and `health-check.sh` hardening
3. brownfield onboarding design
4. vault and handoff contract normalization
5. `jarvis-ui` filesystem adapter read layer
6. `jarvis-ui` read-only screens
7. writer adapter and approval flows
8. command center and launch flow
9. governance automation and upgrade tooling

This order keeps the UI from codifying unstable rules too early.

---

## Working Rules For Implementation
While building this system:
- every significant change to `.nexus` should update this plan or produce a derived milestone note
- no UI write feature should ship before the corresponding filesystem rule is explicit
- avoid building UI around ambiguous markdown structures
- prefer deterministic behavior over “smart” inference in v1
- when a contract decision is made, lock it in one place and reference it elsewhere
- at milestone boundaries, check progress against `production/vault/FOUNDING_PROMPT.md` and record any gap explicitly
- every runnable target should have an explicit build path, with CI artifacts when local builds are not enough

---

## Milestone Definitions

### Milestone A: Protocol Stable
Complete when `.nexus` can initialize, validate, and route consistently.

### Milestone B: Onboarding Stable
Complete when new and existing projects can both adopt `.nexus` safely.

### Milestone C: UI Read Layer Stable
Complete when `jarvis-ui` can render all core project state from `.nexus`.

### Milestone D: UI Write Layer Stable
Complete when approvals, handoffs, and context edits are safe and auditable.

### Milestone E: Jarvis Workflow Stable
Complete when the command center can route and package real work reliably.

---

## Immediate Next Sprint
This is the recommended next implementation sprint.

### Sprint Goal
Build the Jarvis runtime layer so the system can execute real work through Claude, Codex, and Gemini instead of only generating launch packages.

**Active execution plan:** `production/plans/runtime_build_plan.md`
**Status:** ACTIVE — Gemini review appended; maintenance fixes complete; next step is to reconcile the plan with Gemini's async-execution recommendation before implementing provider execution

### Sprint Tasks (7-day build)
1. Fix three maintenance issues (walkers_beast_app hardcode, broken lint, sed -i portability)
2. Build provider adapter scripts (.nexus/scripts/providers/) and providers.json config
3. Build nexus write adapter (jarvis-ui/src/modules/nexus-adapter/writer.ts)
4. Build execution API route and .nexus/execution/ state
5. Build commander session mode and Execute button in command-client.tsx

### Sprint Exit Criteria
- User can type a command in /command, click Execute, and a provider script runs
- Execution record persists in .nexus/execution/
- Session history persists in .nexus/sessions/
- npm run build passes clean
- bash .nexus/scripts/health-check.sh passes

### Historical Sprint (completed)
The previous sprint goal (protocol hardening, init.sh, health-check.sh, routing unification) is complete. Those tasks are no longer the priority.

---

## Risks
- If routing remains duplicated, the UI will encode the wrong behavior.
- If brownfield onboarding is weak, adoption into real projects will stall.
- If markdown contracts remain too loose, the UI adapter will become fragile.
- If the UI adds write capability too early, it will amplify protocol flaws.

---

## Definition of Success
Success is not just a working folder or a pretty UI.

Success is:
- a portable `.nexus` protocol that survives reuse
- a `jarvis-ui` app that makes the system feel unified and elegant
- a workflow that can drop into real projects and immediately improve execution quality

---

## Owner Note
Use this file as the implementation north star until the first stable release of both:
- `.nexus` portable protocol
- `jarvis-ui` companion app

When major decisions change the order or shape of the roadmap, update this file and record the reason in `production/vault/DECISIONS.md`.
