# Codex Report: backend-provider-runtime-slice-01
Files changed:
- .nexus/providers.json
- .nexus/scripts/providers/invoke-claude.sh
- .nexus/scripts/providers/invoke-codex.sh
- .nexus/scripts/providers/invoke-gemini.sh
- .nexus/scripts/providers/test-provider.sh
- .gitignore
- jarvis-ui/src/modules/providers/types.ts
- jarvis-ui/src/modules/providers/reader.ts

Implemented:
- Added the portable `.nexus/providers.json` manifest with default provider config, fallback order, and token safety limits.
- Added portable provider adapter scripts for Claude, Codex, and Gemini using `#!/usr/bin/env bash`, stdin input, timeout handling, and the required exit-code contract.
- Added `test-provider.sh` to smoke-test provider setup through the same script boundary the runtime will use later.
- Added `jarvis-ui/src/modules/providers/types.ts` and `jarvis-ui/src/modules/providers/reader.ts` so the UI layer can read provider config through `resolveInsideNexus()`.

Skipped (reason):
- Did not implement the execute route, session state, or writer adapter because those belong to later runtime slices.
- Did not add `health-check.sh` support for providers yet because Gemini flagged that as a follow-up item after the provider layer exists.

Edge cases found:
- `npm run typecheck` can fail before `.next` types exist if run cold; running a production build first restores the generated types and then typecheck passes.
- Direct `node -e` execution is not a valid verification path for app modules that rely on the TS path alias (`@/...`).

Verification:
- `bash .nexus/scripts/providers/test-provider.sh claude` -> exit 2 when `ANTHROPIC_API_KEY` is missing
- `bash .nexus/scripts/providers/test-provider.sh codex` -> exit 2 when `OPENAI_API_KEY` is missing
- `bash .nexus/scripts/providers/test-provider.sh gemini` -> exit 2 when `GEMINI_API_KEY` is missing
- `cd jarvis-ui && npm run build` -> pass
- `cd jarvis-ui && npm run typecheck` -> pass (after build)

Open questions for the next architect pass:
- Whether the next slice should implement the provider execute route first or update `init.sh` and `health-check.sh` to bootstrap and validate the new runtime directories/scripts before the route lands.
- Whether the project wants a dedicated `.nexus/scripts/providers/README.md` in the next documentation slice or only after the runtime route exists.
