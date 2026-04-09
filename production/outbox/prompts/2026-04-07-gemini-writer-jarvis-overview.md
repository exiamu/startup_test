# Gemini Task: Jarvis Project Overview
Status: historical prompt artifact from 2026-04-07. Keep for lineage only; not the active next-session directive.
Date: 2026-04-07
Audience: project owner / commander
Room: writer
Status: DRAFT HANDOFF PROMPT

## Goal
Read the current project state and produce a concise, high-signal overview of where NEXUS + Jarvis UI currently stand, what has been built, what the current product direction is, and what the most important next steps are.

## Read These Files First
- `.nexus/NEXUS.md`
- `.nexus/HANDOFF.md`
- `production/vault/FOUNDING_PROMPT.md`
- `production/vault/VISION.md`
- `production/vault/CONSTRAINTS.md`
- `production/vault/ARCHITECTURE.md`
- `.nexus/contracts/ROOM_AI_CONTRACT.md`
- `production/plans/implementation_plan.md`
- `production/policies/BUILD_AND_RELEASE.md`
- `.nexus/workflows/blank-project-onboarding.md`

## Also Inspect These Implementation Areas
- `jarvis-ui/src/app/`
- `jarvis-ui/src/modules/nexus-adapter/`
- `jarvis-ui/src/modules/onboarding/`
- `jarvis-ui/src/modules/project-discovery/`

## What To Produce
Write a structured overview that answers:
1. What the system is trying to become
2. What has already been built in `.nexus`
3. What has already been built in `jarvis-ui`
4. How blank-project onboarding is supposed to work
5. How existing-project startup is supposed to work
6. What is still missing before Jarvis feels truly alive
7. The highest-value next implementation steps

## Output Style
- Write for a commander, not for another AI
- Be concise but concrete
- Prefer clarity over hype
- Call out any mismatches between current behavior and intended behavior

## Output Location
Write your response to:
`production/outbox/reports/2026-04-07-gemini-overview-jarvis-status.md`

## Important Constraints
- Do not invent features that are not present
- Treat `production/vault/FOUNDING_PROMPT.md` as the original product intent
- Treat current repo-specific production docs as Jarvis-build truth, not as the final blank-project behavior
