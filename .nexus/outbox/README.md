# Outbox — How To Use

AI writes outputs here. You review and action them.

Portable boundary:
- `.nexus/outbox/` is for outputs that belong to the adopting project using the portable install
- Jarvis-system build prompts, reports, and planning outputs for this repository belong in `production/outbox/`
- do not store repo-specific Jarvis product planning here

## Directories

| Directory | Contents | What to do |
|-----------|---------|------------|
| `specs/` | Implementation specs ready for Codex or Gemini | Review → approve (rename to `APPROVED-*.md`) or request changes |
| `prompts/` | Pre-written prompts labeled for specific AI sessions | Copy file contents → paste into the labeled AI as first message |
| `reports/` | Analysis, audits, test results, research findings | Read → archive or act on |
| `decisions/` | Recommended decisions awaiting your approval | Read → approve (move to vault/DECISIONS.md) or reject |

## File Naming Convention

```
[YYYY-MM-DD]-[ai-target]-[room]-[short-slug].md

Examples:
  2026-04-05-codex-backend-stripe-webhook.md    → spec for Codex, backend room
  2026-04-05-gemini-writer-api-docs.md          → prompt for Gemini, writer room
  2026-04-05-human-architect-auth-decision.md   → decision for human, architect room
  2026-04-05-claude-review-pr-42.md             → prompt for Claude to review PR
```

## Workflow for Each Type

### specs/ — Implementation ready
1. Read the spec
2. If correct: rename to `APPROVED-[original-filename].md`
3. If changes needed: add your notes at the bottom and tell Claude in the next session
4. Approved specs: use with room-enter.sh + "read this spec file"

### prompts/ — Cross-AI handoff
1. Open the file — the target AI is in the filename
2. Copy ALL content in the file
3. Open the target AI (Claude / Gemini / Codex)
4. Paste as your first message
5. The AI will be fully loaded and ready to work

### reports/ — AI outputs
1. Read the report
2. Act on any [ACTION NEEDED] items
3. Archive by moving to `reports/archive/` once read

### decisions/ — Awaiting human choice
1. Read the decision file — it has options with trade-offs
2. Choose your option
3. If approved: copy the relevant ADR entry and append to `vault/DECISIONS.md`
4. Reply to Claude in the next session: "Approved option [X] from [filename]"

## Keeping Outbox Clean

Move processed files to `[directory]/archive/` after they are acted on.
If an outbox grows beyond 10 unread files, start a session with: "Review and process outbox/"
