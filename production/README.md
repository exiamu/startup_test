# Production Source Of Truth

This directory holds the project-specific source material for building the Jarvis system itself in this repository.

The repo is intentionally split into three layers:
- `/.nexus` — the portable protocol artifact that should be safe to copy into another repo
- `/jarvis-ui` — the reusable companion interface that operates against `.nexus`
- `/production` — the Jarvis system's own plans, architecture truth, immutable origin material, and repo-specific policy docs

## Why This Exists

Without this boundary, the portable `.nexus` install would accidentally ship this repository's own:
- founding prompt
- Jarvis product vision
- Jarvis architecture decisions
- implementation plans
- build/release policy

That would make copied installs carry the wrong truth into unrelated projects.

## What Lives Here

### `vault/`
Authoritative project truth for building the Jarvis system in this repository.

Current files:
- `vault/FOUNDING_PROMPT.md` — immutable original Jarvis founding prompt
- `vault/VISION.md` — Jarvis product vision
- `vault/CONSTRAINTS.md` — Jarvis system constraints
- `vault/ARCHITECTURE.md` — Jarvis system architecture truth
- `vault/DECISIONS.md` — Jarvis system ADR history

### `plans/`
Execution and planning docs for building the Jarvis system.

Current files:
- `plans/implementation_plan.md` — current execution roadmap and active build sequence
- `plans/master_plan.md` — historical early companion-app plan; keep for lineage, not as the active roadmap
- `plans/next_master_plan.md` — historical bridge plan from startup tooling into `/command`; keep for lineage, not as the active roadmap

### `outbox/`
Repo-specific prompts and handoff artifacts for building the Jarvis system itself.

Current files:
- `outbox/prompts/` — historical prompts and handoff artifacts for earlier Jarvis-building sessions in this repository
- `outbox/reports/` — historical reports produced during earlier Jarvis-building reviews

### `policies/`
Repository-local operating policies.

Current files:
- `policies/BUILD_AND_RELEASE.md` — build and release expectations for this repository

## Portable Boundary Rules

If a document describes the Jarvis system itself, it belongs in `production/`.

If a document is meant to travel with a fresh `.nexus` install for another project, it belongs in `.nexus`.

If a prompt/report/spec is about building Jarvis in this repository rather than operating inside an adopting project, it belongs in `production/outbox/`.

If a document describes reusable UI/application behavior that should survive extraction into another repo, it belongs with `jarvis-ui` code or its internal modules.

## Current Working Agreement

- `.nexus/vault/*` is now generic again and should be treated as onboarding-era templates for adopting projects
- `production/vault/*` is the active truth for building Jarvis in this repository
- session handoffs and room contexts may reference `production/` when the task is about evolving the Jarvis system itself
- onboarding and discovery flows must continue to keep copied `.nexus` installs generic until a human approves project-specific writes

## Resume Shortcut

If you are continuing work on the Jarvis system itself, read these first:
1. `production/README.md`
2. `.nexus/HANDOFF.md`
3. `.nexus/NEXUS.md`
4. `production/STATUS.md`
5. `production/plans/implementation_plan.md`
6. `production/vault/ARCHITECTURE.md`

## Canonical Docs

These are the active source-of-truth documents for this repo right now:
- `production/STATUS.md`
- `production/plans/implementation_plan.md`
- `production/vault/FOUNDING_PROMPT.md`
- `production/vault/VISION.md`
- `production/vault/CONSTRAINTS.md`
- `production/vault/ARCHITECTURE.md`
- `.nexus/HANDOFF.md`
- `.nexus/contracts/ROOM_AI_CONTRACT.md`

These are still worth keeping, but should be read as historical context rather than active direction:
- `production/plans/master_plan.md`
- `production/plans/next_master_plan.md`
- `production/outbox/prompts/*`
- `production/outbox/reports/*`
