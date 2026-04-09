#!/usr/bin/env bash
# =============================================================================
# NEXUS init.sh — Bootstrap NEXUS in any project
# =============================================================================
# Usage:
#   bash .nexus/scripts/init.sh [project-name] [stack] [phase] [owner]
#
# Examples:
#   bash .nexus/scripts/init.sh my-saas "Node.js 20 + Express + PostgreSQL" "MVP Development" "Exiamu"
#   bash .nexus/scripts/init.sh my-bot "Python 3.12 + FastAPI"
#
# Safe to re-run: will not overwrite existing content (idempotent)
# =============================================================================

set -euo pipefail

extract_nexus_value() {
  local label="$1"
  local file="$2"
  grep -m1 "^- \*\*$label:\*\*" "$file" 2>/dev/null | sed -E "s/^- \*\*$label:\*\* //"
}

extract_handoff_project() {
  local file="$1"
  grep -m1 "^Project:" "$file" 2>/dev/null | sed -E 's/^Project:[[:space:]]*//'
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_DIR="$(dirname "$SCRIPT_DIR")"
DATE="$(date +%Y-%m-%d)"
CURRENT_NAME="$(extract_nexus_value "Name" "$NEXUS_DIR/NEXUS.md")"
CURRENT_STACK="$(extract_nexus_value "Stack" "$NEXUS_DIR/NEXUS.md")"
CURRENT_PHASE="$(extract_nexus_value "Phase" "$NEXUS_DIR/NEXUS.md")"
CURRENT_OWNER="$(extract_nexus_value "Owner" "$NEXUS_DIR/NEXUS.md")"
CURRENT_HANDOFF_PROJECT="$(extract_handoff_project "$NEXUS_DIR/HANDOFF.md")"

# ── Args ─────────────────────────────────────────────────────────────────────
PROJECT_NAME="${1:-$(basename "$PWD")}"
STACK="${2:-${CURRENT_STACK:-unknown}}"
PHASE="${3:-${CURRENT_PHASE:-INIT}}"
OWNER="${4:-${CURRENT_OWNER:-[OWNER NAME]}}"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}  ✓${NC} $1"; }
warn()    { echo -e "${YELLOW}  !${NC} $1"; }
error()   { echo -e "${RED}  ✗${NC} $1"; }

if sed --version >/dev/null 2>&1; then
  SED_INPLACE=(-i)
else
  SED_INPLACE=(-i "")
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           NEXUS — Project Init               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Project: $PROJECT_NAME"
echo "  Stack:   $STACK"
echo "  Phase:   $PHASE"
echo "  Owner:   $OWNER"
echo "  Date:    $DATE"
echo ""

# ── Verify .nexus is present ──────────────────────────────────────────────────
if [ ! -f "$NEXUS_DIR/NEXUS.md" ]; then
  error ".nexus/NEXUS.md not found."
  echo "  Make sure you copied the entire .nexus/ folder into this project first."
  exit 1
fi
info ".nexus/ folder found"

escape_sed() {
  echo "$1" | sed 's/[\/&]/\\&/g'
}

replace_placeholder() {
  local file="$1"
  local placeholder="$2"
  local value="$3"
  local escaped
  escaped=$(escape_sed "$value")
  if grep -q "$placeholder" "$file"; then
    sed "${SED_INPLACE[@]}" "s/$placeholder/$escaped/g" "$file"
  fi
}

replace_markdown_identity() {
  local file="$1"
  local label="$2"
  local value="$3"
  local escaped
  escaped=$(escape_sed "$value")

  if grep -q "^- \*\*$label:\*\*" "$file" 2>/dev/null; then
    sed "${SED_INPLACE[@]}" -E "s|^- \*\*$label:\*\* .*|- **$label:** $escaped|" "$file"
  fi
}

replace_machine_state_value() {
  local file="$1"
  local label="$2"
  local value="$3"
  local escaped
  escaped=$(escape_sed "$value")

  if grep -q "^$label:" "$file" 2>/dev/null; then
    sed "${SED_INPLACE[@]}" -E "s|^$label:.*|$label:      $escaped|" "$file"
  fi
}

