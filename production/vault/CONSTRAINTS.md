# CONSTRAINTS.md — Project Hard Constraints
<!-- These are NON-NEGOTIABLE limits. No AI may override them. -->
<!-- Surface conflicts with these constraints to the human immediately. -->
<!-- Status: [DRAFT / LOCKED] -->

## Status: DRAFT — substantive working draft as of 2026-04-07

---

## Budget
- Infrastructure: keep development-stage spend lean; prefer local-first and low-cost hosted services until product value is proven
- Third-party services: no recurring paid tooling or API dependency is assumed by default
- No paid service, hosted dependency, or vendor lock-in commitment without human approval

## Technology Stack
### Allowed
- Filesystem-native source-of-truth for NEXUS state
- Plain markdown and shell for portable protocol components
- TypeScript and modern React/Next.js for `jarvis-ui`
- Node.js tooling where it materially improves delivery speed and maintainability
- Minimal supporting libraries when they reduce complexity without weakening portability

### Prohibited
- Hidden state outside `.nexus` for protocol truth
- Architecture that makes `jarvis-ui` the canonical source of project state
- Unreviewed vendor lock-in for core orchestration behavior
- Secret storage in repo files, prompts, generated docs, or test fixtures

### Decisions Required Before Use
- Any new external service or library requires architect room approval
- Any database change requires an ADR entry
- Any durable storage beyond `.nexus` for protocol state requires explicit human approval

## Timeline
- MVP deadline: TBD
- Beta deadline: TBD
- Production deadline: TBD
- Delivery should move in phases with visible milestones rather than broad unfinished expansion

## Scope Boundaries
### In Scope
- Portable `.nexus` protocol for cross-AI execution
- `jarvis-ui` as the mission-control interface over `.nexus`
- Room-based workflows for planning, implementation, review, docs, and operations
- New-project and existing-project onboarding
- Safety, auditability, and upgrade paths for the system itself

### Out of Scope (Do Not Build)
- A fully autonomous system that bypasses human approval on major decisions
- A generic “AI everything” platform without strong workflow discipline
- Multi-tenant SaaS complexity before the local/project-embedded workflow is proven

## Security Requirements (Non-Negotiable)
- No secrets in code or version control
- Vault decision records are immutable except by append-only supersession
- All write paths in `jarvis-ui` must be guarded, validated, and auditable
- Security review is required before any production deployment path is considered complete
- Dependency/security scans must reflect real enforcement, not placeholder theater

## Compliance
- No specific regulatory framework is assumed at this stage
- If this system is later used in regulated environments, compliance requirements must be documented before implementation proceeds

## Team / Access
- Exiamu is the project owner and final approver
- Major architecture changes require human approval
- Spending approval remains human-gated

---
<!-- Lock by changing Status to LOCKED and adding the lock date. -->
<!-- After locking, add ADR to production/vault/DECISIONS.md -->
