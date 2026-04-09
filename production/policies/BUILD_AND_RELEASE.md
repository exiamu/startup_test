# Build And Release Policy

## Rule
Builds are not optional. If a runnable target exists, it should be built for testing whenever practical.

## How We Handle It
- Local build first when the environment supports it and dependencies are available.
- CI build in GitHub Actions when local build is not practical, when repeatability matters, or when artifacts need to be shared.
- Release artifacts should be attached by workflow when a project has a real distributable target.

## Current Project Reality
This repository currently contains:
- `.nexus`, which is a portable filesystem protocol
- `jarvis-ui`, which is currently a web application scaffold

That means:
- there is no Windows `.exe` target yet
- the correct first runnable output is a built web app artifact
- an `.exe` only makes sense if we later add a desktop wrapper such as Electron or Tauri

## Working Agreement
- Codex should build and verify runnable targets whenever the environment allows it.
- If local dependencies are missing or the environment is unsuitable, GitHub Actions should perform the build and publish artifacts.
- If a future part of this system becomes a desktop app, create a proper packaging pipeline and emit `.exe` artifacts for Windows releases.

## Distribution Rules
- Web app: produce build artifacts and deployment-ready output, not a fake `.exe`
- Desktop app: produce platform-native installers or binaries
- Script/tooling target: provide the exact command to run plus packaged release artifacts when useful

## Immediate Standard For `jarvis-ui`
- install dependencies
- run typecheck
- run production build
- upload build artifact in CI

## Future Standard For Windows `.exe`
Only after a desktop target exists:
- package for Windows in CI
- attach `.exe` or installer artifact to the workflow/release
- document where to download it and how to run it
