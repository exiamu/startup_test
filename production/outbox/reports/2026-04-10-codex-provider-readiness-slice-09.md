# Codex Report: provider-readiness-slice-09

Files changed:
- `jarvis-ui/src/modules/providers/types.ts`
- `jarvis-ui/src/modules/providers/reader.ts`
- `jarvis-ui/src/app/api/providers/status/route.ts`
- `jarvis-ui/src/app/jarvis/jarvis-client.tsx`
- `jarvis-ui/src/app/command/command-client.tsx`

Implemented:
- Added provider runtime readiness checks based on:
  - `providers.json`
  - required credential env vars
  - command availability in the local shell
- Added `GET /api/providers/status`
- `/jarvis` and `/command` now show provider readiness
- execute buttons now disable when the chosen provider is not actually ready, with a visible reason

Verification:
- `cd jarvis-ui && npm run typecheck` — pass
- `cd jarvis-ui && npm run build` — pass

Open questions:
- The next meaningful step is deciding how Jarvis should react when the primary provider is unavailable: fallback suggestion only, or automatic provider switching.
