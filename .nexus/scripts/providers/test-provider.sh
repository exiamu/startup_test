#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROVIDER="${1:-}"

if [ -z "$PROVIDER" ]; then
  echo "Usage: bash .nexus/scripts/providers/test-provider.sh [claude|codex|gemini]" >&2
  exit 1
fi

case "$PROVIDER" in
  claude)
    SCRIPT_PATH="$SCRIPT_DIR/invoke-claude.sh"
    ;;
  codex)
    SCRIPT_PATH="$SCRIPT_DIR/invoke-codex.sh"
    ;;
  gemini)
    SCRIPT_PATH="$SCRIPT_DIR/invoke-gemini.sh"
    ;;
  *)
    echo "Unknown provider: $PROVIDER" >&2
    exit 1
    ;;
esac

printf 'Provider smoke test.\n' | bash "$SCRIPT_PATH"
