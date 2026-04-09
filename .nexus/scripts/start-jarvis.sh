#!/usr/bin/env bash
# =============================================================================
# NEXUS start-jarvis.sh — Portable local launcher for Jarvis UI
# =============================================================================
# Usage:
#   bash .nexus/scripts/start-jarvis.sh
#   PORT=3100 bash .nexus/scripts/start-jarvis.sh
#   JARVIS_INSTALL_MODE=skip bash .nexus/scripts/start-jarvis.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$NEXUS_DIR")"
JARVIS_DIR="$PROJECT_ROOT/jarvis-ui"
PORT="${PORT:-3000}"
INSTALL_MODE="${JARVIS_INSTALL_MODE:-auto}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${GREEN}  ✓${NC} $1"; }
warn() { echo -e "${YELLOW}  !${NC} $1"; }
fail() { echo -e "${RED}  ✗${NC} $1"; exit 1; }

extract_nexus_value() {
  local label="$1"
  local file="$2"
  grep -m1 "^- \*\*$label:\*\*" "$file" 2>/dev/null | sed -E "s/^- \*\*$label:\*\* //"
}

install_dependencies() {
  local install_cmd="npm install --no-fund --no-audit"

  if [ -f "$JARVIS_DIR/package-lock.json" ]; then
    install_cmd="npm ci --no-fund --no-audit"
  fi

  echo -e "${CYAN}Dependencies:${NC}"
  warn "jarvis-ui dependencies are missing. Attempting automatic install."
  echo "  Command: $install_cmd"

  if (cd "$JARVIS_DIR" && eval "$install_cmd"); then
    info "jarvis-ui dependencies installed"
  else
    fail "Automatic dependency install failed. Run 'cd jarvis-ui && $install_cmd' manually, then rerun the launcher."
  fi
}

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║          Jarvis Local Startup                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

[ -d "$NEXUS_DIR" ] || fail ".nexus directory not found."
[ -d "$JARVIS_DIR" ] || fail "jarvis-ui directory not found in project root."

command -v node >/dev/null 2>&1 || fail "Node.js is required to run jarvis-ui."
command -v npm >/dev/null 2>&1 || fail "npm is required to run jarvis-ui."

if [ ! -f "$JARVIS_DIR/.env.local" ]; then
  printf 'NEXUS_ROOT=../.nexus\n' > "$JARVIS_DIR/.env.local"
  info "Created jarvis-ui/.env.local with portable NEXUS_ROOT"
fi

CONFIGURED_NAME="$(extract_nexus_value "Name" "$NEXUS_DIR/NEXUS.md")"
EXPECTED_NAME="$(basename "$PROJECT_ROOT")"

if [ "$CONFIGURED_NAME" != "$EXPECTED_NAME" ] || [ -z "$CONFIGURED_NAME" ]; then
  warn "NEXUS identity does not match this project root. Running init.sh to align local identity."
  bash "$NEXUS_DIR/scripts/init.sh" "$EXPECTED_NAME"
fi

if [ ! -d "$JARVIS_DIR/node_modules" ]; then
  if [ "$INSTALL_MODE" = "skip" ]; then
    fail "jarvis-ui dependencies are missing. Run 'cd jarvis-ui && npm ci' or rerun with automatic install enabled."
  fi

  install_dependencies
fi

echo -e "${CYAN}Startup check:${NC}"
if bash "$NEXUS_DIR/scripts/health-check.sh"; then
  info "NEXUS health check completed"
else
  fail "Health check failed. Fix the reported issues before starting Jarvis."
fi

echo ""
echo -e "${CYAN}Launching:${NC}"
echo "  Project root: $PROJECT_ROOT"
echo "  NEXUS root:   $NEXUS_DIR"
echo "  Jarvis UI:    $JARVIS_DIR"
echo "  URL:          http://localhost:$PORT"
echo ""
echo "  First use:"
echo "  1. Open the URL above"
echo "  2. Hit Start"
echo "  3. Choose New or Existing"
echo ""

cd "$JARVIS_DIR"
PORT="$PORT" npm run dev
