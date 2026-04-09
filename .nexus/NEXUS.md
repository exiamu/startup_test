# NEXUS — Master Context Loader
<!-- Read this file at the start of EVERY AI session in this project. -->
<!-- Do NOT load the entire .nexus/ folder. This file tells you what else to read. -->

## What NEXUS Is
NEXUS is the AI operations layer for the current project. It organizes AI work into
isolated rooms, routes tasks to the right AI, and preserves state between sessions.
It is filesystem-based — no framework overhead, no dependencies.

## Project Identity
- **Name:** startup_test
- **Stack:** NEXUS protocol + Jarvis UI planning
- **Phase:** Protocol Hardening
- **Owner:** Exiamu
- **AI Role This Session:** [PM / Architect / Implementer / Reviewer — pick one]

## Repo Boundary Note
When `.nexus` is being developed as a reusable system artifact, keep repo-specific build truth outside the portable install.

If a top-level `production/` directory exists, treat it as the source of truth for:
- the system's own founding materials
- implementation plans and roadmap docs
- repository-specific architecture and ADR history

`.nexus` should remain portable and generic enough to copy into another project without dragging this repo's product truth with it.

## Mandatory Session Start Protocol (in order)
1. Read `.nexus/HANDOFF.md` — get exact resume point (2 min)
2. Skim `.nexus/vault/DECISIONS.md` — confirm no project-level drift inside the portable install
3. If `production/` exists and you are working on the system itself, read `production/README.md` and the relevant `production/` docs
4. Check `.nexus/inbox/` — read any new user inputs
5. Identify task type → check `.nexus/ROUTING.md` → enter the correct room
6. Read only that room's `CONTEXT.md` — not the whole codebase
7. Begin work

## Room Index
| Room | Owns |
|------|------|
| architect | System design, ADRs, layer boundaries, data model |
| frontend | UI components, state management, routing, UX |
| backend | APIs, services, business logic, database queries |
| security | Auth, secrets, CVE review, compliance, pen test |
| devops | CI/CD, Docker, infra, monitoring, deployment |
| qa | Test strategy, coverage, regression, E2E |
| product | PRD, user stories, roadmap, acceptance criteria |
| writer | Docs, README, changelogs, API docs, guides |
| data | Schemas, migrations, ETL, analytics, reporting |
| marketing | Copy, positioning, launch plans, growth |

## AI Routing (quick reference)
- Architecture decisions, debugging, review → **Claude** (architect room)
- Bounded code implementation (≤3 files) → **Codex** (relevant room)
- Documentation and broad research → **Gemini** (writer or relevant room)
- Product strategy and scope decisions → **Claude** (product room)
- Data design → **Claude**; bounded data implementation → **Codex** (data room)
- Large codebase analysis → **Gemini** (1M context window)
- Canonical room contract: `.nexus/contracts/ROOM_AI_CONTRACT.md`
- Full routing table: `.nexus/ROUTING.md`

## Token Discipline (mandatory)
- Never re-read files already summarized in HANDOFF.md
- Use targeted grep/search before reading full files
- Read ONLY the room you are working in — never other rooms' CONTEXT.md
- Write findings back to the relevant CONTEXT.md at session end
- Update HANDOFF.md at the end of EVERY session — no exceptions

## Vault (Immutable)
`.nexus/vault/` contains locked decisions. Never contradict an ACCEPTED entry.
If a change is needed, surface it to the user — do not unilaterally modify.
vault/DECISIONS.md is append-only. Never delete entries.

## End-of-Session Checklist
Before ending any session, AI must:
- [ ] Update active room's CONTEXT.md with current state
- [ ] Update HANDOFF.md with exact resume point
- [ ] Write any pending decisions to `.nexus/outbox/decisions/`
- [ ] Write project-runtime prompts for the adopting project to `.nexus/outbox/prompts/`
- [ ] Write Jarvis-system build prompts for this repository to `production/outbox/prompts/`
- [ ] Mark inbox items [PROCESSED] or [PENDING]
