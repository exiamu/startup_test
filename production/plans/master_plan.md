# jarvis-ui — Companion App for NEXUS

## Status
Historical planning document from an earlier `jarvis-ui` companion-app phase.

Read this for design lineage only.
Do not treat it as the active roadmap.

The active roadmap is:
- `production/STATUS.md`
- `production/plans/implementation_plan.md`
- `production/vault/ARCHITECTURE.md`

## Context

The project at `/home/exiamu/ai/projects/startup_test` contains a `.nexus/` directory — a filesystem-based AI operations protocol with 10 specialist rooms, routing rules, inbox/outbox queues, an immutable vault, and structured handoff files. The system is designed to orchestrate Claude, Codex, and Gemini across multiple sessions.

The goal is to build `jarvis-ui`: a companion application that wraps NEXUS in a "mission control" UX, making it feel like one intelligent Jarvis assistant rather than a manual file-management workflow. The app lives at `/home/exiamu/ai/projects/startup_test/jarvis-ui/` and uses `.nexus` as its sole source of truth.

---

## Architecture Summary

**Stack:**
- Next.js 14 (App Router) + TypeScript — unified frontend/API in one repo, Node.js filesystem access via API routes
- Tailwind CSS + shadcn/ui — dark-mode "mission control" aesthetic, accessible primitives
- Zustand — in-memory session state (conversation log, active room); no database
- react-markdown + remark-gfm — render all `.nexus` markdown files
- chokidar → Server-Sent Events — live file-change push to browser without polling
- `.env.local` with `NEXUS_ROOT=../.nexus` — no hardcoded paths

**Key constraint:** `.nexus` is the only persistent store. All app state is derived from filesystem reads. Writes only go through a single `NexusAdapter` writer with path-escape prevention, atomic writes, and vault immutability enforcement.

---

## Folder Structure