# ── Replace placeholders in NEXUS.md ─────────────────────────────────────────
replace_placeholder "$NEXUS_DIR/NEXUS.md" "\[PROJECT_NAME\]" "$PROJECT_NAME"
replace_placeholder "$NEXUS_DIR/NEXUS.md" "\[STACK\]" "$STACK"
replace_placeholder "$NEXUS_DIR/NEXUS.md" "\[CURRENT_PHASE\]" "$PHASE"
replace_placeholder "$NEXUS_DIR/NEXUS.md" "\[OWNER NAME\]" "$OWNER"
replace_markdown_identity "$NEXUS_DIR/NEXUS.md" "Name" "$PROJECT_NAME"
replace_markdown_identity "$NEXUS_DIR/NEXUS.md" "Stack" "$STACK"
replace_markdown_identity "$NEXUS_DIR/NEXUS.md" "Phase" "$PHASE"
replace_markdown_identity "$NEXUS_DIR/NEXUS.md" "Owner" "$OWNER"
info "Configured NEXUS.md"

# ── Update HANDOFF.md with project name and date ──────────────────────────────
if grep -q "\[PROJECT_NAME\]" "$NEXUS_DIR/HANDOFF.md" 2>/dev/null; then
  sed "${SED_INPLACE[@]}" "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" "$NEXUS_DIR/HANDOFF.md"
  sed "${SED_INPLACE[@]}" "s/\[DATE\]/$DATE/g" "$NEXUS_DIR/HANDOFF.md"
  info "Configured HANDOFF.md"
fi
replace_machine_state_value "$NEXUS_DIR/HANDOFF.md" "Project" "$PROJECT_NAME"

