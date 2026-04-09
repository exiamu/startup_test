# Codex Task: backend-execution-runtime-slice-02
Room: backend
Files:
- jarvis-ui/src/modules/nexus-adapter/types.ts
- jarvis-ui/src/modules/nexus-adapter/writer.ts
- jarvis-ui/src/app/api/command/execute/route.ts
- jarvis-ui/src/app/api/command/execute/[id]/route.ts

## Task
Implement the core execution persistence and the async API routes needed to run Jarvis provider scripts. This slice builds the "Background Spawn -> Record -> Poll" runtime loop.

### 1. New Types (types.ts)
Add `ExecutionStatus` and `ExecutionRecord` types as defined in `production/plans/runtime_build_plan.md`.

### 2. Nexus Writer (writer.ts)
Create a new file with these utilities using `import { promises as fs } from "node:fs"`:
- `ensureDirectory(segments: string[])`: Uses `resolveInsideNexus` and `fs.mkdir({ recursive: true })`.
- `writeExecutionRecord(record: ExecutionRecord)`: Writes JSON to `.nexus/execution/[id].json`.
- `updateExecutionStatus(id: string, status: ExecutionStatus, error?: string)`: Reads, merges, and re-writes the record.

### 3. Async Execute Route (route.ts - POST)
- Parse `provider`, `room`, `intent`, `prompt`.
- Create `ExecutionRecord` with `status: "planned"`.
- Generate `executionId` using `${provider}-${Date.now()}`.
- Respond with `202 Accepted` and the `executionId` immediately after writing the "planned" record.
- **Background Execution:** Use `child_process.spawn` to run `bash .nexus/scripts/providers/invoke-[provider].sh`.
  - Update record to `status: "running"`.
  - Pipe `prompt` to stdin.
  - On exit 0: Write stdout to `.nexus/execution/[id]-output.txt` and set `status: "completed"`.
  - On non-zero or error: Set `status: "failed"` and store `stderr` as `errorMessage`.

### 4. Status Route ([id]/route.ts - GET)
- Reads `.nexus/execution/[id].json` and returns it as JSON.
- Returns 404 if the record does not exist.

## Acceptance Criteria
- POST to `/api/command/execute` returns a 202 and an ID.
- The provider script runs in the background (verified by the record transitioning to "completed").
- Output is saved to a separate `.txt` file as specified.
- Errors are captured and persisted in the JSON record.

## Patterns to Follow
- Use `resolveInsideNexus()` for ALL paths.
- Never use `child_process.exec`; always use `spawn` with an arguments array.
- Follow the security and timeout guidelines from `production/outbox/reports/2026-04-09-gemini-prebuild-audit.md`.

## Verification
- `cd jarvis-ui && npm run build`
- `curl -X POST -d '{"provider":"claude","prompt":"test"}' /api/command/execute`
