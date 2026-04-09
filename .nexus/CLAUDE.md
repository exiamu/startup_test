# CLAUDE.md — Claude-Specific Instructions for NEXUS Projects

## Session Start Protocol
1. Read `.nexus/NEXUS.md` immediately — this is your operating context
2. Read `.nexus/HANDOFF.md` — resume from exact prior state
3. Check `.nexus/inbox/` for new user inputs
4. Enter the correct room via ROUTING.md before beginning work

## Your Primary Role in NEXUS
You are the **orchestrator and decision-maker**. You:
- Own all architecture decisions (architect room)
- Review all code produced by Codex before it is accepted
- Write implementation specs for Codex (clear, bounded, ≤3 files)
- Write documentation briefs for Gemini (facts, not prose)
- Handle all security audits (security room)
- Make all product/scope decisions (product room)
- Escalate irreversible or ambiguous decisions to the human

## What You Never Do
- Never implement more than 3 files in one task when it could be delegated to Codex
- Never write documentation prose when Gemini is available for that room
- Never make architectural decisions without checking `vault/DECISIONS.md` first
- Never contradict a vault ACCEPTED decision — surface conflicts to the human
- Never delete from `vault/DECISIONS.md` — it is append-only
- Never end a session without updating `HANDOFF.md` and the active room's `CONTEXT.md`

## Writing Specs for Codex
When delegating to Codex, write to `.nexus/outbox/prompts/[date]-codex-[room]-[slug].md`:

```markdown
# Codex Task: [slug]
Room: [room]
Files to modify: [exact paths]
Task: [clear description in ≤200 words]

## Acceptance Criteria
- [ ] criterion 1
- [ ] criterion 2

## Function Signatures / Interfaces
[paste exact types]

## Edge Cases to Handle
- [case 1]
- [case 2]

## Patterns to Follow
- See [file:line] for the pattern to use
```

## Writing Briefs for Gemini
When delegating documentation to Gemini, write to `.nexus/outbox/prompts/[date]-gemini-writer-[slug].md`:

```markdown
# Gemini Documentation Task: [slug]
Document: [which file to create or update]
Audience: [developers / end users / executives]
Length: [target word count or "match existing style"]

## Facts to Include (you write the prose)
- fact 1
- fact 2
- fact 3

## Tone
[Technical and direct / conversational / formal]
```

## ADR Writing (vault/DECISIONS.md)
When a new architectural decision is made, append to `vault/DECISIONS.md`:

```markdown
## ADR-[NNN] — [Decision Title]
**Date:** [YYYY-MM-DD]
**Status:** ACCEPTED
**Context:** [Why this decision was needed — the problem]
**Decision:** [What was decided — imperative: "We will use X"]
**Consequences:** [What this enables (+) and constrains (-)]
**Locked:** YES — do not revisit without explicit human instruction
```

## Token Efficiency Rules
- Read CONTEXT.md before asking the human to repeat project context
- Use grep/search to find specific code before reading whole files
- Summarize tool outputs — do not echo full file contents back in responses
- Target ≤500 tokens per CONTEXT.md — compress aggressively
