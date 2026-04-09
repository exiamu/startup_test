# Gemini Task: architect-plan-review
Room: architect
Document: production/plans/runtime_build_plan.md (review and refine — do not replace)
Audience: Claude (architect), Codex (implementer), project owner Exiamu
Type: Plan review and gap analysis, not prose documentation

---

## Context

You are reviewing a 7-day implementation plan for the Jarvis + NEXUS system. This is a real working project. The system is a portable AI operating layer (`.nexus/`) plus a Next.js control surface (`jarvis-ui/`) that currently routes tasks but cannot yet execute them.

The plan is at: `production/plans/runtime_build_plan.md`

Read the full plan document. Then read these supporting files for context:
- `production/vault/FOUNDING_PROMPT.md` — the immutable original vision (Jarvis to Iron Man)
- `production/vault/VISION.md` — current vision statement
- `production/vault/CONSTRAINTS.md` — hard constraints
- `production/STATUS.md` — current working state
- `.nexus/contracts/ROOM_AI_CONTRACT.md` — canonical AI routing contract
- `jarvis-ui/src/modules/command/engine.ts` — current routing engine (large file, skim for structure)
- `jarvis-ui/src/modules/nexus-adapter/reader.ts` — current read adapter (understand the pattern writer.ts must follow)

---

## Your Job

Produce a refined version of the plan in `production/plans/runtime_build_plan.md`. Do not replace the file — append a new section `## Gemini Review and Refinements` at the end with your findings.

---

## What to Check For and Refine

**1. Alignment with founding prompt**
- Does the 7-day plan move toward the actual "Jarvis to Iron Man" vision from `FOUNDING_PROMPT.md`?
- Is anything in the plan diverging from the core goal of a portable, room-based, multi-AI operator?
- Are there missing capabilities that the founding prompt clearly requires but the plan does not address?

**2. Portability integrity**
- Does anything in the plan risk leaking this repo's specific truth into `.nexus/` or `jarvis-ui/`?
- The providers.json schema is portable — flag if any part of it looks repo-specific
- The invoke scripts are portable — flag if any hardcoded paths or names are repo-specific
- The session/execution state schema — confirm it is generic enough for any project

**3. Dependency order sanity**
- Are there any phase dependencies the plan got wrong? (e.g., something in Phase 4 that requires Phase 5 to exist first)
- Is the Day-by-Day schedule realistic for one developer using three AI tools?
- Flag any phases where the scope is too wide for Codex's ≤3-file constraint

**4. Missing pieces**
- Does the plan address how `health-check.sh` gets updated to verify the new `execution/`, `sessions/`, and `scripts/providers/` directories exist?
- Does the plan address how `init.sh` bootstraps these new directories in a fresh install?
- Does the plan address how `start-jarvis.sh` handles missing provider scripts on first run?
- Does the plan address `.gitignore` updates needed for `execution/` and `sessions/` (these should probably be gitignored in adopting projects)?
- Is there a clear path for a user to configure their own CLI tools (claude, codex, gemini) without editing source code?

**5. Risk areas**
- The subprocess spawn pattern in Node.js is the most complex new piece — does the plan have enough guard rails (timeout, size cap, stdin-only injection protection)?
- The session state model — is `.nexus/sessions/` a sensible location or will it conflict with portability in some scenarios?
- The execute route writes to `.nexus/execution/` synchronously during the HTTP request — is this a concern for large or slow provider responses?

**6. What Gemini can own beyond documentation**
- The plan currently assigns Gemini only documentation tasks. Given your 1M context window, are there analysis tasks that would be better owned by you — for example, a full codebase review pass before Codex begins implementation, to surface any patterns or existing utilities Codex should reuse?
- If so, propose a specific Gemini task that should run before Day 1 implementation begins.

---

## Output Format

Append to `production/plans/runtime_build_plan.md` a section with this structure:

```markdown
## Gemini Review and Refinements
<!-- Reviewed: 2026-04-09 -->

### Alignment Assessment
[Your assessment — are we on track toward the founding vision? What is missing?]

### Portability Flags
[Anything that risks breaking portability of .nexus or jarvis-ui]

### Dependency or Scope Issues
[Any ordering problems or phases that are too wide for Codex ≤3-file constraint]

### Missing Pieces
[Specific gaps the plan does not address, with suggested additions]

### Risk Areas
[Specific technical risks and recommended mitigations]

### Proposed Gemini Pre-Build Task
[Optional: if a full codebase analysis pass would help, describe it here with scope and expected output]

### Refined Day-by-Day Schedule
[Only include this section if the schedule needs significant changes. Use a table matching the plan format.]

### Summary Verdict
[One paragraph: is this plan ready to execute, or does it need one more pass? What is the single highest-priority refinement?]
```

---

## Tone
Technical and direct. Treat this as a peer architect review, not a praise document. Call out real gaps. Do not add marketing language or filler sections. If something is fine, say it is fine and move on. Prioritize actionable findings over comprehensive coverage.

## Constraints
- Do not hallucinate API names, file paths, or function signatures that do not exist in the codebase
- Do not contradict locked ADRs in `production/vault/DECISIONS.md`
- Do not propose changing the tech stack (Next.js + TypeScript + markdown protocol is locked)
- If you are uncertain about a specific detail in the codebase, say so rather than inventing an answer
