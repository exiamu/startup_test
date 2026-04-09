# Portable Boot Flow

## Goal
Make the reusable Jarvis install feel like one obvious local startup path after `.nexus` and `jarvis-ui` are copied into a target project.

## Portable Payload
Copy only:
- `.nexus/`
- `jarvis-ui/`

Do not copy:
- `production/`

## GitHub Install Path

If the source of truth is this GitHub repo, adopting projects should use sparse checkout instead of cloning the full repository.

That keeps the target project limited to the portable payload:
- `.nexus/`
- `jarvis-ui/`

Example:

```bash
git init
git remote add origin git@github.com:exiamu/startup_test.git
git sparse-checkout init --cone
git sparse-checkout set .nexus jarvis-ui
git pull origin main
```

Full-repo clone is only for developing Jarvis itself.

## Local Startup Command

From the target project root:

```bash
bash .nexus/scripts/start-jarvis.sh
```

What the launcher does:
- verifies `.nexus` and `jarvis-ui` exist
- verifies `node` and `npm` are available
- creates `jarvis-ui/.env.local` with `NEXUS_ROOT=../.nexus` if needed
- aligns local NEXUS identity with the project root by running `init.sh` when needed
- installs `jarvis-ui` dependencies automatically when `node_modules` is missing and a lockfile is present
- runs the NEXUS health check
- starts `jarvis-ui` on local port `3000` by default

Optional mode:

```bash
JARVIS_INSTALL_MODE=skip bash .nexus/scripts/start-jarvis.sh
```

Use this when you want the launcher to stop and instruct you instead of attempting dependency install.

## First-Run UX

After startup:
1. open `http://localhost:3000`
2. review the startup status block
3. press `Start`
4. choose `New` for a blank project or `Existing` for a brownfield repo

## Expected Behavior

### Blank project
- Jarvis enters onboarding mode
- the commander gives a messy prompt
- Jarvis generates drafts and questions, not automatic writes

### Existing project
- Jarvis performs a read-only learning pass
- it proposes an understanding of the project before any write flow exists

## Current Limits
- automatic dependency install may still fail if the environment cannot reach the package registry
- onboarding and brownfield learning heuristics still need more real-world validation
- build still emits a Turbopack tracing warning from filesystem-heavy discovery imports

## Next Hardening Targets
- improve first-run status so it can distinguish "needs init" from "ready to onboard" more precisely
- tighten the project-discovery import boundary to reduce the build warning