```
jarvis-ui/
├── .env.local / .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── app/
    │   ├── layout.tsx              # Sidebar + Header shell, dark theme
    │   ├── page.tsx                # Redirect → /command
    │   ├── command/page.tsx        # Screen 1: Command Center
    │   ├── overview/page.tsx       # Screen 2: Project Overview
    │   ├── rooms/page.tsx          # Screen 3: Rooms grid
    │   ├── rooms/[room]/page.tsx   # Screen 3b: Room detail
    │   ├── queue/page.tsx          # Screen 4: Work Queue
    │   ├── vault/page.tsx          # Screen 5: Vault
    │   ├── artifacts/page.tsx      # Screen 6: Artifact browser
    │   ├── execution/page.tsx      # Screen 7: Execution panel
    │   └── api/
    │       ├── nexus/health/route.ts
    │       ├── nexus/handoff/route.ts       # GET + PATCH
    │       ├── nexus/vault/[file]/route.ts  # GET; PATCH for DECISIONS append only
    │       ├── nexus/rooms/route.ts
    │       ├── nexus/rooms/[room]/route.ts
    │       ├── nexus/rooms/[room]/context/route.ts   # PATCH
    │       ├── nexus/inbox/[file]/route.ts  # GET + POST (append) + PATCH (mark)
    │       ├── nexus/outbox/[dir]/route.ts  # GET + POST
    │       ├── nexus/outbox/[dir]/[file]/approve/route.ts
    │       ├── nexus/outbox/[dir]/[file]/archive/route.ts
    │       ├── nexus/artifacts/[...path]/route.ts
    │       ├── nexus/watch/route.ts         # GET SSE stream
    │       ├── intent/route.ts              # POST: NL → IntentResult
    │       ├── session/route.ts             # GET + POST + DELETE
    │       └── launch/route.ts              # POST: LaunchOptions → LaunchPackage
    │
    ├── modules/
    │   ├── nexus-adapter/
    │   │   ├── index.ts      # NexusAdapter interface (public)
    │   │   ├── reader.ts     # All read ops
    │   │   ├── writer.ts     # All write ops (single chokepoint, safety rules)
    │   │   ├── parser.ts     # Markdown section extractor, table parser, ADR parser
    │   │   └── types.ts      # HandoffState, RoomState, OutboxItem, VaultFile, ADR, etc.
    │   ├── intent-router/
    │   │   ├── index.ts         # classify(input) → IntentResult
    │   │   ├── classifier.ts    # Keyword + pattern weighted scoring
    │   │   ├── routing-table.ts # TypeScript mirror of .nexus/ROUTING.md (38 entries)
    │   │   └── types.ts         # IntentResult, IntentClass, RoutingEntry
    │   ├── project-discovery/
    │   │   ├── index.ts      # detect .nexus, return NexusRoot
    │   │   └── validator.ts  # Structure validation (mirrors health-check.sh)
    │   ├── session-manager/
    │   │   └── types.ts      # SessionState, ConversationEntry
    │   ├── handoff-writer/
    │   │   ├── index.ts
    │   │   ├── codex-spec.ts    # CodexSpec → outbox/specs/*.md
    │   │   ├── gemini-brief.ts  # GeminiBrief → outbox/prompts/*.md
    │   │   └── decision-doc.ts  # DecisionDoc → outbox/decisions/*.md
    │   ├── approval-gate/
    │   │   └── index.ts      # Scan outbox for items needing human action
    │   ├── activity-timeline/
    │   │   └── index.ts      # Parse handoffs/archive/ → TimelineEvent[]
    │   └── ai-launcher/
    │       ├── index.ts      # assemble(LaunchOptions) → LaunchPackage
    │       ├── claude.ts     # PROMPT.md + CONTEXT.md + context sections
    │       ├── codex.ts      # Spec-format assembly
    │       └── gemini.ts     # Brief-format assembly
    │
    ├── components/
    │   ├── layout/Sidebar.tsx, Header.tsx, LiveIndicator.tsx
    │   ├── command/CommandInput.tsx, IntentPreview.tsx, ConversationLog.tsx, LaunchCard.tsx
    │   ├── overview/MachineState.tsx, ActiveFiles.tsx, PendingDecisions.tsx
    │   ├── rooms/RoomGrid.tsx, RoomCard.tsx, RoomDetail.tsx, RoomContextEditor.tsx, RoomPromptCard.tsx
    │   ├── queue/InboxPanel.tsx, OutboxPanel.tsx, OutboxItem.tsx, ApprovalRequest.tsx
    │   ├── vault/VaultViewer.tsx, ADRList.tsx, VaultStatusBadge.tsx
    │   ├── artifacts/FileTree.tsx, ArtifactViewer.tsx
    │   ├── execution/ExecutionPanel.tsx, ActiveSession.tsx, LaunchPromptBuilder.tsx
    │   └── shared/MarkdownRenderer.tsx, CopyButton.tsx, StatusBadge.tsx, AIPill.tsx, RoomBadge.tsx
    │
    ├── hooks/
    │   useNexusHealth, useHandoff, useRooms, useRoom, useInbox, useOutbox,
    │   useVault, useWatcher (SSE), useSession (Zustand), useIntent
    │
    ├── store/
    │   ├── session.ts   # Zustand: active room, conversation log, pending launch
    │   └── config.ts    # Zustand: nexus root path, preferences
    │
    └── lib/
        nexus-path.ts, file-utils.ts, markdown-utils.ts, date-utils.ts
```

---

## Screens and Responsibilities

| Screen | Route | Purpose |
|--------|-------|---------|
| Command Center | `/command` | Main "talk to Jarvis" chat. NL input → intent classification → routing preview → AI launch package with copy/deep-link |
| Project Overview | `/overview` | HANDOFF.md parsed: phase, last session, next action, active files, pending decisions, known issues |
| Rooms | `/rooms`, `/rooms/[room]` | Grid of all 10 rooms with status. Detail: CONTEXT.md editor + PROMPT.md copy + launch builder |
| Work Queue | `/queue` | Inbox items (ideas/bugs/requests/questions) + Outbox items (specs/prompts/reports/decisions) with approve/archive actions |
| Vault | `/vault` | Read-only view of VISION, CONSTRAINTS, DECISIONS (with ADR list), ARCHITECTURE. DECISIONS is append-only via ADR proposal flow |
| Artifacts | `/artifacts` | File tree of entire `.nexus/`. Click any file to view rendered markdown |
| Execution Panel | `/execution` | Active session: which room/AI, files in scope, blockers. LaunchPromptBuilder. EndSession → HANDOFF.md update modal |

