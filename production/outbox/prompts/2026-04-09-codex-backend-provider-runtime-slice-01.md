# Codex Task: backend-provider-runtime-slice-01
Room: backend
Files:
- .nexus/providers.json
- .nexus/scripts/providers/invoke-claude.sh
- .nexus/scripts/providers/invoke-codex.sh
- .nexus/scripts/providers/invoke-gemini.sh
- .nexus/scripts/providers/test-provider.sh
- jarvis-ui/src/modules/providers/types.ts
- jarvis-ui/src/modules/providers/reader.ts

## Task
Implement the low-level provider execution layer. This includes the bash adapter scripts that invoke AI CLIs and the TypeScript types/reader for the `providers.json` manifest.

### 1. Provider Adapter Scripts (.nexus/scripts/providers/)
All `invoke-*.sh` scripts must follow this contract:
- Input: Full prompt text on stdin.
- Output: AI response text on stdout.
- Exit Codes: 0 (Success), 1 (Exec error), 2 (Env var missing), 3 (Timeout).
- Use `#!/usr/bin/env bash` for portability.
- Respect `JARVIS_TIMEOUT` env var (default 120s).
- Env vars: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`.

### 2. providers.json (.nexus/)
Create a manifest mapping provider names to these scripts and their default configurations (args, timeouts, enabled status).

### 3. TypeScript Layer (jarvis-ui/src/modules/providers/)
- Define `ProviderConfig` and `ProvidersManifest` types.
- Implement `readProvidersManifest()` using `resolveInsideNexus()` from `@/lib/nexus-path`.

## Acceptance Criteria
- `bash .nexus/scripts/providers/test-provider.sh claude` fails with Exit 2 if `ANTHROPIC_API_KEY` is missing.
- `readProvidersManifest()` correctly loads the JSON from the `.nexus` root.
- All scripts are executable (`chmod +x`).

## Patterns to Follow
- Use `resolveInsideNexus()` for all paths in the UI layer.
- Ensure bash scripts never echo credentials to stderr/stdout.
- Follow the schema defined in `production/plans/runtime_build_plan.md`.

## Verification
- `cd jarvis-ui && npm run typecheck`
- `bash .nexus/scripts/providers/test-provider.sh [name]`
