# Jarvis Runtime Build Plan
<!-- Produced by Claude architect session 2026-04-09 -->
<!-- Status: DRAFT — pending Gemini review and refinement -->
<!-- Owner: Exiamu -->
<!-- Next action: Send production/outbox/prompts/2026-04-09-gemini-architect-plan-review.md to Gemini for review -->

## Purpose

This document is the master execution plan for building the Jarvis runtime layer — the missing piece that turns the current routing/recommendation surface into a working multi-AI operator. It governs what gets built, in what order, and which AI builds it.

All implementation work stays true to the founding prompt goal: "make this like a Jarvis to Iron Man." The system must be able to receive a command, route it to the right room and AI, execute the work, and record the result.

## Portability Boundary (non-negotiable)

- `.nexus/` stays portable. It must be droppable into any project. No Jarvis-build-specific truth goes inside it.
- `jarvis-ui/` stays portable. It is the reusable control surface. No repo-specific product truth lives here.
- `production/` is where all Jarvis-system build plans, specs, ADRs, and handoff artifacts live.
- When a Codex or Gemini prompt references files in the project, it must not hardcode paths that only exist in this repo.

## AI Role Map

| AI | Role | Does |
|----|------|------|
| Claude | Architect + Orchestrator | Architecture decisions, write all Codex specs and Gemini briefs, review output, ADR entries, integration testing |
| Codex | Implementer | Execute bounded specs (≤3 files per task), typecheck after every task, file report back to production/outbox/reports/ |
| Gemini | Documenter + Analyst | Long-context passes, documentation writing, reviewing plans, research, README updates |

## Handoff Protocol

**Claude → Codex:** Write spec to `production/outbox/prompts/[date]-codex-[room]-[slug].md`, then hand to Codex.

**Codex → Claude:** Write report to `production/outbox/reports/[date]-codex-[room]-[slug].md`, hand back to Claude for review.

**Claude → Gemini:** Write brief to `production/outbox/prompts/[date]-gemini-[room]-[slug].md`, then hand to Gemini.

**Gemini → project:** Gemini writes directly to the target file specified in the brief.

---

## Status: ACTIVE — Day 1 Maintenance Complete; Reconciled with Gemini Review

---

## What Is Being Built

The Jarvis runtime layer consists of five components, in dependency order:

### Component 1 — Provider Adapter Scripts
**Location:** `.nexus/scripts/providers/`
**What:** Bash scripts that physically invoke each AI provider CLI and capture output. These are the lowest-level execution primitives. They are part of the portable `.nexus` install.
**Files:**
- `invoke-claude.sh` — invokes `claude` CLI, reads from stdin, checks `ANTHROPIC_API_KEY`
- `invoke-codex.sh` — invokes `codex` CLI, checks `OPENAI_API_KEY`
- `invoke-gemini.sh` — invokes `gemini` CLI, checks `GEMINI_API_KEY`
- `test-provider.sh` — smoke-tests any provider by name
- `README.md` — usage docs (written by Gemini)

**Also:** `.nexus/providers.json` — maps AI names to CLI commands and config. The user edits this to point to their installed AI tools.

### Component 2 — Provider TypeScript Types and Reader
**Location:** `jarvis-ui/src/modules/providers/`
**What:** TypeScript types for `ProvidersManifest` and `ProviderConfig`, plus a reader that loads `providers.json` from `.nexus`. Part of the portable `jarvis-ui`.

### Component 3 — Nexus Write Adapter
**Location:** `jarvis-ui/src/modules/nexus-adapter/writer.ts`
**What:** The only place in `jarvis-ui` that writes to disk. Atomic writes, path guards, inbox append, execution record creation, session record persistence. Part of the portable `jarvis-ui`.

### Component 4 — Execution API Route and State (Async Model)
**Location:** `jarvis-ui/src/app/api/command/execute/route.ts` + `[id]/route.ts` + `.nexus/execution/`
**What:** 
- `POST /api/command/execute`: Validates input, writes `ExecutionRecord` with `status: planned`, spawns the provider script in the background, returns `executionId` immediately (HTTP 202).
- `GET /api/command/execute/[id]`: Returns the current status and output (if complete) of a specific execution.
- `.nexus/execution/`: Durable store for task state and output files.

