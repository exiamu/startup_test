import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type {
  ProviderConfig,
  ProvidersManifest,
  ProviderRuntimeStatus
} from "@/modules/providers/types";

export async function readProvidersManifest(): Promise<ProvidersManifest> {
  const manifestPath = resolveInsideNexus("providers.json");
  const raw = await fs.readFile(manifestPath, "utf8");

  return JSON.parse(raw) as ProvidersManifest;
}

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("bash", ["-lc", `command -v ${command}`], {
      stdio: "ignore"
    });

    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

export async function readProviderStatuses(): Promise<ProviderRuntimeStatus[]> {
  const manifest = await readProvidersManifest();
  const entries = Object.entries(manifest.providers);

  return Promise.all(
    entries.map(async ([name, config]) => {
      if (!config.enabled) {
        return {
          name,
          enabled: false,
          ready: false,
          command: config.command,
          credentialEnvVar: config.credentialEnvVar,
          reason: "disabled in providers.json"
        };
      }

      if (!process.env[config.credentialEnvVar]?.trim()) {
        return {
          name,
          enabled: true,
          ready: false,
          command: config.command,
          credentialEnvVar: config.credentialEnvVar,
          reason: `missing ${config.credentialEnvVar}`
        };
      }

      const exists = await commandExists(config.command);

      if (!exists) {
        return {
          name,
          enabled: true,
          ready: false,
          command: config.command,
          credentialEnvVar: config.credentialEnvVar,
          reason: `command not found: ${config.command}`
        };
      }

      return {
        name,
        enabled: true,
        ready: true,
        command: config.command,
        credentialEnvVar: config.credentialEnvVar,
        reason: "ready"
      };
    })
  );
}

export async function selectExecutionProvider(requestedProvider: string): Promise<{
  selectedProvider: string;
  fallbackFrom: string | null;
  statuses: ProviderRuntimeStatus[];
}> {
  return selectExecutionProviderWithExclusions(requestedProvider);
}

export async function selectExecutionProviderWithExclusions(
  requestedProvider: string,
  excludedProviders: string[] = []
): Promise<{
  selectedProvider: string;
  fallbackFrom: string | null;
  statuses: ProviderRuntimeStatus[];
}> {
  const [manifest, statuses] = await Promise.all([
    readProvidersManifest(),
    readProviderStatuses()
  ]);
  const excluded = new Set(excludedProviders);

  const readyProviders = new Set(
    statuses
      .filter((status) => status.ready && !excluded.has(status.name))
      .map((status) => status.name)
  );

  if (readyProviders.has(requestedProvider)) {
    return {
      selectedProvider: requestedProvider,
      fallbackFrom: null,
      statuses
    };
  }

  const fallbackCandidate = manifest.fallbackOrder.find((provider) =>
    readyProviders.has(provider)
  );

  if (!fallbackCandidate) {
    throw new Error(
      `No runnable provider is available. ${statuses
        .map((status) => `${status.name}: ${status.reason}`)
        .join(" | ")}`
    );
  }

  return {
    selectedProvider: fallbackCandidate,
    fallbackFrom: requestedProvider,
    statuses
  };
}

export async function readProviderConfig(provider: string): Promise<ProviderConfig | null> {
  const manifest = await readProvidersManifest();
  return manifest.providers[provider] ?? null;
}
