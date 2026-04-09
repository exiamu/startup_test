#!/usr/bin/env bash
# =============================================================================
# NEXUS update-agents.sh — Research and update all agent definitions
# =============================================================================
# Usage: bash .nexus/scripts/update-agents.sh
#
# This script:
# 1. Prints the research prompt to paste into Gemini
# 2. Waits for you to paste research results back
# 3. Generates a Claude review prompt
# 4. Documents the upgrade in DECISIONS.md
#
# Run every 90 days or after major AI model releases.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_DIR="$(dirname "$SCRIPT_DIR")"
DATE="$(date +%Y-%m-%d)"
RESEARCH_FILE="$NEXUS_DIR/outbox/reports/${DATE}-gemini-research-agent-upgrade.md"
UPGRADE_PLAN="$NEXUS_DIR/outbox/decisions/${DATE}-agent-upgrade-plan.md"

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         NEXUS Agent Upgrade Tool             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo -e "Date: ${BOLD}$DATE${NC}"
echo ""

# ── Check last upgrade date ───────────────────────────────────────────────────
if grep -q "NEXUS Agent Upgrade" "$NEXUS_DIR/vault/DECISIONS.md" 2>/dev/null; then
  LAST_UPGRADE=$(grep "NEXUS Agent Upgrade" "$NEXUS_DIR/vault/DECISIONS.md" | tail -1 | grep -oP '\d{4}-\d{2}-\d{2}' | head -1 || echo "unknown")
  echo -e "${YELLOW}Last upgrade: $LAST_UPGRADE${NC}"
  echo ""
fi

# ── Step 1: Print Gemini research prompt ─────────────────────────────────────
echo -e "${CYAN}════ STEP 1: Open Gemini and paste this prompt ════${NC}"
echo ""
cat << 'GEMINI_PROMPT'
You are the NEXUS AI Research Agent. Today is [REPLACE WITH TODAY'S DATE].

Research the following and write a comprehensive report. Use your web access to find current information.

## Research Tasks

### 1. Claude (claude.ai / Anthropic)
- Current latest model and its capabilities vs. previous version
- New features: extended thinking, new tool types, context window changes
- Updated prompt engineering best practices for this model
- What it excels at now that it didn't before
- Any deprecated patterns to avoid

### 2. Gemini (Google)
- Current latest model version and capabilities
- 1M context window updates or changes
- New multimodal capabilities
- Best use cases as of today
- Updated prompting patterns

### 3. Codex / ChatGPT (OpenAI)
- Current model for coding tasks (GPT-4o, o1, etc.)
- Coding-specific capabilities and best practices
- What it's better/worse at than Claude for implementation tasks
- Updated prompting patterns for code generation

### 4. Multi-AI Orchestration (current best practices 2025-2026)
- How teams are using Claude + Gemini + Codex together
- Token optimization improvements
- Context window management techniques
- Room/workspace isolation patterns that are working

### 5. Recommended Changes to NEXUS Agents
For each of the 12 agent types in NEXUS, note:
- claude-architect, claude-reviewer, claude-pm
- gemini-researcher, gemini-writer, gemini-analyst
- codex-frontend, codex-backend, codex-tests, codex-refactor
- shared-security, shared-devops

## Output Format
Write your complete research report below. I will save it to a file.

---
# NEXUS Agent Research Report
Date: [TODAY'S DATE]

## Executive Summary (5 key findings)

## Claude — Current State

## Gemini — Current State

## Codex/ChatGPT — Current State

## Multi-AI Orchestration — Best Practices

## Recommended Agent Changes
| Agent | Change | Priority |
|-------|--------|---------|

## Sources
GEMINI_PROMPT

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}After Gemini responds, save its output to:${NC}"
echo -e "${BOLD}$RESEARCH_FILE${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Press ENTER when research file is saved..."
read -r

# ── Verify research file exists ───────────────────────────────────────────────
if [ ! -f "$RESEARCH_FILE" ]; then
  echo -e "${YELLOW}Warning: $RESEARCH_FILE not found.${NC}"
  echo "Creating placeholder — you can fill it in manually."
  cat > "$RESEARCH_FILE" << EOF
# NEXUS Agent Research Report
Date: $DATE
Status: PLACEHOLDER — fill in with Gemini research results

## Executive Summary
[Paste Gemini research here]
EOF
fi

echo ""
echo -e "${GREEN}Research file found.${NC}"
echo ""

# ── Step 2: Print Claude review prompt ───────────────────────────────────────
echo -e "${CYAN}════ STEP 2: Open Claude and paste this prompt ════${NC}"
echo ""
cat << CLAUDE_PROMPT
You are in the NEXUS architect room. Today is $DATE.

## Your Task: Review Agent Upgrade Research

Read the following research report, then create an upgrade plan for all NEXUS agent files.

[PASTE CONTENT OF: $RESEARCH_FILE]

## Instructions
1. Identify which of the 12 agent files need updates
2. For each file that needs updating, specify exactly what to change
3. Write your upgrade plan to: $UPGRADE_PLAN

The agents directory is at: .nexus/agents/
Agent files: claude-architect.md, claude-reviewer.md, claude-pm.md,
             gemini-researcher.md, gemini-writer.md, gemini-analyst.md,
             codex-frontend.md, codex-backend.md, codex-tests.md, codex-refactor.md,
             shared-security.md, shared-devops.md

After writing the upgrade plan, ask the human to review it and approve which changes to make.
Then implement the approved changes by reading and updating each agent file.

At the bottom of each updated agent file, append:
---
## Upgrade History
- $DATE: [summary of change] (Quarterly NEXUS upgrade)

Finally, append this ADR to vault/DECISIONS.md:
## ADR-[next number] — NEXUS Agent Upgrade: $DATE
**Date:** $DATE
**Status:** ACCEPTED
**Context:** Quarterly upgrade based on AI capability research
**Decision:** Updated [N] agent files
**Changes:** [brief list]
**Next upgrade:** $(date -d "+90 days" +%Y-%m-%d 2>/dev/null || date -v+90d +%Y-%m-%d 2>/dev/null || echo "$(date +%Y)-[date+90days]")
CLAUDE_PROMPT

echo ""
echo -e "${GREEN}════ Upgrade process initiated ════${NC}"
echo ""
echo "After Claude completes the upgrade:"
echo "  1. Review the changes in .nexus/agents/"
echo "  2. Run: bash .nexus/scripts/health-check.sh"
echo "  3. Verify vault/DECISIONS.md has the new upgrade ADR"
echo ""
