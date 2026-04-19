# Codex Report: mission-state-slice-12

Files changed:
- `jarvis-ui/src/modules/command/types.ts`
- `jarvis-ui/src/modules/command/engine.ts`
- `jarvis-ui/src/app/jarvis/jarvis-client.tsx`
- `jarvis-ui/src/app/command/command-client.tsx`

Implemented:
- Added a first mission-manager layer to the planning runtime: each plan now carries `missionState` (`idle`, `advancing`, `recovery`, `blocked`) and a `missionDirective`.
- Mission state is derived from active tasks, recent execution status, and recovery notes instead of treating every prompt as a fresh request.
- Next moves now respect mission state so Jarvis pushes repair/recovery when the current mission is unstable instead of widening scope immediately.
- `/jarvis` and `/command` now surface the mission state and directive directly.

Verification:
- `cd jarvis-ui && npm run typecheck` — pass
- `cd jarvis-ui && npm run build` — pass

Open questions:
- The next slice should let Jarvis convert mission state into stronger behavior: auto-continue obvious next steps, stop on true ambiguity, and elevate commander approval only when needed.
