# ROOM_AI_CONTRACT.md — Canonical Room and AI Contract
<!-- This file is the canonical reference for room ownership and default AI routing. -->
<!-- When other files disagree, this contract wins and the other files must be updated. -->

## Purpose
This contract exists to stop routing drift across:
- `.nexus/NEXUS.md`
- `.nexus/ROUTING.md`
- `.nexus/rooms/*`
- `.nexus/agents/*`
- `.nexus/scripts/room-enter.sh`
- `jarvis-ui` intent routing and launch assembly

## Core Rules
1. One room owns one domain.
2. One room can use more than one AI, but the default AI and fallback AI must be explicit.
3. Routing by task must never contradict room ownership.
4. Product strategy and architecture decisions default to Claude.
5. Implementation defaults to Codex unless the task is research or documentation.
6. Documentation and broad research default to Gemini unless a decision is required.

## Canonical Room Map

| Room | Primary Responsibility | Default AI | Secondary AI | Notes |
|------|------------------------|------------|--------------|-------|
| architect | architecture, ADRs, technical review, orchestration | Claude | None | decision-making room |
| frontend | UI implementation and client behavior | Codex | Claude | Claude only for complex state/design review |
| backend | API and service implementation | Codex | Claude | Claude only for diagnosis/review/spec refinement |
| security | threat modeling, auth review, vulnerability review | Claude | Gemini | Gemini supports research only |
| devops | CI/CD, infra implementation, deployment systems | Codex | Claude | Claude for incident reasoning and infra design |
| qa | test implementation and coverage work | Codex | Claude | Claude for test strategy |
| product | scope, PRDs, roadmap, acceptance criteria | Claude | Gemini | Gemini may draft prose, Claude owns final scope gate |
| writer | technical documentation and changelogs | Gemini | Claude | Claude for technical accuracy review |
| data | schema design, migrations, query design | Claude | Codex | Claude owns design; Codex executes bounded migrations/queries |
| marketing | positioning, launch copy, campaigns | Gemini | Claude | Claude for strategy review when needed |

## Task-Level Routing Rules
- Architecture decisions: architect + Claude
- Product decisions and prioritization: product + Claude
- Product prose drafting: product + Gemini, then product + Claude review
- Frontend implementation: frontend + Codex
- Backend implementation: backend + Codex
- Database design: data + Claude
- Database implementation: data + Codex, based on a bounded spec
- Security review: security + Claude
- Competitive or ecosystem research: relevant room + Gemini
- Technical docs: writer + Gemini
- Incident diagnosis with cross-system reasoning: architect or devops + Claude

## Implications For Tooling
- `room-enter.sh` must not print simplified AI guidance that contradicts this file.
- `ROUTING.md` may be more detailed, but it must be compatible with this contract.
- `jarvis-ui` should mirror this file as the canonical routing basis.

## Alignment Check
Every time routing changes, verify these files:
- `.nexus/NEXUS.md`
- `.nexus/ROUTING.md`
- `.nexus/scripts/room-enter.sh`
- `.nexus/rooms/*/PROMPT.md`
- `.nexus/rooms/*/ROOM.md`
- `.nexus/agents/*`
- `jarvis-ui` routing code once it exists
