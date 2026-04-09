# Command Validation Matrix

## Purpose
This document defines how `/command` should be judged before Jarvis is treated as a dependable daily operating layer.

The goal is not "the UI looks good."
The goal is:
- routing is explainable
- model choice matches the room contract
- launch packages are useful enough to paste into Claude, Codex, or Gemini
- onboarding and brownfield paths converge into the same believable next move

---

## Validation Principles

1. Recommendations must map cleanly to `.nexus/contracts/ROOM_AI_CONTRACT.md`.
2. Package assembly must use real project state, not generic filler.
3. When prompts are ambiguous, Jarvis should say so through routing reason or next moves instead of pretending certainty.
4. Proposal-first behavior must remain intact until explicit write flows are approved.
5. A strong result is not only the right room. It is the right room, AI, why, and package framing.

---

## Prompt Matrix

| Case ID | Input Shape | Example Prompt | Expected Intent | Expected Room | Expected AI | Notes |
|--------|-------------|----------------|-----------------|---------------|-------------|-------|
| CMD-001 | messy greenfield idea | "I need a SaaS to automate client intake and I only know the pain is all over email and spreadsheets" | `new_idea` | `product` or `architect` | `Claude` | should surface ambiguity and push clarification |
| CMD-002 | frontend implementation | "Build the command center page UI and keep it clean on mobile" | `implementation_task` | `frontend` | `Codex` | should not route to architect by default |
| CMD-003 | backend implementation | "Add an API route that returns the launch package plan" | `implementation_task` | `backend` | `Codex` | should emphasize bounded execution |
| CMD-004 | debugging | "The startup status API is failing and I need the root cause" | `debugging_task` | `backend` | `Codex` | if issue spans systems, architect can appear in next moves |
| CMD-005 | architecture | "We need to decide whether command planning should be server-only or partly client-side" | `architecture_task` | `architect` | `Claude` | should frame tradeoffs |
| CMD-006 | review | "Review this flow for architecture drift and hidden risks" | `review_task` | `architect` | `Claude` | should remain judgment-oriented |
| CMD-007 | docs | "Write the README section for how command routing works" | `documentation_task` | `writer` | `Gemini` | Claude may appear as fallback for accuracy review |
| CMD-008 | brownfield continuation | empty request with `source=brownfield` | `existing_project_learning` | `architect` | `Claude` | should convert repo scan into the next bounded move |
| CMD-009 | security-flavored bug | "Auth token handling looks unsafe. Help me review it." | `debugging_task` or `review_task` | `security` | `Claude` | should not down-route to backend implementation by default |
| CMD-010 | testing | "We need coverage around command routing before we trust it" | `implementation_task` | `qa` | `Codex` | should frame test-first follow-up |
| CMD-011 | ambiguous multitask | "Fix the bug in the user profile API and update the CSS for the profile picture." | `debugging_task` or `implementation_task` | `architect`, `backend`, or `frontend` | `Claude` or `Codex` | multi-room tasks should ideally route to architect or the first mentioned room |
| CMD-012 | vague performance | "The site feels slow on mobile." | `debugging_task`, `architecture_task`, or `next_step` | `architect` or `frontend` | `Claude` or `Codex` | performance issues are often cross-cutting or UI-heavy |
| CMD-013 | marketing/content | "Draft a blog post about our new protocol hardening." | `documentation_task` | `marketing` or `writer` | `Gemini` | should recognize marketing/blog context |
| CMD-014 | devops/infrastructure | "The CI pipeline is failing on the linting step." | `debugging_task` | `devops` | `Codex` | should route to devops for pipeline issues |
| CMD-015 | data/schema | "We need to add a last_login_at field to the users table and sync it with the login API." | `implementation_task` | `data` or `backend` | `Claude` or `Codex` | schema changes should involve the data room |
| CMD-016 | high-level strategy | "What should our MVP scope be for the first customer pilot?" | `new_idea` or `architecture_task` | `product` or `architect` | `Claude` | strategy and scope are high-level tasks |
| CMD-017 | out-of-scope/nonsense | "Explain quantum physics to me." | `documentation_task` or `next_step` | `writer` or `architect` | `Gemini` or `Claude` | non-project tasks should be handled gracefully |
| CMD-018 | cross-cutting constraint | "Everything we build must be GDPR compliant. Check our current auth flow." | `review_task` | `security` or `architect` | `Claude` | compliance and security review |
| CMD-019 | specific code reference | "In jarvis-ui/src/modules/command/engine.ts, the intent classification logic looks too simple. Refactor it." | `implementation_task` or `architecture_task` | `architect` or `backend` | `Claude` or `Codex` | refactoring core logic often involves architect or the relevant domain |
| CMD-020 | rambling/poorly formatted | "ok so... i was thinking... maybe we can add a thing... like a chat box... but not exactly a chat box... you know? like for help. but it should be everywhere." | `new_idea` or `implementation_task` | `product` or `frontend` | `Claude` or `Codex` | should extract intent from messy natural language |

---

## Brownfield Repo Matrix

Use these repo shapes when validating the brownfield path:

| Repo Shape | What Jarvis Must Detect | Expected First Move |
|-----------|--------------------------|---------------------|
| single Next.js app | frontend + possible full-stack surface | `architect` or `frontend` with explicit reason |
| monorepo with apps/packages | workspace boundary and multiple project areas | `architect` first |
| Python service repo | runtime/service boundary, weaker UI assumptions | `architect` or `backend` depending on prompt |
| UI-heavy repo with weak tests | frontend surface plus regression risk | `frontend` recommendation with `qa` in next moves |
| infra-heavy repo | deployment/CI signals | `devops` for execution tasks, `architect` for redesign tasks |

---

## Package Quality Checklist

- package includes room identity
- package includes current room context when available
- package includes real handoff or repo-truth signals
- package tells the target AI what role it is playing
- package preserves proposal-first behavior
- package output instructions match the chosen AI
- package is short enough to be operational but rich enough to be useful

---

## Failure Modes To Watch

- routes to the correct room for the wrong reason
- always prefers architect even for clear bounded implementation
- launch package reads like generic boilerplate
- brownfield path ignores real repo signals
- onboarding path skips unresolved contradictions
- Gemini package looks like a weaker Claude package instead of a real synthesis/doc package
- Codex package widens scope instead of staying bounded

---

## Current Exit Standard

`/command` is ready to become the default Jarvis operating surface when:
- prompt matrix checks pass consistently
- brownfield repo matrix produces credible next moves
- package quality checklist is satisfied for all three AIs
- users can move from start/onboarding/existing into `/command` without losing context
