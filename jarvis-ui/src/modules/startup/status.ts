import nodePath from "node:path";
const pathJoin = (...args: string[]) => nodePath.join(...args);
const pathBasename = (p: string) => nodePath.basename(p);
const pathDirname = (p: string) => nodePath.dirname(p);
import { promises as nodeFs } from "node:fs";
const fsReadFile = (target: string, encoding: BufferEncoding) =>
  nodeFs.readFile(target, encoding);
const fsAccess = (target: string) => nodeFs.access(target);

import { resolveNexusRoot } from "@/lib/nexus-path";
import { scanProjectRoot } from "@/modules/project-discovery/reader";
import type { StartupStatus } from "@/modules/startup/types";

async function exists(target: string): Promise<boolean> {
  try {
    await fsAccess(target);
    return true;
  } catch {
    return false;
  }
}

async function readConfiguredProjectName(nexusRoot: string): Promise<string | null> {
  try {
    const text = await fsReadFile(pathJoin(nexusRoot, "NEXUS.md"), "utf8");
    const match = text.match(/^- \*\*Name:\*\* (.+)$/m);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function readStartupStatus(): Promise<StartupStatus> {
  const nexusRoot = resolveNexusRoot();
  const projectRoot = pathDirname(nexusRoot);
  const projectName = pathBasename(projectRoot);
  const configuredProjectName = await readConfiguredProjectName(nexusRoot);
  const envConfigured = await exists(pathJoin(projectRoot, "jarvis-ui", ".env.local"));
  const dependenciesInstalled = await exists(pathJoin(projectRoot, "jarvis-ui", "node_modules"));
  const dependencyInstallMode = await exists(pathJoin(projectRoot, "jarvis-ui", "package-lock.json"))
    ? "auto"
    : "manual";
  const scan = await scanProjectRoot();
  const likelyProjectMode =
    scan.topLevelDirectories.length === 1 && scan.topLevelDirectories[0] === "jarvis-ui"
      ? "new"
      : scan.likelyProjectType.includes("Blank or minimal project")
        ? "new"
        : "existing";
  const needsInit = configuredProjectName !== projectName;
  const readiness = needsInit
    ? "needs_init"
    : dependenciesInstalled
      ? "ready"
      : "needs_dependencies";

  const signals = [
    `Portable launcher: bash .nexus/scripts/start-jarvis.sh`,
    `Configured project identity: ${configuredProjectName ?? "missing"}`,
    `Detected project root: ${projectName}`,
    envConfigured ? "jarvis-ui/.env.local is configured" : "jarvis-ui/.env.local is missing",
    dependenciesInstalled
      ? "jarvis-ui dependencies are installed"
      : "jarvis-ui dependencies are not installed yet",
    dependencyInstallMode === "auto"
      ? "Launcher can attempt automatic dependency install"
      : "Dependency install will require a manual npm install step",
    `Recommended startup mode: ${likelyProjectMode}`
  ];

  const nextSteps = needsInit
    ? [
        "Run the portable launcher or `bash .nexus/scripts/init.sh` to align the local project identity.",
        "Open Jarvis on localhost:3000 after init completes.",
        `Start with ${likelyProjectMode === "new" ? "New" : "Existing"} once the UI is live.`
      ]
    : !dependenciesInstalled
      ? [
          dependencyInstallMode === "auto"
            ? "Run the portable launcher and let it attempt the first dependency install automatically."
            : "Install jarvis-ui dependencies manually, then rerun the launcher.",
          dependencyInstallMode === "auto"
            ? "If automatic install fails, run `cd jarvis-ui && npm ci` manually and retry."
            : "Run `cd jarvis-ui && npm install`, then return to the launcher.",
          `After startup, enter ${likelyProjectMode === "new" ? "New" : "Existing"} mode from localhost:3000.`
        ]
    : [
        "Run the portable launcher and open Jarvis on localhost:3000.",
        "Use Start to enter New or Existing mode.",
        "Treat onboarding and discovery outputs as proposals until human approval."
      ];

  return {
    projectRoot,
    projectName,
    configuredProjectName,
    launchCommand: "bash .nexus/scripts/start-jarvis.sh",
    uiUrl: "http://localhost:3000",
    envConfigured,
    dependenciesInstalled,
    dependencyInstallMode,
    needsInit,
    readiness,
    likelyProjectMode,
    signals,
    nextSteps
  };
}
