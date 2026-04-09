# devops Room — Project Context
<!-- Updated every session. Target: ≤500 tokens. Archive old state. -->
<!-- Last Updated: 2026-04-08 by Codex -->

## Current State
Phase: Protocol Hardening
Last Action: The local-first launcher, startup readiness API, dependency-install branch, and build verification path are all in place; the earlier Turbopack tracing warning is not currently reproducing
Next Action: Validate the dependency auto-install path and broader local runtime behavior in a normal environment outside sandbox restrictions

## Key Files For This Role
| File | Purpose | Last Changed |
|------|---------|--------------|
| .nexus/scripts/start-jarvis.sh | one-command local launcher | 2026-04-07 |
| .nexus/scripts/health-check.sh | portable readiness validation | 2026-04-07 |
| jarvis-ui/src/modules/startup/status.ts | local readiness model surfaced in the UI | 2026-04-08 |
| jarvis-ui/next.config.ts | build/runtime config for the companion app | 2026-04-07 |
| .nexus/github/workflows/jarvis-ui-ci.yml | CI coverage for build/typecheck | 2026-04-07 |

## Decisions Made In This Room
| ID | Decision | Date | Locked? |
|----|---------|------|---------|
| DO-001 | Jarvis remains local-first during build-out rather than prematurely targeting hosted deployment | 2026-04-07 | Yes |
| DO-002 | Typecheck and production build are required verification steps before closing meaningful implementation passes | 2026-04-08 | Yes |

## Known Issues / Blockers
- localhost binding and normal-network install behavior still cannot be fully proven in this sandbox
- the path-scoped tracing fix is stable in current builds, but should still be watched across more repo shapes and environments
- hosted/serverless deployment is not the target yet; filesystem-backed behavior assumes local project access

## What NOT To Touch (Owned By Other Rooms)
- routing logic and room ownership belong to architect/product
- UI presentation and interaction design belong to frontend
- See .nexus/ROUTING.md for room boundaries
