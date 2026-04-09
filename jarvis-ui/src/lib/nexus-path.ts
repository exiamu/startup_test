import nodePath from "node:path";
const pathResolve = (...args: string[]) => nodePath.resolve(...args);

const DEFAULT_NEXUS_ROOT = "../.nexus";

export function getConfiguredNexusRoot(): string {
  return process.env.NEXUS_ROOT?.trim() || DEFAULT_NEXUS_ROOT;
}

export function resolveNexusRoot(): string {
  // Turbopack only needs the resolved .nexus path, not the whole cwd tree.
  return pathResolve(/* turbopackIgnore: true */ process.cwd(), getConfiguredNexusRoot());
}

export function resolveInsideNexus(...segments: string[]): string {
  const root = resolveNexusRoot();
  const target = pathResolve(root, ...segments);

  if (target !== root && !target.startsWith(`${root}${nodePath.sep}`)) {
    throw new Error("Attempted path escape outside NEXUS_ROOT");
  }

  return target;
}
