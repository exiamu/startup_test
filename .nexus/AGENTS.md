# AGENTS.md — Cross-Tool Agent Instructions

## NEXUS Protocol (All AI Tools)
This project uses NEXUS — a room-based AI operations system.
Read `.nexus/NEXUS.md` at the start of every session before doing anything else.

## Core Rules (Apply to All AI Tools)

### 1. Start Every Session With Context
- Read `.nexus/NEXUS.md` (master context)
- Read `.nexus/HANDOFF.md` (resume point)
- Check `.nexus/inbox/` for new inputs
- Enter the correct room (see `.nexus/ROUTING.md`)

### 2. End Every Session With Updates
- Update active room's `.nexus/rooms/[room]/CONTEXT.md`
- Update `.nexus/HANDOFF.md` with exact resume point
- Write decisions to `.nexus/outbox/decisions/`
- Write next-AI prompts to `.nexus/outbox/prompts/`

### 3. Vault Is Immutable
- Never delete from `.nexus/vault/DECISIONS.md`
- Never contradict an ACCEPTED decision
- Surface conflicts to the human — do not resolve them autonomously

### 4. One Room Per Session
- Do not mix responsibilities from different rooms in one session
- Cross-room questions → write a prompt to outbox/prompts/ for the right room's AI

### 5. Scope Control
- Codex: implement ≤3 files per task — split larger tasks before starting
- Claude: make decisions, write specs, review — don't do Codex's job
- Gemini: write docs, research, and draft prose when Claude owns the final decision — don't make architectural recommendations

## Room Quick Reference
```
bash .nexus/scripts/room-enter.sh [room-name]
```
Available rooms: architect, frontend, backend, security, devops, qa, product, writer, data, marketing

## File Naming Convention for Outbox
```
[YYYY-MM-DD]-[ai-target]-[room]-[short-slug].md
Examples:
  2026-04-05-codex-backend-stripe-webhook.md
  2026-04-05-gemini-writer-api-docs.md
  2026-04-05-human-architect-auth-decision.md
```

## What This Project Never Does
- Never stores secrets in code (use .env, never commit .env)
- Never ships without tests for new features
- Never breaks the HANDOFF.md chain — every session updates it
- Never modifies vault/ entries retroactively
