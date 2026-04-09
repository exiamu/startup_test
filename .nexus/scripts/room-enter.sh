#!/usr/bin/env bash
# =============================================================================
# NEXUS room-enter.sh — Print room entry prompt to stdout
# =============================================================================
# Usage:
#   bash .nexus/scripts/room-enter.sh [room-name]
#   bash .nexus/scripts/room-enter.sh          (lists available rooms)
#
# Output: PROMPT.md content + current CONTEXT.md — ready to paste into any AI
#
# Example:
#   bash .nexus/scripts/room-enter.sh architect
#   → copy the output → paste as first message to Claude
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXUS_DIR="$(dirname "$SCRIPT_DIR")"
ROOM="${1:-}"

# ── Available rooms ───────────────────────────────────────────────────────────
AVAILABLE_ROOMS=("architect" "frontend" "backend" "security" "devops" "qa" "product" "writer" "data" "marketing")

# ── No room specified: show menu ──────────────────────────────────────────────
if [ -z "$ROOM" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════╗"
  echo "║           NEXUS — Enter a Room               ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""
  echo "  Usage: bash .nexus/scripts/room-enter.sh [room]"
  echo ""
  echo "  Available rooms:"
  echo ""
  for r in "${AVAILABLE_ROOMS[@]}"; do
    ROOM_FILE="$NEXUS_DIR/rooms/$r/ROOM.md"
    if [ -f "$ROOM_FILE" ]; then
      # Extract the "Owns" first line from ROOM.md for a quick description
      OWNS=$(grep -A1 "## This Room Owns" "$ROOM_FILE" 2>/dev/null | tail -1 | sed 's/^- //' || echo "")
      printf "    %-12s  %s\n" "$r" "$OWNS"
    else
      printf "    %-12s  (not configured yet)\n" "$r"
    fi
  done
  echo ""
  echo "  AI routing:"
  echo "    Canonical contract: .nexus/contracts/ROOM_AI_CONTRACT.md"
  echo "    architect security                     → Claude"
  echo "    frontend  backend qa devops            → Codex"
  echo "    writer    marketing                    → Gemini"
  echo "    product   → Claude (Gemini may draft)"
  echo "    data      → Claude design / Codex implementation"
  echo ""
  exit 0
fi

# ── Validate room name ────────────────────────────────────────────────────────
VALID=false
for r in "${AVAILABLE_ROOMS[@]}"; do
  [ "$r" = "$ROOM" ] && VALID=true && break
done

if [ "$VALID" = false ]; then
  echo "ERROR: Unknown room '$ROOM'"
  echo "Available: ${AVAILABLE_ROOMS[*]}"
  exit 1
fi

PROMPT_FILE="$NEXUS_DIR/rooms/$ROOM/PROMPT.md"
CONTEXT_FILE="$NEXUS_DIR/rooms/$ROOM/CONTEXT.md"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: .nexus/rooms/$ROOM/PROMPT.md not found"
  echo "Run health-check.sh to see what's missing."
  exit 1
fi

# ── Output: PROMPT.md + CONTEXT.md ───────────────────────────────────────────
# This is the text to copy and paste into any AI as the first message.

echo "════════════════════════════════════════════════════════════════"
echo "  NEXUS — Entering: $ROOM room"
echo "  Copy everything below this line and paste into your AI."
echo "════════════════════════════════════════════════════════════════"
echo ""

cat "$PROMPT_FILE"

echo ""
echo "---"
echo "## Current Project Context (from CONTEXT.md)"
echo ""

if [ -f "$CONTEXT_FILE" ]; then
  cat "$CONTEXT_FILE"
else
  echo "*(No CONTEXT.md found — this is a fresh room for this project)*"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  END OF ROOM ENTRY PROMPT — paste everything above into your AI"
echo "════════════════════════════════════════════════════════════════"
