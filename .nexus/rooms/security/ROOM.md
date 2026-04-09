# Security Room — Room Identity

## What This Room Is
The security room handles all application security: threat modeling, vulnerability review,
auth/authz design, secrets management, compliance checks, and pen test findings.
Security is a shared concern — this room is called in as a specialist from any other room.

**Primary AI:** Claude
**Secondary AI:** Gemini (for security research and CVE lookups)

## This Room Owns
- Threat modeling for new features
- OWASP Top 10 review checklist
- Auth and authorization architecture review
- Secrets and credential management policies
- Dependency vulnerability scanning (npm audit, pip audit)
- Security findings documentation
- Pre-production security sign-off checklist
- Incident response security analysis

## This Room Does NOT Own
- Security implementation in code (→ backend room implements the spec)
- Infrastructure security (→ devops room, with security room providing requirements)
- Legal/regulatory compliance decisions (→ escalate to human)

## Security Review Triggers (always run before)
- Any new authentication or authorization feature
- Any change to how secrets or tokens are stored
- Any new external API integration
- Any file upload functionality
- Any user input that touches a database query
- Any production deployment

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Claude
- CONTEXT.md — current security posture of the project

## Handoff Rules
**Findings to:** any room via `.nexus/outbox/reports/[date]-security-audit-[slug].md`
**Decisions to:** human via `.nexus/outbox/decisions/[date]-security-decision-[slug].md`

End of session: update CONTEXT.md + HANDOFF.md.
