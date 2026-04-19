# Codex Report: mission-behavior-slice-13

Files changed:
- `jarvis-ui/src/modules/command/types.ts`
- `jarvis-ui/src/modules/command/engine.ts`
- `jarvis-ui/src/modules/nexus-adapter/types.ts`
- `jarvis-ui/src/modules/nexus-adapter/reader.ts`
- `jarvis-ui/src/app/jarvis/jarvis-client.tsx`
- `jarvis-ui/src/app/command/command-client.tsx`
- `jarvis-ui/src/app/queue/page.tsx`

Implemented:
- Extended runtime context with `missionFocus` and `ambiguitySignals` so Jarvis can distinguish “continue this task” from “stop and clarify priority.”
- Generic continuation requests now behave differently when a mission is active:
  - if one active task is in flight, Jarvis keeps the current room/provider focus instead of re-routing from scratch
  - if multiple active tasks exist, Jarvis routes to architect-level clarification and explicitly asks the commander to pick priority
- `/jarvis` and `/command` now show mission focus plus ambiguity signals.
- `/queue` now shows inferred mission state and focus for recent sessions so runtime state is visible outside the active chat surface.

Verification:
- `cd jarvis-ui && npm run typecheck` — pass
- `cd jarvis-ui && npm run build` — pass

Open questions:
- The next slice should decide when Jarvis is allowed to auto-run the next obvious move versus only recommending it.
