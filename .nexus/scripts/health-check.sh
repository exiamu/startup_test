#!/usr/bin/env bash
# =============================================================================
# NEXUS health-check.sh — Verify NEXUS is fully configured
# =============================================================================
# Usage: bash .nexus/scripts/health-check.sh
# Exit code: 0 = all checks passed, 1 = failures found
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_DIR="$(dirname "$SCRIPT_DIR")"
ERRORS=0
WARNINGS=0

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; ERRORS=$((ERRORS + 1)); }
warn() { echo -e "  ${YELLOW}!${NC} $1"; WARNINGS=$((WARNINGS + 1)); }

check_file() {
  local path="$1"
  local label="${2:-$path}"
  if [ -f "$NEXUS_DIR/$path" ]; then
    ok "$label"
  else
    fail "MISSING: .nexus/$path"
  fi
}

check_directory() {
  local path="$1"
  local label="${2:-$path}"
  if [ -d "$NEXUS_DIR/$path" ]; then
    ok "$label"
  else
    fail "MISSING: .nexus/$path/"
  fi
}

check_no_placeholder() {
  local path="$1"
  local placeholder="$2"
  if [ -f "$NEXUS_DIR/$path" ] && grep -q "$placeholder" "$NEXUS_DIR/$path" 2>/dev/null; then
    warn "PLACEHOLDER: .nexus/$path still contains '$placeholder' — run init.sh or fill manually"
  fi
}

check_required_value() {
  local path="$1"
  local pattern="$2"
  local message="$3"
  if [ -f "$NEXUS_DIR/$path" ] && grep -q "$pattern" "$NEXUS_DIR/$path" 2>/dev/null; then
    fail "$message"
  fi
}

check_draft_status() {
  local path="$1"
  local label="$2"
  if [ -f "$NEXUS_DIR/$path" ] && grep -q "## Status: DRAFT" "$NEXUS_DIR/$path" 2>/dev/null; then
    warn "DRAFT: .nexus/$path is still in DRAFT status ($label)"
  fi
}

check_routing_contract() {
  if [ ! -f "$NEXUS_DIR/contracts/ROOM_AI_CONTRACT.md" ]; then
    fail "MISSING: .nexus/contracts/ROOM_AI_CONTRACT.md"
    return
  fi

  if ! grep -q "product | scope, PRDs, roadmap, acceptance criteria | Claude" "$NEXUS_DIR/contracts/ROOM_AI_CONTRACT.md" 2>/dev/null; then
    fail "Routing contract missing canonical product -> Claude mapping"
  fi

  if ! grep -q "data | schema design, migrations, query design | Claude | Codex" "$NEXUS_DIR/contracts/ROOM_AI_CONTRACT.md" 2>/dev/null; then
    fail "Routing contract missing canonical data design/implementation mapping"
  fi
}

check_file_size() {
  local path="$1"
  local max_lines="$2"
  local label="$3"
  if [ -f "$NEXUS_DIR/$path" ]; then
    local lines
    lines=$(wc -l < "$NEXUS_DIR/$path")
    if [ "$lines" -gt "$max_lines" ]; then
      warn "SIZE: .nexus/$path has $lines lines (target: ≤$max_lines) — consider compressing"
    fi
  fi
}

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║          NEXUS Health Check                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Core Files ───────────────────────────────────────────────────────────────
echo -e "${CYAN}Core files:${NC}"
check_file "NEXUS.md"
check_file "ROUTING.md"
check_file "HANDOFF.md"
check_file "CLAUDE.md"
check_file "AGENTS.md"
check_file "GEMINI.md"
check_file "contracts/ROOM_AI_CONTRACT.md"

# ── Vault ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Vault:${NC}"
check_file "vault/VISION.md"
check_file "vault/CONSTRAINTS.md"
check_file "vault/DECISIONS.md"
check_file "vault/ARCHITECTURE.md"
check_file "vault/FOUNDING_PROMPT.md"

# ── Rooms ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Rooms:${NC}"
for room in architect frontend backend security devops qa product writer data marketing; do
  check_file "rooms/$room/ROOM.md"
  check_file "rooms/$room/PROMPT.md"
  check_file "rooms/$room/CONTEXT.md"
done

# ── Agents ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Agents:${NC}"
for agent in \
  claude-architect claude-reviewer claude-pm \
  gemini-researcher gemini-writer gemini-analyst \
  codex-frontend codex-backend codex-tests codex-refactor \
  shared-security shared-devops; do
  check_file "agents/$agent.md"
done

