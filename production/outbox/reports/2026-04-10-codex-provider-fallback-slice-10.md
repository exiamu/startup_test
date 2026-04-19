# Codex Report: provider-fallback-slice-10

Files changed:
- `jarvis-ui/src/modules/providers/reader.ts`
- `jarvis-ui/src/app/api/command/execute/route.ts`
- `jarvis-ui/src/app/jarvis/jarvis-client.tsx`
- `jarvis-ui/src/app/command/command-client.tsx`

Implemented:
- Added backend provider fallback selection using the existing `fallbackOrder` in `.nexus/providers.json`
- If the requested provider is unavailable, Jarvis now selects the next ready provider automatically
- Execution responses now report which provider was actually used and whether fallback occurred
- `/jarvis` and `/command` now tell the commander when Jarvis switched providers

Verification:
- `cd jarvis-ui && npm run typecheck` — pass
- `cd jarvis-ui && npm run build` — pass

Open questions:
- The next architectural step is deciding how far fallback should go: selection only, or true automatic retries/re-routing after failed execution too.