### Component 5 — Commander Session Mode
**Location:** `jarvis-ui/src/app/api/command/session/route.ts` + `command-client.tsx` update + `.nexus/sessions/`
**What:** Persistent conversation state per session. Adds Execute button to the command surface. Links turns to execution records. Includes client-side polling for async execution status.

---

## New Types (added to `jarvis-ui/src/modules/nexus-adapter/types.ts`)

```typescript
export type ExecutionStatus = "planned" | "running" | "completed" | "failed" | "blocked" | "timed_out";

export type ExecutionRecord = {
  executionId: string;
  sessionId: string | null;
  provider: string;
  room: string;
  intent: string;
  prompt: string;
  status: ExecutionStatus;
  createdAt: string;        // ISO 8601
  startedAt: string | null;
  completedAt: string | null;
  outputPath: string | null; // Path to [id]-output.txt
  errorMessage: string | null;
  retryCount: number;
};
```

---

## Execute Route Logic (Async Polling)

### POST `/api/command/execute`:
1. Parse and validate body (`request`, `provider`, `room`, `intent`, `prompt`).
2. Read `providers.json` via `readProvidersManifest()`.
3. Generate `executionId`: `${provider}-${YYYYMMDD}-${Date.now()}`.
4. Write `ExecutionRecord` with `status: "planned"` to `.nexus/execution/[id].json`.
5. Trigger background execution (do not `await` it):
   - Update record to `status: "running"`, `startedAt: now`.
   - `spawn("bash", [scriptPath], { detached: true })`.
   - Pipe prompt to stdin.
   - On completion/error: update `.nexus/execution/[id].json` and write `.nexus/execution/[id]-output.txt`.
6. Return `202 Accepted` with `{ executionId }`.

### GET `/api/command/execute/[id]`:
1. Read `.nexus/execution/[id].json`.
2. Return record. If `status === "completed"`, optionally include output or path.

---

## Maintenance Fixes (COMPLETED)
Day 1 maintenance tasks (hardcode removal, lint fix, init.sh portability, .gitignore) are verified complete.

---

## Day-by-Day Schedule (Revised)

| Day | Task | AI |
|-----|------|----|
| 1 | **Done:** Maintenance fixes. **Done:** Provider scripts + Config + Types (Slice 01). | Codex |
| 2 | **Done:** Backend Execution Runtime (Slice 02): Writer adapter + Async Execute routes. | Codex |
| 3 | **Done:** Frontend Execution Wiring (Slice 03): `/command` executes, polls status, and runtime bootstrap/health-check are updated. | Codex |
| 4 | **Current:** Empty-project drop-in test + integration fixes. | Codex |
| 5 | Session persistence + session reader/writer (Slice 04), but only after the drop-in test path is stable. | Codex |
| 6 | Commander session UI overhaul (History + Restore). | Codex |
| 7 | Documentation + Milestone Closure. | Gemini |

---

## Phase Gates

**After Day 1:**
- `git grep walkers_beast_app jarvis-ui/` → empty
- `cd jarvis-ui && npm run lint` → exit 0
- `.nexus/providers.json` → valid JSON

**After Day 2:**
- `unset ANTHROPIC_API_KEY && bash .nexus/scripts/providers/invoke-claude.sh` → exit 2
- `JARVIS_TIMEOUT=1 echo "test" | bash .nexus/scripts/providers/invoke-claude.sh` → exit 3
- `bash .nexus/scripts/providers/test-provider.sh claude` → PASS or clean FAIL

**After Day 3:**
- `cd jarvis-ui && npm run typecheck` → exit 0
- Path-escape test on `writeExecutionRecord` throws as expected

**After Day 4:**
- POST to `/api/command/execute` with unknown provider → HTTP 400
- Valid execute call → record in `.nexus/execution/`

**After Day 5:**
- Execute button visible after plan
- Full build passes: `npm run build`

**After Day 7:**
- 12-step end-to-end manual test passes
- `bash .nexus/scripts/health-check.sh` passes
- `npm run build` clean

