# Codex Task: frontend-command-execution-slice-03
Room: frontend / devops
Files:
- jarvis-ui/src/app/command/command-client.tsx
- .nexus/scripts/init.sh
- .nexus/scripts/health-check.sh

## Task
Wire the `/command` UI to the backend async execution runtime and update the bootstrap scripts to ensure the new runtime directories and provider scripts are correctly initialized and verified.

### 1. Command Client Wiring (command-client.tsx)
-   Add `handleExecute(launchPackage: LaunchPackage)`:
    -   Calls `POST /api/command/execute` with `{ provider: launchPackage.ai, room: launchPackage.room, intent: plan.classification.intent, prompt: launchPackage.prompt }`.
    -   Stores the returned `executionId` in state.
-   Add polling logic:
    -   When `executionId` is set, poll `GET /api/command/execute/[id]` every 1-2 seconds.
    -   Update state with the returned `ExecutionRecord`.
    -   Stop polling when `status` is one of: `completed`, `failed`, `blocked`.
-   UI Updates:
    -   In `LaunchPackageCard`, add an "Execute" button (visible if `launchPackage.fit === 'primary'`).
    -   Below the button, show current status (planned, running, etc.) if this package is being executed.
    -   When `status === 'completed'`, show a link to the output file: `/artifacts/${executionRecord.outputPath}?view=file`.
    -   If `status === 'failed'`, show the `errorMessage`.

### 2. DevOps Updates
-   **init.sh**: Add `execution` to the directory creation list to ensure the directory exists in new project installs.
-   **health-check.sh**:
    -   Add a check that `execution/` directory exists.
    -   Add checks for each provider adapter script: `scripts/providers/invoke-*.sh`.
    -   Check if `providers.json` exists in the `.nexus` root.

## Acceptance Criteria
-   Clicking "Execute" in `/command` triggers the background execution and updates the UI status in real-time.
-   Completion shows a clickable link that opens the artifact viewer for the output.
-   `bash .nexus/scripts/init.sh` creates the `execution/` directory.
-   `bash .nexus/scripts/health-check.sh` passes if provider scripts are present and executable.

## Patterns to Follow
-   Use `useEffect` for polling with a clean cleanup.
-   Use `NextResponse` types consistently in API interactions.
-   Follow existing UI styles (panels, buttons, colors).
-   Use standard bash health-check patterns (ok, fail, warn).

## Verification
cd jarvis-ui && npm run build && npm run typecheck
bash .nexus/scripts/health-check.sh
manual verify: execute from /command and check status polling
