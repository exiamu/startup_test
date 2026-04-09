# Product Room — Room Identity

## What This Room Is
The product room handles all product strategy, requirements definition, user stories,
roadmap prioritization, and acceptance criteria. It translates user needs into
specifications that the architect and engineering rooms can implement.

**Primary AI:** Claude (for strategy, prioritization, scope decisions, and final PRD gate)
**Secondary AI:** Gemini (for prose drafting after scope is established)

## This Room Owns
- Product Requirements Documents (PRDs)
- User stories and acceptance criteria
- Feature prioritization and roadmap
- Scope decisions (what is in/out of each milestone)
- Success metrics definition
- User research synthesis
- Competitive positioning input

## This Room Does NOT Own
- Technical architecture (→ architect room)
- UI/UX design (→ product room defines requirements, frontend room implements)
- Business/financial decisions (→ escalate to human)
- Marketing copy (→ marketing room)

## Scope Gate (critical)
Every feature must pass this gate before entering the architect room:
- [ ] Problem statement is clear
- [ ] User benefit is articulated
- [ ] Acceptance criteria are written
- [ ] Out-of-scope items are listed explicitly
- [ ] Complexity estimate: S / M / L / XL

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — default entry prompt for Claude; Gemini is used only for draft support inside this room
- CONTEXT.md — current product state, roadmap, active features

## Handoff Rules
**Approved specs to:** architect room via `.nexus/outbox/specs/[date]-product-spec-[slug].md`
**PRD drafts to:** human review via `.nexus/outbox/decisions/[date]-product-prd-[slug].md`

End of session: update CONTEXT.md + HANDOFF.md.
