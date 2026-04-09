# Codex Next Session Prompt — Jarvis Operating Loop

Status: historical prompt artifact from 2026-04-07. Keep for lineage only; not the active next-session directive.

## Objective
Continue the NEXUS + Jarvis UI project by implementing the next real operating layer after startup, onboarding, and brownfield discovery.

The goal is to push Jarvis from:
- startup flow
- analysis surfaces
- proposal display

Into:
- a live command operator
- room/AI recommender
- launch package assembler
- more useful day-to-day helper for both large and small tasks

## Read First
Read only these first:
- `.nexus/HANDOFF.md`
- `.nexus/NEXUS.md`
- `.nexus/contracts/ROOM_AI_CONTRACT.md`
- `.nexus/workflows/blank-project-onboarding.md`
- `production/vault/FOUNDING_PROMPT.md`
- `production/plans/implementation_plan.md`
- `production/plans/next_master_plan.md`
- `production/STATUS.md`
- `.nexus/rooms/architect/CONTEXT.md`

## Current Truth
- portable startup flow works
- `.nexus` is portable again
- `jarvis-ui` boots locally and startup/new-existing flows work
- onboarding now exposes Jarvis beliefs, unknowns, blocking decisions, tradeoffs, and a proposed first execution slice
- brownfield startup now interprets architecture, flags risk, and recommends next room/AI moves plus room context packs
- outputs are still proposal-first; do not introduce write flows unless explicitly approved

## Primary Next Objective
Build the first real Jarvis operating loop.

Priority order:
1. create the first useful `/command` flow
2. let Jarvis intake a request and recommend room + AI + why
3. assemble the first deterministic launch packages for Claude, Codex, and Gemini
4. connect onboarding and brownfield outcomes into that next-step/launch system

## Required Direction
- keep `.nexus` generic and portable
- keep `jarvis-ui` subordinate to filesystem truth
- make Jarvis feel more alive and more useful, not just more verbose
- make the system useful for small tasks too, not only startup flows
- keep model usage explicit: Claude for strategy/architecture, Codex for implementation, Gemini for research/docs/long-context synthesis
- prefer deterministic routing/package assembly over vague “AI magic”

## Good Next Deliverables
- a real `/command` route or upgraded command intake surface
- an intent/routing layer that produces room + AI + reason
- first model-specific launch package assembly
- proposal-only next action cards that tell the commander exactly what Jarvis wants to do next

## Validation Standard
- run typecheck
- run build
- document the new layer in the right production docs and handoff files
- keep the next session resume point precise
