# Workflow: Upgrade Agents

## Purpose
Research current AI capabilities and best practices, then update all NEXUS agent definitions
to reflect the latest standards. Keeps the AI team operating at peak effectiveness.

## When To Run
- Every 90 days (quarterly)
- After any major AI model release (Claude 4→5, GPT-5, Gemini 2→3, etc.)
- When you notice agents giving outdated advice or missing capabilities

## Steps

### Step 1 — Gemini (researcher room) — AI Capabilities Research
**Open Gemini and paste this prompt:**

```
You are the NEXUS researcher. Today's date is [DATE].

Research the following and write a comprehensive report:

1. Latest Claude model capabilities (current model: claude-sonnet-4-6 as of 2026)
   - New features, tools, context window changes
   - Best prompt engineering patterns for this model
   - What it's better/worse at vs. previous version

2. Latest Gemini model capabilities (current model: check current)
   - Same as above

3. Latest Codex/ChatGPT capabilities (current model: check current)
   - Same as above

4. Updated best practices for:
   - Multi-AI orchestration patterns (2025-2026 state of the art)
   - Token optimization techniques (new caching, context management)
   - Agent persona prompting (what works better now)
   - Room/workspace isolation patterns

5. New tools or integrations available for each AI that NEXUS should use

Write a research report to: .nexus/outbox/reports/[DATE]-gemini-research-agent-upgrade.md

Format:
## Executive Summary
## Claude Updates
## Gemini Updates
## Codex Updates
## Prompt Engineering Updates
## Token Optimization Updates
## Recommended Agent Changes (specific)
## Sources
```

---

### Step 2 — Claude (architect room) — Review Research
**Prompt:** `bash .nexus/scripts/room-enter.sh architect` → paste into Claude

1. Read `outbox/reports/[date]-gemini-research-agent-upgrade.md`
2. Identify which agents need updates
3. Write a change plan to `outbox/decisions/[date]-agent-upgrade-plan.md`:

```markdown
# Agent Upgrade Plan: [DATE]

## Changes Required
| Agent File | Change Type | Specific Change |
|-----------|-------------|----------------|
| claude-architect.md | UPDATE | [what to change] |
| codex-frontend.md | UPDATE | [what to change] |
| ... | ... | ... |

## Changes NOT Recommended
| Agent File | Reason |
|-----------|--------|
| [file] | [why it's fine as-is] |

## ADRs Required
[Any architectural changes to the NEXUS system itself]
```

---

### Step 3 — Human Review [GATE]
Review the upgrade plan.
- Approve specific changes
- Reject changes that feel wrong
- Tell Claude: "Proceed with all changes" or "Proceed except [X]"

---

### Step 4 — Claude — Update Agent Files
Claude updates each agent file in `.nexus/agents/`:
- Update capabilities and expertise sections
- Update tool references (new tools available)
- Update prompt patterns for the model version
- Update what the model is better/worse at
- **Do NOT change:** core responsibilities, strict rules (unless research specifically flags one)

At the bottom of each updated agent file, append:
```markdown
---
## Upgrade History
- [DATE]: [Summary of what changed and why] (source: [research report])
```

---

### Step 5 — Update ROOM PROMPT.md Files
If AI model behaviors changed, update the PROMPT.md files in each room that uses the updated AI.

---

### Step 6 — Update ROUTING.md
If capability changes affect which AI should handle which task type, update ROUTING.md.

---

### Step 7 — Log Upgrade in vault/DECISIONS.md
```markdown
## ADR-NNN — NEXUS Agent Upgrade: [DATE]
**Date:** [DATE]
**Status:** ACCEPTED
**Context:** Quarterly agent upgrade to reflect AI model changes as of [DATE]
**Decision:** Updated [N] agent files based on Gemini research report
**Changes:** [brief summary]
**Next upgrade scheduled:** [DATE + 90 days]
```

---

### Step 8 — Run Health Check
```bash
bash .nexus/scripts/health-check.sh
```
All checks must pass after upgrade.

---

## Upgrade Scope Guidelines
- **Always update:** Model version references, new tool capabilities, deprecated patterns
- **Update carefully:** Strict rules (only if research shows the rule is counterproductive)
- **Never change:** Agent's fundamental role, its room assignment, its vault/DECISIONS.md obligations
- **Get human approval for:** Any change to strict rules or fundamental responsibilities