---

## Codex Spec Template

```markdown
# Codex Task: [slug]
Room: [room]
Files:
- [exact path — max 3 files]

Task: [≤200 words]

## Function Signatures
[exact TypeScript — no placeholders]

## Acceptance Criteria
- [ ] verifiable criterion

## Edge Cases
- [case]: expected behavior

## Patterns to Follow
- Use `import { promises as fs } from "node:fs"`
- Use `resolveInsideNexus()` for all .nexus paths
- See [file:line] for reference pattern

## Verification
cd jarvis-ui && npm run typecheck && npm run build
```

## Gemini Brief Template

```markdown
# Gemini Task: [slug]
Document: [file path]
Audience: [developers / end users]
Length: [word count]

## Facts to Include
- fact 1

## Sections Required
- [section name]

## Tone
Technical and direct. No marketing language. No hallucinated API names.
```

## Codex Report Template

```markdown
# Codex Report: [slug]
Files changed: [list]
Implemented: [summary]
Skipped (reason): [if any]
Edge cases found: [if any]
Verification: npm run typecheck — [pass/fail]
Open questions for Claude: [if any]
```

---

## Files Being Created or Modified

### New files (portable — travel with .nexus and jarvis-ui installs)
- `.nexus/providers.json`
- `.nexus/execution/README.md`
- `.nexus/sessions/` (directory, created by init/launcher)
- `.nexus/scripts/providers/invoke-claude.sh`
- `.nexus/scripts/providers/invoke-codex.sh`
- `.nexus/scripts/providers/invoke-gemini.sh`
- `.nexus/scripts/providers/test-provider.sh`
- `.nexus/scripts/providers/README.md`
- `jarvis-ui/src/modules/providers/types.ts`
- `jarvis-ui/src/modules/providers/reader.ts`
- `jarvis-ui/src/modules/nexus-adapter/writer.ts`
- `jarvis-ui/src/modules/nexus-adapter/session-reader.ts`
- `jarvis-ui/src/app/api/command/execute/route.ts`
- `jarvis-ui/src/app/api/command/session/route.ts`

### Modified files (portable)
- `jarvis-ui/src/modules/nexus-adapter/types.ts` (append new types)
- `jarvis-ui/src/modules/project-discovery/reader.ts` (remove hardcode)
- `jarvis-ui/src/app/command/command-client.tsx` (add Execute button + session history)
- `jarvis-ui/package.json` (fix lint script)
- `.nexus/scripts/init.sh` (portability fix)

### New files (production — stay in this repo, do not travel)
- `production/plans/runtime_build_plan.md` (this file)
- `production/outbox/prompts/2026-04-09-gemini-architect-plan-review.md`
- `production/outbox/prompts/2026-04-09-codex-backend-provider-scripts.md`
- `production/outbox/prompts/2026-04-09-codex-backend-writer-adapter.md`
- `production/outbox/prompts/2026-04-09-codex-backend-execute-route.md`
- `production/outbox/prompts/2026-04-09-codex-backend-session-routes.md`
- `production/outbox/prompts/2026-04-09-codex-frontend-command-client-session.md`
- `production/outbox/prompts/2026-04-09-codex-devops-init-portability.md`
- `production/outbox/prompts/2026-04-09-gemini-writer-provider-docs.md`
- `production/outbox/prompts/2026-04-09-gemini-writer-readme-runtime-update.md`

### Updated (production — this repo)
- `production/vault/DECISIONS.md` (append ADR-003, ADR-004)
- `production/STATUS.md` (update after each phase)
- `.nexus/HANDOFF.md` (update at Day 7 close)

## Gemini Review and Refinements
<!-- Reviewed: 2026-04-09 -->

### Alignment Assessment
The plan is highly aligned with the **Founding Vision** of a "suite of AI agents and professional driven automation." By moving from simple prompt generation to a provider-aware execution runtime, we are crossing the gap from a "planning console" to an "operating system." 