---

## `.nexus` Integration Contract

| File | Read | Write | Condition |
|------|------|-------|-----------|
| `NEXUS.md` | ✓ on load | ✗ | Parse project name, phase |
| `HANDOFF.md` | ✓ every load | ✓ sections | User confirms EndSession modal |
| `ROUTING.md` | ✓ on load | ✗ | Mirrored in routing-table.ts |
| `vault/VISION.md` | ✓ | ✗ | Read-only in UI |
| `vault/CONSTRAINTS.md` | ✓ | ✗ | Read-only in UI |
| `vault/DECISIONS.md` | ✓ | Append ADR only | User approves PROPOSED decision from outbox |
| `vault/ARCHITECTURE.md` | ✓ | ✗ | Read-only in UI |
| `rooms/*/ROOM.md` | ✓ | ✗ | Display only |
| `rooms/*/PROMPT.md` | ✓ | ✗ | Included in AI launch assembly |
| `rooms/*/CONTEXT.md` | ✓ | ✓ with backup | User edits in Room detail |
| `inbox/*.md` | ✓ session start | Append | User submits from Work Queue |
| `outbox/specs/*.md` | ✓ | New + rename APPROVED- | Jarvis generates; user approves |
| `outbox/prompts/*.md` | ✓ | New | Jarvis generates handoff prompt |
| `outbox/reports/*.md` | ✓ | New | AI completion reports |
| `outbox/decisions/*.md` | ✓ | New | Decision items needing human action |
| `handoffs/archive/*.md` | ✓ | ✗ | Activity timeline |

**Write Safety Rules (all enforced in `writer.ts`):**
1. Every write path validated against `NEXUS_ROOT` — no path traversal possible
2. Vault files: only DECISIONS.md accepts appends; others are read-only
3. Atomic writes: `.tmp` → rename
4. CONTEXT.md: dated `.bak` created before every overwrite
5. HANDOFF.md: diff shown to user in modal before write
6. Outbox: filename collision check + auto-suffix, never overwrite

---

## Data Flow: NL Command → NEXUS Write

```
User input: "Figure out why auth is broken"
       │
       ▼
POST /api/intent → IntentRouter.classify()
       │  keyword scoring → intent="debug_issue", room=architect, ai=claude, confidence=high
       ▼
IntentPreview renders: room card + AI pill + human-gate warning
       │
User clicks "Launch with Claude"
       │
POST /api/launch → AILauncher.assemble()
  reads: rooms/architect/PROMPT.md + CONTEXT.md + handoff + vault/decisions (skim) + inbox
  compiles: full session prompt, ~2800 tokens
       │
LaunchCard: copy button + deep link → User pastes into Claude
       │
[Claude session runs, writes outputs]
[User returns to jarvis-ui]
       │
SSE /api/nexus/watch fires on outbox change
       │
Work Queue shows new outbox item → User reviews → Approve / Archive
```

---

## Phased Build Plan

### Phase 1 — Foundation: App scaffold + read-only `.nexus` views
- Next.js 14 app at `jarvis-ui/` with TypeScript, Tailwind, dark theme
- `nexus-adapter/reader.ts` + `parser.ts` — all read ops with tests
- `project-discovery/validator.ts` — structure check
- All `GET` API routes
- All 7 screens rendering live `.nexus` data (read-only)
- Sidebar + Header layout, shared components (MarkdownRenderer, AIPill, RoomBadge, etc.)
- SSE watcher: `chokidar` → `/api/nexus/watch` → `useWatcher` hook

