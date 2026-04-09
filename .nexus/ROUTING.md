# ROUTING.md — Task Routing Guide
<!-- Use this to decide: which room, which AI, which workflow. -->

## How To Use
1. Find your task type in the left column
2. Enter the listed room via `bash .nexus/scripts/room-enter.sh [room]`
3. Use the listed AI
4. Follow the listed workflow if one applies

Canonical room and AI ownership reference:
`.nexus/contracts/ROOM_AI_CONTRACT.md`

---

## Master Routing Table

| Task Type | Room | AI | Workflow |
|-----------|------|----|----------|
| System design / architecture decision | architect | Claude | spec-to-architecture.md |
| New feature planning / requirements | product | Claude | idea-to-spec.md |
| Frontend component / UI implementation | frontend | Codex | architecture-to-code.md |
| Backend service / API / endpoint | backend | Codex | architecture-to-code.md |
| Database schema design | data | Claude (design) | spec-to-architecture.md |
| Database migration / query implementation | data | Codex | architecture-to-code.md |
| Bug diagnosis / root cause | [relevant room] | Claude | — |
| Bug fix implementation | [relevant room] | Codex | — |
| Code review | architect | Claude | code-review.md |
| Security audit / threat model | security | Claude | security-audit.md |
| Secrets / auth review | security | Claude | security-audit.md |
| Test strategy design | qa | Claude | — |
| Test writing (unit / integration / E2E) | qa | Codex | — |
| CI/CD pipeline / Docker / infra | devops | Codex | deployment.md |
| Production incident response | devops + backend | Claude | production-incident.md |
| Documentation (README, API docs, guides) | writer | Gemini | — |
| Changelog / release notes | writer | Gemini | — |
| PRD / user stories / acceptance criteria | product | Claude | idea-to-spec.md |
| Product prose draft from approved scope | product | Gemini (draft) | idea-to-spec.md |
| Competitive research / technical analysis | [relevant room] | Gemini | — |
| Marketing copy / positioning | marketing | Gemini | — |
| Agent upgrade / system update | — | Claude orchestrates | upgrade-agents.md |
| Onboard new project into NEXUS | — | Claude | — (run init.sh first) |

---

## AI Capability Matrix

### Claude — Use When:
- Architecture decisions, complex reasoning, judgment calls
- Multi-file debugging and root cause analysis
- Code review requiring understanding of system design
- Security audits and threat modeling
- Orchestrating work across multiple AIs
- Anything where the answer is nuanced or has trade-offs
- **Context:** 200k tokens | **Strength:** Reasoning, judgment, complex analysis

### Codex (ChatGPT) — Use When:
- Bounded code implementation with clear specs (≤3 files per task)
- Refactoring per a written spec
- Writing tests when inputs/outputs and edge cases are defined
- Mechanical instruction-following tasks
- **Context:** 128k tokens | **Strength:** Precise code generation, instruction following

### Gemini — Use When:
- Writing documentation, READMEs, changelogs
- Reading very large codebases or files (1M token window)
- PRD writing, structured prose, research reports
- Competitive analysis and market research
- **Context:** 1M tokens | **Strength:** Long context, documentation, research

---

## Handoff Protocols

### Claude → Codex (implementation handoff)
Claude writes to `.nexus/outbox/prompts/[date]-codex-[room]-[slug].md`:
- Exact file paths to create or modify
- Function signatures, types, interfaces
- Expected behavior in plain English
- Edge cases that must be handled
- Example inputs and expected outputs
- Which existing patterns to follow (file path references)

### Codex → Claude (completion note)
Codex writes to `.nexus/outbox/reports/[date]-codex-[room]-[slug].md`:
- Files changed (list)
- What was implemented vs. what was skipped
- Edge cases discovered during implementation
- Open questions or ambiguities found
- Test results (pass/fail counts)

### Claude → Gemini (documentation handoff)
Claude writes to `.nexus/outbox/prompts/[date]-gemini-writer-[slug].md`:
- Which document to update or create
- The facts/content (not prose — Gemini writes the prose)
- Context from HANDOFF.md relevant to this doc
- Target word count or length
- Tone and audience

### AI → Human (decision request)
Any AI writes to `.nexus/outbox/decisions/[date]-[room]-[slug].md`:
- Decision needed
- Options with tradeoffs
- Recommended option with reasoning
- Impact if delayed

---

## Room Switching Protocol
One session = one room. Do not mix rooms in the same AI session.

To switch rooms:
1. AI: "I'm ending the [current-room] session. Updating CONTEXT.md and HANDOFF.md."
2. AI updates files
3. User: opens new AI session
4. User: `bash .nexus/scripts/room-enter.sh [new-room]` → copy → paste → go
