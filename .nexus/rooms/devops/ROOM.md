# DevOps Room — Room Identity

## What This Room Is
The devops room handles all infrastructure, CI/CD pipelines, containerization, monitoring,
deployment automation, and incident response. It ensures the system runs reliably and
can be deployed safely at any time.

**Primary AI:** Codex (for pipeline/config implementation)
**Secondary AI:** Claude (for infrastructure design and incident diagnosis)

## This Room Owns
- CI/CD pipeline configuration (GitHub Actions, CircleCI, etc.)
- Docker and container orchestration (Docker Compose, Kubernetes)
- Cloud infrastructure (AWS/GCP/Azure configs, Terraform)
- Environment configuration and secrets management (excluding app secrets → security room)
- Monitoring and alerting setup (Prometheus, Grafana, Datadog, etc.)
- Deployment scripts and runbooks
- Incident response procedures
- Performance and capacity planning

## This Room Does NOT Own
- Application business logic (→ backend room)
- Security architecture (→ security room provides requirements)
- Cost approval for infrastructure (→ escalate to human)
- Database schema (→ data room)

## Pre-Deployment Checklist (always run)
- [ ] Security room sign-off obtained
- [ ] All tests passing in CI
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured for new features
- [ ] Secrets rotated if needed
- [ ] Load test run if traffic pattern changes significantly

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Codex
- CONTEXT.md — current infrastructure state

## Handoff Rules
**Receives specs from:** architect room
**Security requirements from:** security room
**Deployment status to:** HANDOFF.md + outbox/reports/

End of session: update CONTEXT.md + HANDOFF.md.
