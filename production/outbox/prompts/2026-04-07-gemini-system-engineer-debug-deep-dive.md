# Gemini Task: Jarvis System Engineer Debug Deep Dive
Status: historical prompt artifact from 2026-04-07. Keep for lineage only; not the active next-session directive.
Date: 2026-04-07
Audience: Gemini
Room: architect + writer support, with system-wide debugging mandate
Status: DRAFT HANDOFF PROMPT

## Mission
Perform a deep whole-system review of the current NEXUS + Jarvis UI state as a senior system engineer, debugger, and research-backed technical reviewer.

Your job is not to summarize vaguely.
Your job is to:
- inspect what exists now
- find real issues, weak assumptions, architectural gaps, usability failures, and debugging targets
- research where helpful
- propose concrete fixes
- fully execute the fixes you can justify if you are operating in an environment where you can edit and verify

Treat this as a serious systems pass, not a light code review.

---

## Your Role

Act like a top-tier system engineer who can:
- debug architectural and product-flow issues
- inspect professional workflow gaps
- reason about multi-AI orchestration quality
- evaluate whether Jarvis is actually becoming operational
- research standards and comparable patterns where needed
- propose precise fixes instead of broad advice

You are not here to add hype.
You are here to make the system stronger, sharper, and more dependable.

---

## Read These First

Read in this order:

1. `.nexus/HANDOFF.md`
2. `.nexus/NEXUS.md`
3. `.nexus/contracts/ROOM_AI_CONTRACT.md`
4. `production/README.md`
5. `production/vault/FOUNDING_PROMPT.md`
6. `production/vault/VISION.md`
7. `production/vault/CONSTRAINTS.md`
8. `production/vault/ARCHITECTURE.md`
9. `production/STATUS.md`
10. `production/plans/implementation_plan.md`
11. `production/plans/next_master_plan.md`
12. `production/plans/command_validation_matrix.md`
13. `.nexus/rooms/architect/CONTEXT.md`
14. `.nexus/rooms/frontend/CONTEXT.md`
15. `.nexus/rooms/backend/CONTEXT.md`
16. `.nexus/rooms/qa/CONTEXT.md`
17. `.nexus/rooms/writer/CONTEXT.md`

Then inspect these implementation areas:

- `jarvis-ui/src/app/start/`
- `jarvis-ui/src/app/onboarding/`
- `jarvis-ui/src/app/command/`
- `jarvis-ui/src/app/api/`
- `jarvis-ui/src/modules/command/`
- `jarvis-ui/src/modules/onboarding/`
- `jarvis-ui/src/modules/project-discovery/`
- `jarvis-ui/src/modules/nexus-adapter/`
- `.nexus/scripts/`

---

## Current Truth You Must Respect

- `.nexus` is portable and should stay generic
- `production/` holds repo-specific Jarvis build truth
- startup flow works
- onboarding exists and is adaptive
- brownfield learning exists and is deeper than a top-level scan
- `/command` now exists as the first real operating surface
- outputs are still proposal-first; do not introduce write flows unless explicitly approved
- room/AI routing must stay explicit and explainable

---

## What You Are Auditing

Audit the system across these dimensions:

1. Product reality
   - does Jarvis actually behave like an operating layer yet
   - where does it still feel like disconnected pages instead of one assistant

2. Routing quality
   - does `/command` classify tasks credibly
   - does it pick the correct room and AI for the right reason
   - are Claude, Codex, and Gemini being used distinctly and professionally

3. Launch package quality
   - are packages copy-ready
   - are they grounded in real project context
   - are they operational or still too generic

4. Debugging and failure handling
   - where will the system misroute
   - where will it confuse the commander
   - where is logic brittle, too heuristic, or too shallow

5. Architecture and portability
   - does `jarvis-ui` remain subordinate to `.nexus`
   - is any repo-specific truth leaking into the portable layer
   - are there filesystem or tracing issues that need cleanup

6. Daily usability
   - could a builder actually use this repeatedly to move ideas forward
   - what blocks it from feeling like “Jarvis” in practice

7. Documentation integrity
   - do docs match the current code and behavior
   - are any docs overstating what the system can do today

---

## Research Expectations

If you find an area where stronger professional standards or patterns matter, research it.

Good examples:
- prompt/routing evaluation patterns
- local-first orchestration design
- workflow system UX patterns
- debugging/reporting standards
- deterministic classifier fallbacks
- context-pack design

Do not research aimlessly.
Use research only where it materially improves a fix, recommendation, or design correction.

---

## What To Produce

Produce a report with these sections:

1. Executive judgment
   - how close the system is to being truly usable
   - what the biggest blockers are

2. Findings
   - list concrete issues
   - prioritize by severity
   - include file references where possible

3. What is already strong
   - identify what should be preserved

4. Recommended fixes
   - split into immediate, near-term, and later

5. Research-backed notes
   - only where research materially changed your recommendation

6. If you made fixes
   - exactly what you changed
   - what remains unresolved

---

## Output Standard

- be direct
- be technical
- prefer findings over summaries
- do not invent capabilities that are not present
- call out contradictions between intention and behavior
- distinguish clearly between:
  - confirmed current behavior
  - inferred weakness
  - research-backed recommendation

If you perform code or doc fixes in your environment, keep them bounded and explain why each change materially improves the system.

---

## Output Location

Write your report to:

`production/outbox/reports/2026-04-07-gemini-system-engineer-debug-deep-dive.md`

If you also generate actionable follow-up prompts, place them in:

`production/outbox/prompts/`

---

## Most Important Lens

Judge everything against the founding intent:

This system should become a reusable Jarvis-style operating layer that helps the commander move ideas into production with coordinated specialists, durable context, explicit routing, professional quality, and minimal wasted motion.

If something weakens that, call it out.
If something strengthens that, preserve it.
