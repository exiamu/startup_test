# Codex Task: devops-maintenance-fixes
Room: devops / backend
Files:
- jarvis-ui/src/modules/project-discovery/reader.ts
- jarvis-ui/package.json
- .nexus/scripts/init.sh
- .gitignore

## Task
Perform the Day 1 maintenance and portability fixes required to stabilize the repository before the runtime build begins.

1. **Remove Hardcoding:** In `reader.ts`, remove all references to `walkers_beast_app`.
2. **Fix Lint Script:** In `jarvis-ui/package.json`, change `"lint": "next lint"` to `"lint": "tsc --noEmit"`.
3. **Update Gitignore:** Add `.nexus/execution/` and `.nexus/sessions/` to `.gitignore`.
4. **Portability Fix (sed):** Update `init.sh` to handle `sed -i` differences between macOS and Linux.

## Reference
See Gemini Audit: `production/outbox/reports/2026-04-09-gemini-prebuild-audit.md`

## Verification
- `cd jarvis-ui && npm run lint` (Exit 0)
- `bash .nexus/scripts/health-check.sh` (Exit 0)
