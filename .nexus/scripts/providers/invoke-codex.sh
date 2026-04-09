#!/usr/bin/env bash

set -euo pipefail

PROVIDER_COMMAND="${CODEX_COMMAND:-codex}"
REQUIRED_ENV_VAR="OPENAI_API_KEY"
TIMEOUT_SECONDS="${JARVIS_TIMEOUT:-120}"
PROMPT="$(cat)"

if [ -z "${!REQUIRED_ENV_VAR:-}" ]; then
  echo "Missing required credential environment variable: ${REQUIRED_ENV_VAR}" >&2
  exit 2
fi

if command -v timeout >/dev/null 2>&1; then
  TIMEOUT_BIN=(timeout)
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_BIN=(gtimeout)
else
  echo "No supported timeout command found (expected timeout or gtimeout)." >&2
  exit 1
fi

STDOUT_FILE="$(mktemp)"
STDERR_FILE="$(mktemp)"
cleanup() {
  rm -f "$STDOUT_FILE" "$STDERR_FILE"
}
trap cleanup EXIT

set +e
printf '%s' "$PROMPT" | "${TIMEOUT_BIN[@]}" "$TIMEOUT_SECONDS" "$PROVIDER_COMMAND" --quiet >"$STDOUT_FILE" 2>"$STDERR_FILE"
STATUS=$?
set -e

if [ "$STATUS" -eq 124 ]; then
  cat "$STDERR_FILE" >&2
  exit 3
fi

if [ "$STATUS" -ne 0 ]; then
  cat "$STDERR_FILE" >&2
  exit 1
fi

cat "$STDOUT_FILE"
