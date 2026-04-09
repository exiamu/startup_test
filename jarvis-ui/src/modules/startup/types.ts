export type StartupStatus = {
  projectRoot: string;
  projectName: string;
  configuredProjectName: string | null;
  launchCommand: string;
  uiUrl: string;
  envConfigured: boolean;
  dependenciesInstalled: boolean;
  dependencyInstallMode: "auto" | "manual";
  needsInit: boolean;
  readiness: "ready" | "needs_init" | "needs_dependencies";
  likelyProjectMode: "new" | "existing";
  signals: string[];
  nextSteps: string[];
};
