# Jarvis + NEXUS

Jarvis + NEXUS is a portable AI operating layer plus companion UI for running multi-AI project workflows in a local repository.

The system is designed to:
- preserve project context across sessions
- route work across Claude, Codex, and Gemini using room-based boundaries
- support blank-project onboarding and existing-project learning
- keep project truth in the filesystem instead of hidden app state
- remain portable enough to drop into another repo and start working

## Current Reality

Today the system is strongest as:
- a portable `.nexus` protocol layer
- a local `jarvis-ui` control surface
- a recommendation engine for room routing and launch-package assembly

It is not yet a full Jarvis runtime.

What is still missing before it behaves like a true Jarvis-style operator:
- provider fallback and token-budget-aware switching
- persistent session memory and a first-class always-available "talk to Jarvis" mode
- deeper runtime visibility and inspection beyond the current minimal execution surface
- broader real-world validation in normal local-machine environments

## Repository Layout

This repository is intentionally split into three layers:

- `.nexus/`
  Portable protocol artifact. This is the installable AI operations layer that should be safe to copy into another project.
- `jarvis-ui/`
  Reusable local control surface that reads from `.nexus` and gives the system a Jarvis-style entrypoint at localhost.
- `production/`
  Repository-specific source of truth for building the Jarvis system itself. This does **not** travel with portable installs.

## What Travels To Another Repo

Copy only:

- `.nexus/`
- `jarvis-ui/`

Do not copy:

- `production/`

`production/` contains the plans, ADRs, architecture truth, and immutable origin documents for building this system in this repository. Those are not supposed to become another project's truth by accident.

## Core Idea

`.nexus` is the durable protocol layer.

`jarvis-ui` is the local command surface.

When Jarvis is dropped into a target repo:
- `.nexus` becomes that repo's AI operating layer
- `jarvis-ui` points at the local `.nexus`
- `http://localhost:3000` becomes the local place where the commander starts the project flow

Jarvis now has three practical entry styles:
- `Command` for day-to-day work, next-step requests, bugs, implementation tasks, documentation asks, and routing into Claude/Codex/Gemini
- `New` for blank-project first-contact onboarding from a rough idea
- `Existing` for brownfield learning before action

These are not equal in product importance:
- `Command` is the long-term default working surface
- `New` and `Existing` are startup alignment flows that help Jarvis fit itself into the project

## Portable Startup

## Clone And Start

If you are pulling this from GitHub into an empty or existing project folder, clone the repo contents first:

```bash
git clone git@github.com:exiamu/startup_test.git .
```

Then start Jarvis from the project root:

```bash
bash .nexus/scripts/init.sh
bash .nexus/scripts/start-jarvis.sh
```

If SSH is not configured on your machine, use HTTPS instead:

```bash
git clone https://github.com/exiamu/startup_test.git .
```

## Portable Startup

From the target project root:

```bash
bash .nexus/scripts/start-jarvis.sh
```

The launcher will:
- verify `.nexus` and `jarvis-ui` exist
- verify `node` and `npm` are available
- create `jarvis-ui/.env.local` when needed
- align copied project identity with the current folder
- reset stale copied `HANDOFF.md` and room `CONTEXT.md` files on first init
- attempt dependency install when `jarvis-ui/node_modules` is missing
- run health-check
- start Jarvis locally on port `3000` by default

If you want manual dependency control:

```bash
JARVIS_INSTALL_MODE=skip bash .nexus/scripts/start-jarvis.sh
```

## First-Run Behavior

After startup:
1. open `http://localhost:3000`
2. review the startup status block
3. press `Start`
4. choose `Command`, `New`, or `Existing`

### `Command`
Use this when you already have a task, bug, question, review request, or "what should happen next" ask.

Jarvis should:
- classify the request into intent
- recommend the right room and default AI
- explain why it is routing that way
- assemble proposal-first launch packages for Claude, Codex, and Gemini
- preserve explicit multi-model behavior instead of hiding it

### `New`
Use this when the repo is blank or near-blank.

Jarvis should:
- accept a messy idea dump
- ask adaptive clarification questions
- produce draft vision, constraints, architecture, and scope
- keep outputs proposal-oriented until approval

### `Existing`
Use this when the repo already has code or structure.

Jarvis should:
- inspect the repo first
- infer stack, tooling, project areas, and likely architecture
- produce a read-only learning pass
- keep outputs proposal-oriented until approval

## Current Status

Right now:
- startup flow works
- the activation screen works
- `/command` exists as the first real operating surface
- `/command` can recommend room + AI + why, assemble launch packages, and trigger async provider execution
- blank-project onboarding exists and is adaptive
- existing-project startup performs a deeper learning pass than a top-level scan
- portable copied installs now re-align identity and reset stale copied session state
- execution records and runtime output can persist under `.nexus/execution/`
- launcher dependency handling is improved, but full online install behavior still needs normal-environment testing
- the active next phase is turning Jarvis from recommendation-only routing into an execution-capable multi-AI runtime

## Documentation Map

Start here depending on what you need:

- [production/README.md](/home/exiamu/ai/projects/startup_test/production/README.md)
  Canonical documentation map for building Jarvis in this repository
- [production/STATUS.md](/home/exiamu/ai/projects/startup_test/production/STATUS.md)
  Current working state, reality check, verification status, and active next work
- [production/plans/portable_boot_flow.md](/home/exiamu/ai/projects/startup_test/production/plans/portable_boot_flow.md)
  Portable local startup contract
- [production/plans/implementation_plan.md](/home/exiamu/ai/projects/startup_test/production/plans/implementation_plan.md)
  Main execution roadmap and current build sequence
- [production/vault/ARCHITECTURE.md](/home/exiamu/ai/projects/startup_test/production/vault/ARCHITECTURE.md)
  Current architecture truth, including the missing Jarvis runtime layer
- [production/plans/command_validation_matrix.md](/home/exiamu/ai/projects/startup_test/production/plans/command_validation_matrix.md)
  Baseline routing and launch-package validation target for `/command`
- [.nexus/HANDOFF.md](/home/exiamu/ai/projects/startup_test/.nexus/HANDOFF.md)
  Current session resume point
- [.nexus/NEXUS.md](/home/exiamu/ai/projects/startup_test/.nexus/NEXUS.md)
  Session start loader for the protocol

Historical but still useful:
- `production/plans/master_plan.md`
- `production/plans/next_master_plan.md`
- `production/outbox/prompts/*`
- `production/outbox/reports/*`

## Current Limits

- live local dev-server boot cannot be fully proven in this sandbox because port binding is blocked here
- automatic dependency install is implemented, but full package-registry success still needs testing in a normal machine environment
- onboarding heuristics still need more real-world testing
- brownfield learning still needs more validation against mature repos
- `/command` baseline validation is green, but routing and launch package quality still need broader validation against messy prompts and repo shapes
- the earlier Turbopack tracing warning is not currently reproducing, but the local-first filesystem approach still needs broader environment validation
- provider execution exists, but fallback policy, token-awareness, and richer runtime control are not built yet
- live browser-driven runtime testing still needs to happen on a normal machine because this sandbox blocks port binding

## Working Principle

Stay aligned with the original goal:
- keep `.nexus` portable
- keep `jarvis-ui` subordinate to filesystem truth
- keep onboarding and brownfield learning additive and draft-first
- do not let repo-specific Jarvis-building truth leak back into the portable install
