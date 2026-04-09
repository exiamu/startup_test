# Codex Report: drop-in-empty-project-test

Files changed:
- `production/outbox/reports/2026-04-09-codex-drop-in-empty-project-test.md`

Exact test setup:
- Created a minimal adopting repo at `/tmp/jarvis-dropin-test`
- Copied only:
  - `.nexus/`
  - `jarvis-ui/`
- Ran all test commands from that copied repo, not from the build repo

What passed:
- `bash .nexus/scripts/init.sh` reset the adopting-project identity and completed successfully
- `bash .nexus/scripts/health-check.sh` passed with only the expected draft warnings in `.nexus/vault/*`
- `cd jarvis-ui && npm run build` passed in the copied repo
- Runtime directories and provider scripts existed in the copied repo:
  - `.nexus/execution/`
  - `.nexus/sessions/`
  - `.nexus/scripts/providers/`

What failed:
- `bash .nexus/scripts/start-jarvis.sh` reached the final `next dev` startup step, then failed to bind `0.0.0.0:3000` with `EPERM`

Why it failed:
- This environment blocks local port binding inside the sandbox. The failure happened after Jarvis completed launcher checks and invoked Next.js.
- This is an environment restriction here, not evidence of a Jarvis bootstrap failure.

What I changed:
- No code changes were required from the drop-in test itself.

What still blocks a believable user test:
- A real manual runtime test still needs to be performed on a normal local machine where `next dev` can bind a port.
- Because of the sandbox port restriction, I could not click through `/command` in the copied repo from this environment.
- I also could not confirm a live execution record write through the browser-driven path for the same reason.

Exact verification commands and results:
- `cd /tmp/jarvis-dropin-test && bash .nexus/scripts/init.sh` — pass
- `cd /tmp/jarvis-dropin-test && bash .nexus/scripts/health-check.sh` — pass with 3 draft warnings
- `cd /tmp/jarvis-dropin-test/jarvis-ui && npm run build` — pass
- `cd /tmp/jarvis-dropin-test && bash .nexus/scripts/start-jarvis.sh` — failed at `next dev` with `listen EPERM: operation not permitted 0.0.0.0:3000`

Assessment:
- Jarvis + NEXUS are at a real manual-test threshold now.
- The portable drop-in path works through copy, init, health-check, and build in a clean repo.
- The remaining validation must happen outside this sandbox so the UI can actually be opened and exercised.