**Missing for Vision Alignment:** The founding prompt explicitly prioritizes **Efficiency** and **Lowering Token Usage**. The current plan lacks a "Budget/Token Guardrail" component. While full budgeting is listed as "Next Recommended Work," we should at least implement a `max_token_safety_limit` in `providers.json` to prevent runaway costs during this 7-day build.

### Portability Flags
- **`providers.json`:** Ensure the `command` field supports both absolute paths and naked binary names (relying on the user's `$PATH`). 
- **Script Shebangs:** The provider scripts must use `#!/usr/bin/env bash` rather than `#!/bin/bash` to ensure compatibility across NixOS, macOS, and standard Linux distros.
- **Execution Records:** The plan places logs in `.nexus/execution/`. To maintain portability, these must be excluded from version control in the adopting project.

### Dependency or Scope Issues
- **Day 1 Scope:** Codex is tasked with "Maintenance fixes + providers.json + types spec + ADR-003." This is safe for Codex as the maintenance fixes are surgical (removing 2 lines in `reader.ts`, updating 1 line in `package.json`, and one script update).
- **Execution Timing:** The plan currently implies a synchronous HTTP request for execution. AI providers often take 30s–120s. Standard browser/proxy timeouts will break this. Component 4 must be an **Async Execution Model** (POST returns `executionId` immediately; client polls for status).

### Missing Pieces
- **`.gitignore` update:** The plan must explicitly task Codex with adding `.nexus/execution/` and `.nexus/sessions/` to the repo's `.gitignore` (or a `.nexus/.gitignore` if we want nested portability).
- **`health-check.sh`:** Needs a new section to verify provider script executability (`[ -x "$script" ]`) and directory presence.
- **`init.sh`:** Must be updated to `mkdir -p` the `execution` and `sessions` folders to ensure a "ready" state after a fresh install.
- **Provider Timeouts:** The plan mentions a 120s default. We need to ensure the Node.js `spawn` logic correctly kills the process group on timeout to prevent zombie CLI processes.

### Risk Areas
- **Synchronous Execution Risk:** (Mitigated by switching to Async/Polling).
- **Disk Pressure:** 7 days of execution logs can grow. We should add a basic "cleanup" or "rotation" note to the session specs so `.nexus` doesn't balloon.
- **Shell Injection:** The plan's "stdin-only" rule is excellent. We must enforce that `args` from `providers.json` are passed as an array to `spawn`, never concatenated.

### Proposed Gemini Pre-Build Task
**Task: "Codebase Utility & Pattern Audit"**
Before Codex starts Day 1 implementation, Gemini will perform a deep scan of `jarvis-ui/src/lib/` and `jarvis-ui/src/modules/nexus-adapter/` to identify all existing path-resolution utilities (like `resolveInsideNexus`) and error-handling patterns. 
**Output:** A "Developer Reference" report for Codex to ensure the new `writer.ts` and `execute` route use established 100% portable path logic.

### Refined Day-by-Day Schedule (Adjusted for Async & Pre-Build)

| Day | AM | PM |
|-----|----|----|
| 1 | **Gemini: Utility & Pattern Audit.** Codex: Fix maintenance issues + `.gitignore`. | Claude: providers.json + types spec + ADR-003 (include Async model). |
| 2 | Codex: invoke-*.sh scripts + test-provider.sh + providers.json. | Verify Phase 2 gates (executability check). |
| 3 | Claude: write writer.ts spec (Async-aware). Codex: writer.ts + types.ts additions. | Verify writer.ts (ensure atomic state writes). |
| 4 | Codex: providers/reader.ts + **Async** execute route (returns ID). | Codex: GET /api/command/execute/[id] status route. |
| 5 | Codex: session routes + session-reader.ts. | Codex: command-client.tsx (Polling logic + Execute button). |
| 6 | Claude: integration test pass, file bugs. | Codex: fix failures. init.sh/health-check.sh updates. |
| 7 | Gemini: provider docs + README update. | Final health-check + build. ADR-004. |

### Summary Verdict
The plan is **Ready for Execution** once the **Async Execution Model** is adopted for the API route. This is the single highest-priority refinement to prevent system instability. The addition of the Gemini Pre-Build Audit on Day 1 will ensure Codex maintains the high portability standards required by the founding prompt.
