# Gemini Report: Codebase Utility & Pattern Audit
Date: 2026-04-09
Requested by: Claude / Human
Room: architect

## Executive Summary
- **Path Safety:** All filesystem access MUST use `resolveInsideNexus()` from `@/lib/nexus-path`. This utility enforces a strict sandbox and throws on path escape.
- **Error Handling:** Readers follow a "graceful fallback" pattern (returning `null` or `[]` on missing files). Writers should adopt a "fail-fast" pattern for validation but "graceful recovery" for operational logs.
- **Dependency Standard:** Always use `import { promises as fs } from "node:fs"` for async I/O.

## Findings: Existing Patterns

### 1. Path Resolution (`jarvis-ui/src/lib/nexus-path.ts`)
- **`resolveNexusRoot()`**: Resolves the `.nexus` directory absolute path.
- **`resolveInsideNexus(...segments: string[])`**: **Mandatory** for all file operations.
  - *Behavior:* Throws `Error("Attempted path escape outside NEXUS_ROOT")` if segments try to reference files outside the sandbox.
  - *Codex Note:* Never use `path.join` or `path.resolve` directly with user-provided strings.

### 2. File Reading (`jarvis-ui/src/modules/nexus-adapter/reader.ts`)
- **`readTextIfPresent(relativePath: string)`**: Returns `string | null`. Use this for optional artifacts.
- **`readLinesIfPresent(relativePath: string)`**: Returns `string[]`. Standard for processing `.nexus` metadata files.
- **`fileExists(filePath: string)`**: Simple `fs.access` wrapper.

### 3. State Modeling (`jarvis-ui/src/modules/nexus-adapter/types.ts`)
- The project uses explicit TypeScript types for all filesystem state. New runtime types (ExecutionRecord, SessionRecord) must be added to this file.

## Recommendations for `writer.ts` Implementation

### 1. New Utility: `ensureDirectory`
Codex should implement a recursive directory creator that stays within the Nexus boundary.
```typescript
async function ensureDirectory(segments: string[]): Promise<string> {
  const dirPath = resolveInsideNexus(...segments);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}
```

### 2. Atomic Writes
To prevent corruption of `CONTEXT.md` or `HANDOFF.md`, `writer.ts` should ideally use atomic writes (write to `.tmp` first, then rename) for critical project state. For execution logs and inboxes, simple `appendFile` or `writeFile` is acceptable.

### 3. Async Execution Model
The execution API route must handle timeouts gracefully.
- Use `child_process.spawn` with an array of arguments.
- **NEVER** use `child_process.exec` or string interpolation for provider commands.
- Implement a `SIGTERM`/`SIGKILL` sequence for the provider process group on timeout.

## Sources
- `jarvis-ui/src/lib/nexus-path.ts`
- `jarvis-ui/src/modules/nexus-adapter/reader.ts`
- `jarvis-ui/src/modules/nexus-adapter/types.ts`
