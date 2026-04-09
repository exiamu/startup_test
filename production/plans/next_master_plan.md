# Next Master Plan — Turning Jarvis Into The Operating Layer

## Status
Historical bridge plan from the startup/onboarding phase into the first `/command` operating loop.

Much of this plan has already been implemented.
Read it for product lineage and intent only, not as the active execution document.

The active roadmap is:
- `production/STATUS.md`
- `production/plans/implementation_plan.md`
- `production/vault/ARCHITECTURE.md`

## Why This Plan Exists

The original founding prompt was not asking for:
- a static UI
- a file browser
- a prompt bucketizer

It was asking for:
- a reusable Jarvis-style operating layer
- coordinated use of Claude, Codex, and Gemini
- room-based specialists with durable context
- a drop-in system that can help turn rough ideas into production work
- a professional workflow that stays aligned over time

The current system now has:
- a portable `.nexus`
- a portable `jarvis-ui`
- startup flow
- blank-project onboarding
- brownfield learning
- stronger proposal-first behavior

The next move is to convert that foundation into an actual operating loop.

---

## Product Direction

Jarvis should evolve from:
- startup screen
- analysis surface
- proposal viewer

Into:
- intake operator
- context synthesizer
- room/AI router
- launch package assembler
- human-gated workflow orchestrator

The goal is not to make Jarvis louder.
The goal is to make Jarvis more useful, more deliberate, and more capable of moving a real project forward.

---

## The Next Big Capability Layer

### 1. Interactive Jarvis Loop

Jarvis needs a live operating loop, not just single-pass analysis pages.

That loop should:
- accept a user request or rough idea
- determine whether the task is onboarding, brownfield learning, or direct execution support
- hold a live working model of the project and current task
- ask the next best question when needed
- recommend the next best room and AI
- assemble the context package needed for that move

This is the moment where Jarvis starts to feel alive.

### 2. AI-Specific Launch Packages

Jarvis must become the reliable handoff layer for:
- Claude
- Codex
- Gemini

That means:
- Claude package for architecture, product decisions, high-level reasoning, review
- Codex package for bounded implementation, debugging, UI work, backend work, test work
- Gemini package for long-context synthesis, research, documentation drafts, ecosystem analysis

The package must include:
- task framing
- room identity
- relevant context
- project state summary
- known constraints
- expected output format

### 3. Proposal-First Workflows

Jarvis must keep operating in proposal mode until explicit write/approval behavior is enabled.

So the next layer should be:
- propose next room
- propose next AI
- propose next execution slice
- propose context pack
- propose spec/research brief

Not:
- silently mutate project truth

### 4. Research-Bound Support

Jarvis should not feel generic.

For project work that benefits from deeper research:
- Gemini should be used for long-context or ecosystem synthesis
- Claude should own strategic interpretation and architectural judgment
- Codex should own bounded implementation execution

The system should make this visible instead of leaving it implicit.

### 5. Real Small-Task Help

Jarvis must not only be useful for giant project setup.

It should also help with:
- UI implementation tasks
- bug triage
- architecture questions
- feature slicing
- code review routing
- documentation requests
- “what should I do next” requests

This is how the system becomes an actual daily operator rather than a startup-only flow.

---

## Next Execution Tracks

## Track A — Jarvis Command Layer

Build the first real command loop in the UI.

### Deliverables
- `/command` as the real main Jarvis operating surface
- intent intake for:
  - new idea
  - existing project understanding
  - implementation task
  - debugging task
  - documentation task
  - review task
- room + AI recommendation preview
- “why Jarvis is routing this way” explanation

### Definition Of Done
- user can type a real request and Jarvis recommends what should happen next
- the recommendation is grounded in room ownership and current project state

---

## Track B — Launch Package Assembly

Build model-specific launch packages for Claude, Codex, and Gemini.

### Deliverables
- deterministic package assembly for each AI
- room-aware context selection
- task-aware brief/spec assembly
- copy-ready launch output for the human to use

### Definition Of Done
- Jarvis can prepare a usable next-session package for each model
- packages are readable, bounded, and aligned with the room contract

---

## Track C — Better Onboarding Continuation

Blank-project onboarding needs to stop at “next interaction,” not “analysis page.”

### Deliverables
- question-answer rounds inside the UI
- rolling updates to Jarvis beliefs and first execution slice
- transition from onboarding into room-launch recommendation

### Definition Of Done
- user can continue through multiple rounds instead of stopping after analysis
- Jarvis can exit onboarding with a concrete next room/AI move

---

## Track D — Better Brownfield Continuation

Brownfield intake needs to transition into action.

### Deliverables
- stronger room context pack generation
- room-launch recommendations that can be turned into real packages
- better heuristics for different repo shapes

### Definition Of Done
- Jarvis can move from repo scan to a credible first architect/frontend/backend/qa move

---

## Track E — Testing And Validation

The system must be pressure-tested, not just implemented.

### Deliverables
- messy onboarding prompt set
- brownfield repo validation set
- launcher/install validation in normal environments
- room/AI routing test matrix

### Definition Of Done
- recommendations are judged against real prompts and real repos, not only developer intuition

---

## How Claude, Codex, And Gemini Should Be Used

### Claude
Use for:
- architecture decisions
- product decisions
- high-stakes review
- contradiction resolution
- route validation when multiple rooms could apply

### Codex
Use for:
- bounded implementation
- frontend work
- backend work
- tests
- bug fixes
- tactical code review and execution support

### Gemini
Use for:
- long-context synthesis
- research passes
- ecosystem comparisons
- documentation drafting
- ingesting large project context and summarizing it for the next move

### Jarvis Rule
Jarvis should not hide these roles.
Jarvis should make the recommendation visible and explain why the recommendation fits the task.

---

## Current Highest-Value Next Sequence

1. Build the first real `/command` operating surface
2. Build AI-specific launch package assembly behind it
3. Connect onboarding and brownfield flows into that launch system
4. Validate the routing and packages against real prompts and real repos
5. Only then move into richer write/approval flows

---

## Non-Negotiables For The Next Phase

- keep `.nexus` portable
- keep `jarvis-ui` subordinate to filesystem truth
- keep recommendations explicit and explainable
- keep project-specific truth draft-first until approved
- keep the system useful for small tasks as well as big project shaping
- keep the three-model workflow visible, intentional, and documented

---

## The Real Standard

Jarvis should increasingly feel like:
- a chief of staff
- a systems architect
- a routing operator
- a session-to-session continuity layer

Not:
- a pretty shell over markdown
- a one-shot analyzer
- a generic chatbot with project files attached