### Phase 2 — Command Center: Intent routing + AI launch
- `intent-router/` module — routing-table.ts mirrors all entries from ROUTING.md
- `POST /api/intent` route
- Command Center screen: NL input → IntentPreview → ConversationLog
- `ai-launcher/` module — assemble PROMPT.md + CONTEXT.md + context sections
- `POST /api/launch` route
- LaunchCard with CopyButton + DeepLinkButton + token estimate
- Zustand session store
- Unit tests for all 38 routing cases

### Phase 3 — Writes: Queue actions + approval gates
- `nexus-adapter/writer.ts` — all write ops, safety rules
- All `PATCH`/`POST`/approval/archive API routes
- Work Queue fully interactive (approve spec, archive, mark inbox items)
- `handoff-writer/` module — CodexSpec, GeminiBrief, DecisionDoc generators
- Execution Panel — EndSession flow + HANDOFF.md update modal
- Room detail — RoomContextEditor with save + backup

### Phase 4 — Polish: Timeline + launch ergonomics
- `activity-timeline/` — parse `handoffs/archive/` → Overview screen
- LaunchPromptBuilder on Room detail + Execution Panel (toggles, custom instruction, live token estimate)
- ADR proposal flow in Vault → outbox/decisions/ → approve → append to DECISIONS.md
- Keyboard shortcuts: `Cmd+K` (command center), `Cmd+C` (copy last launch prompt)
- Health indicator in Header with tooltip

### Phase 5 — Robustness + multi-project
- Multi-project path picker (recent projects in localStorage)
- Error boundaries on all screens
- Full test suite (modules + API routes)
- Optional: Claude API key in `.env.local` for higher-accuracy intent routing

---

## Critical Files to Mirror

| NEXUS File | Used By |
|-----------|---------|
| `.nexus/ROUTING.md` | `src/modules/intent-router/routing-table.ts` — mirror every routing entry exactly |
| `.nexus/HANDOFF.md` | `src/modules/nexus-adapter/parser.ts` — section headings and table structures are load-bearing |
| `.nexus/CLAUDE.md` | `src/modules/ai-launcher/claude.ts` — prompt assembly format |
| `.nexus/CODEX.md` | `src/modules/ai-launcher/codex.ts` — spec format |
| `.nexus/GEMINI.md` | `src/modules/ai-launcher/gemini.ts` — brief format |
| `.nexus/outbox/README.md` | `src/modules/nexus-adapter/writer.ts` — filename convention `[YYYY-MM-DD]-[ai]-[room]-[slug].md` |
| `.nexus/rooms/architect/PROMPT.md` | Representative example for prompt assembler |

---

## Verification Plan

1. **Health check**: `/api/nexus/health` returns green for the existing `.nexus` structure
2. **Overview screen**: All sections of HANDOFF.md rendered correctly with correct phase/status
3. **Rooms screen**: All 10 rooms displayed with correct AI assignments
4. **Vault screen**: DECISIONS.md shows ADR-001 with ACCEPTED badge
5. **Intent routing**: Test all 5 example commands → correct room/AI classification
6. **Launch flow**: Generate Claude launch package for "architect" room — verify PROMPT.md + CONTEXT.md are included
7. **Write safety**: Attempt path traversal in API route → expect 400 error
8. **Outbox approve**: Write test file to outbox/specs/, approve via UI → verify rename to APPROVED-* on disk
9. **SSE watcher**: Manually edit a `.nexus` file on disk → verify Work Queue refreshes within 2s
10. **End session**: Click EndSession → confirm modal → verify HANDOFF.md updated atomically

---

## First Implementation Step

**Start with Phase 1, step 1:** Scaffold the Next.js 14 app with the exact folder structure above, configure `NEXUS_ROOT` env var, implement `nexus-adapter/reader.ts` and `parser.ts`, then wire up the Project Overview screen to display live HANDOFF.md data. This proves the integration contract works end-to-end before building any interactive features.
