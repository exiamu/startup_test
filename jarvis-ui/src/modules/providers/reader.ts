import { promises as fs } from "node:fs";

import { resolveInsideNexus } from "@/lib/nexus-path";
import type { ProvidersManifest } from "@/modules/providers/types";

export async function readProvidersManifest(): Promise<ProvidersManifest> {
  const manifestPath = resolveInsideNexus("providers.json");
  const raw = await fs.readFile(manifestPath, "utf8");

  return JSON.parse(raw) as ProvidersManifest;
}