reset_handoff_for_new_project() {
  cat > "$NEXUS_DIR/HANDOFF.md" << EOF
# HANDOFF.md — Session Resume Document
<!-- Read this FIRST at the start of every AI session. -->
<!-- Update this at the END of every session. Target: ≤300 lines. -->
<!-- Archive overflow to .nexus/handoffs/archive/[date]-handoff.md -->

## Machine State
\`\`\`
Project:      $PROJECT_NAME
Phase:        $PHASE
Next Action:  Run Jarvis startup from localhost and choose New or Existing based on this project
Blocker:      None
Last Session: $DATE | init.sh | portable install bootstrap
Tests:        Not run yet
Build:        Not run yet
\`\`\`

## What Just Happened
- Portable \`.nexus\` install was initialized for this adopting project
- Project identity was aligned in \`.nexus/NEXUS.md\`
- Portable vault files remain generic drafts until onboarding or brownfield discovery produces approved project truth
- Next recommended action is to start Jarvis locally and enter the correct startup mode

## Exact Resume Point
Next pass should do this in order:
1. Start Jarvis locally: \`bash .nexus/scripts/start-jarvis.sh\`
2. Open \`http://localhost:3000\`
3. Choose \`New\` for a blank project or \`Existing\` for a brownfield project
4. Keep all onboarding/discovery outputs as drafts until approved

## Active Files
| File | Status | Notes |
|------|--------|-------|
| .nexus/NEXUS.md | active | Project identity aligned |
| .nexus/HANDOFF.md | active | Reset for adopting project |
| .nexus/vault/VISION.md | draft | Generic project template |
| .nexus/vault/CONSTRAINTS.md | draft | Generic project template |
| .nexus/vault/ARCHITECTURE.md | draft | Generic project template |
| .nexus/vault/FOUNDING_PROMPT.md | draft | Fill during onboarding |

## Pending Decisions (Awaiting Human)
- None yet

## Known Issues
| ID | Description | Status | Room |
|----|-------------|--------|------|
| — | None yet | — | — |

## Next Session Recommended AI
**Codex** — continue project startup and onboarding/discovery from the local Jarvis entrypoint
EOF
  info "Reset HANDOFF.md for adopting project"
}

write_default_room_context() {
  local room="$1"
  local context_file="$NEXUS_DIR/rooms/$room/CONTEXT.md"
  cat > "$context_file" << EOF
# $room Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: $DATE by init.sh -->

## Current State
Phase: $PHASE
Last Action: Portable install initialized for this project
Next Action: First $room session — gather project-specific context

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| — | — | — |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| — | — | — | — |

## Known Issues / Blockers
- None yet

## What NOT To Touch (Owned By Other Rooms)
- See .nexus/ROUTING.md for room boundaries
EOF
}

reset_room_contexts_for_new_project() {
  for room in architect frontend backend security devops qa product writer data marketing; do
    write_default_room_context "$room"
  done
  info "Reset room CONTEXT.md files for adopting project"
}

if [ -n "$CURRENT_HANDOFF_PROJECT" ] && [ "$CURRENT_HANDOFF_PROJECT" != "$PROJECT_NAME" ]; then
  reset_handoff_for_new_project
  reset_room_contexts_for_new_project
fi

# ── Ensure scripts are executable ──────────────────────────────────────────────
chmod +x "$NEXUS_DIR/scripts/"*.sh 2>/dev/null || true

# ── Ensure all required directories exist ────────────────────────────────────
for dir in \
  "vault" \
  "rooms/architect" "rooms/frontend" "rooms/backend" \
  "rooms/security" "rooms/devops" "rooms/qa" \
  "rooms/product" "rooms/writer" "rooms/data" "rooms/marketing" \
  "agents" \
  "inbox" \
  "outbox/specs" "outbox/prompts" "outbox/reports" "outbox/decisions" \
  "execution" "sessions" \
  "workflows" \
  "github/workflows" "github/ISSUE_TEMPLATE" \
  "scripts" \
  "scripts/providers" \
  "handoffs/archive"; do
  if [ ! -d "$NEXUS_DIR/$dir" ]; then
    mkdir -p "$NEXUS_DIR/$dir"
    info "Created directory: .nexus/$dir"
  fi
done

# ── Initialize empty inbox files if missing ───────────────────────────────────
for file in ideas.md bugs.md requests.md questions.md; do
  INBOX_FILE="$NEXUS_DIR/inbox/$file"
  if [ ! -f "$INBOX_FILE" ]; then
    echo "<!-- Add your ${file%.md} below. AI reads this at session start. -->" > "$INBOX_FILE"
    info "Created inbox/$file"
  fi
done

# ── Initialize CONTEXT.md files in each room if missing ──────────────────────
for room in architect frontend backend security devops qa product writer data marketing; do
  CONTEXT_FILE="$NEXUS_DIR/rooms/$room/CONTEXT.md"
  if [ ! -f "$CONTEXT_FILE" ]; then
    write_default_room_context "$room"
    info "Created rooms/$room/CONTEXT.md"
  fi
done

# ── Git: Add .nexus to .gitignore exceptions if needed ───────────────────────
GITIGNORE="$(dirname "$NEXUS_DIR")/.gitignore"
if [ -f "$GITIGNORE" ]; then
  if grep -q "^\.nexus$" "$GITIGNORE" 2>/dev/null; then
    warn ".nexus is in .gitignore — consider allowing it: remove or add '!.nexus/'"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              NEXUS is Ready                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Next steps:"
echo "  1. Open .nexus/vault/VISION.md     → define project vision"
echo "  2. Open .nexus/vault/CONSTRAINTS.md → define hard limits"
echo "  3. Capture the adopting project's original brief in .nexus/vault/FOUNDING_PROMPT.md"
echo "  4. Run: bash .nexus/scripts/health-check.sh"
echo "  5. Run: bash .nexus/scripts/room-enter.sh architect"
echo "     → Copy output → paste into Claude → start working"
echo ""
echo "  Full guide: .nexus/NEXUS.md"
echo ""