# ── Inbox / Outbox ────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Inbox / Outbox:${NC}"
check_file "inbox/README.md"
check_file "inbox/ideas.md"
check_file "inbox/bugs.md"
check_file "inbox/requests.md"
check_file "inbox/questions.md"
check_file "outbox/README.md"

for dir in specs prompts reports decisions; do
  if [ -d "$NEXUS_DIR/outbox/$dir" ]; then
    ok "outbox/$dir/ exists"
  else
    fail "MISSING: .nexus/outbox/$dir/"
  fi
done

# ── Workflows ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Workflows:${NC}"
for wf in \
  idea-to-spec spec-to-architecture architecture-to-code \
  code-review security-audit deployment production-incident upgrade-agents; do
  check_file "workflows/$wf.md"
done

# ── Scripts ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Scripts:${NC}"
for script in init.sh health-check.sh room-enter.sh start-jarvis.sh update-agents.sh; do
  check_file "scripts/$script"
  if [ -f "$NEXUS_DIR/scripts/$script" ]; then
    if [ ! -x "$NEXUS_DIR/scripts/$script" ]; then
      warn "Not executable: .nexus/scripts/$script — run: chmod +x .nexus/scripts/$script"
    fi
  fi
done

echo ""
echo -e "${CYAN}Runtime layer:${NC}"
check_file "providers.json"
check_directory "execution"
check_directory "sessions"
for script in invoke-claude.sh invoke-codex.sh invoke-gemini.sh test-provider.sh; do
  check_file "scripts/providers/$script"
  if [ -f "$NEXUS_DIR/scripts/providers/$script" ]; then
    if [ ! -x "$NEXUS_DIR/scripts/providers/$script" ]; then
      warn "Not executable: .nexus/scripts/providers/$script — run: chmod +x .nexus/scripts/providers/$script"
    fi
  fi
done

# ── GitHub ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}GitHub integration:${NC}"
check_file "github/workflows/nexus-review.yml"
check_file "github/workflows/nexus-security.yml"
check_file "github/workflows/nexus-docs.yml"
check_file "github/PULL_REQUEST_TEMPLATE.md"

# ── Placeholder checks ────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Placeholder checks:${NC}"
check_no_placeholder "NEXUS.md" "\[PROJECT_NAME\]"
check_no_placeholder "NEXUS.md" "\[STACK\]"
check_no_placeholder "NEXUS.md" "\[CURRENT_PHASE\]"
check_no_placeholder "NEXUS.md" "\[OWNER NAME\]"
check_required_value "NEXUS.md" "\*\*Name:\*\* NEXUS-Demo" "NEXUS.md still uses template demo project name"
check_required_value "NEXUS.md" "\*\*Owner:\*\* \[OWNER NAME\]" "NEXUS.md owner is still unset"

echo ""
echo -e "${CYAN}Routing contract:${NC}"
check_routing_contract

echo ""
echo -e "${CYAN}Project setup status:${NC}"
check_draft_status "vault/VISION.md" "vision should be filled before serious implementation"
check_draft_status "vault/CONSTRAINTS.md" "constraints should be filled before serious implementation"
check_draft_status "vault/ARCHITECTURE.md" "architecture should be filled during early architect work"

# ── Size checks ───────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Size checks:${NC}"
check_file_size "NEXUS.md" 150 "NEXUS.md"
check_file_size "HANDOFF.md" 300 "HANDOFF.md"
for room in architect frontend backend security devops qa product writer data marketing; do
  check_file_size "rooms/$room/CONTEXT.md" 100 "rooms/$room/CONTEXT.md"
done

# ── DECISIONS.md integrity ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Vault integrity:${NC}"
if [ -f "$NEXUS_DIR/vault/DECISIONS.md" ]; then
  ADR_COUNT=$(grep -c "^## ADR-" "$NEXUS_DIR/vault/DECISIONS.md" 2>/dev/null || echo 0)
  ok "vault/DECISIONS.md has $ADR_COUNT ADR entries"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "  ${GREEN}NEXUS health check PASSED — $ERRORS errors, $WARNINGS warnings${NC}"
  echo ""
  echo "  Ready to use. Start with:"
  echo "    bash .nexus/scripts/room-enter.sh architect"
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "  ${YELLOW}NEXUS health check PASSED WITH WARNINGS — $ERRORS errors, $WARNINGS warnings${NC}"
  echo "  Address warnings above for best results."
else
  echo -e "  ${RED}NEXUS health check FAILED — $ERRORS errors, $WARNINGS warnings${NC}"
  echo "  Fix errors above before starting a session."
fi
echo "════════════════════════════════════════════════"
echo ""

[ "$ERRORS" -eq 0 ]
