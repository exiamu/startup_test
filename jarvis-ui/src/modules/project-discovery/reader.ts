import path from "node:path";
const pathJoin = (...args: string[]) => path.join(...args);
const pathResolve = (...args: string[]) => path.resolve(...args);
const pathDirname = (p: string) => path.dirname(p);
import { promises as fs, Dirent } from "node:fs";
const fsReaddirWithTypes = (target: string) => fs.readdir(target, { withFileTypes: true });
const fsReadFile = (target: string, encoding: BufferEncoding) =>
  fs.readFile(target, encoding);
const fsAccess = (target: string) => fs.access(target);

import { resolveNexusRoot } from "@/lib/nexus-path";
import type {
  ManifestSummary,
  ProjectArea,
  ProjectDraft,
  ProjectFileSummary,
  ProjectScan,
  RecommendedAction,
  RoomContextProposal
} from "@/modules/project-discovery/types";

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".nexus",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
  ".turbo",
  ".cache",
  ".venv",
  "venv",
  "__pycache__"
]);

const MANIFEST_FILES = [
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.json",
  "pyproject.toml",
  "requirements.txt",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "README.md",
  "Makefile",
  ".github/workflows"
] as const;

const AREA_HINTS = [
  { name: "apps", kind: "application workspace" },
  { name: "packages", kind: "shared package workspace" },
  { name: "services", kind: "service layer" },
  { name: "src-tauri", kind: "desktop runtime" },
  { name: "src", kind: "source tree" },
  { name: "app", kind: "application entry surface" },
  { name: "pages", kind: "route surface" },
  { name: "components", kind: "UI components" },
  { name: "modules", kind: "feature modules" },
  { name: "lib", kind: "shared library" },
  { name: "api", kind: "API surface" },
  { name: "server", kind: "server-side runtime" },
  { name: "tests", kind: "test suite" }
] as const;

async function exists(target: string): Promise<boolean> {
  try {
    await fsAccess(target);
    return true;
  } catch {
    return false;
  }
}

async function safeReadDir(target: string) {
  try {
    return (await fsReaddirWithTypes(target)) as Dirent[];
  } catch {
    return [];
  }
}

async function safeReadFile(target: string): Promise<string | null> {
  try {
    return await fsReadFile(target, "utf8");
  } catch {
    return null;
  }
}

function isHiddenPathSegment(name: string): boolean {
  return name.startsWith(".");
}

function sortStrings(items: string[]): string[] {
  return [...new Set(items)].sort((left, right) => left.localeCompare(right));
}

function inferProjectType(signals: ProjectScan["signals"]): string[] {
  const types: string[] = [];

  if (signals.packageJson) {
    types.push("Node.js / web application");
  }

  if (signals.pyproject || signals.requirementsTxt) {
    types.push("Python project");
  }

  if (signals.dockerfile) {
    types.push("Containerized deployment");
  }

  if (signals.tests) {
    types.push("Project has test infrastructure");
  }

  if (signals.srcDir || signals.appDir) {
    types.push("Application code already exists");
  }

  if (types.length === 0) {
    types.push("Blank or minimal project");
  }

  return types;
}

function summarizePackageJson(raw: string): {
  summary: string[];
  frameworks: string[];
  packageManagers: string[];
  runtimes: string[];
  testing: string[];
} {
  try {
    const parsed = JSON.parse(raw) as {
      name?: string;
      packageManager?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = {
      ...parsed.dependencies,
      ...parsed.devDependencies
    };
    const dependencyNames = Object.keys(deps);
    const frameworks: string[] = [];
    const packageManagers: string[] = [];
    const runtimes = ["Node.js"];
    const testing: string[] = [];
    const summary: string[] = [];

    if (parsed.name) {
      summary.push(`Package name: ${parsed.name}`);
    }

    if (parsed.packageManager) {
      packageManagers.push(parsed.packageManager);
      summary.push(`Package manager: ${parsed.packageManager}`);
    }

    if ("next" in deps) frameworks.push("Next.js");
    if ("react" in deps) frameworks.push("React");
    if ("vite" in deps) frameworks.push("Vite");
    if ("express" in deps) frameworks.push("Express");
    if ("fastify" in deps) frameworks.push("Fastify");
    if ("nestjs" in deps || "@nestjs/core" in deps) frameworks.push("NestJS");
    if ("tailwindcss" in deps) frameworks.push("Tailwind CSS");
    if ("prisma" in deps || "@prisma/client" in deps) frameworks.push("Prisma");

    if ("vitest" in deps) testing.push("Vitest");
    if ("jest" in deps) testing.push("Jest");
    if ("playwright" in deps || "@playwright/test" in deps) testing.push("Playwright");
    if ("cypress" in deps) testing.push("Cypress");

    if (parsed.scripts) {
      summary.push(`Scripts: ${sortStrings(Object.keys(parsed.scripts)).slice(0, 8).join(", ")}`);
    }

    if (dependencyNames.length > 0) {
      summary.push(`Dependency count: ${dependencyNames.length}`);
    }

    return {
      summary,
      frameworks,
      packageManagers,
      runtimes,
      testing
    };
  } catch {
    return {
      summary: ["package.json exists but could not be parsed cleanly."],
      frameworks: [],
      packageManagers: [],
      runtimes: ["Node.js"],
      testing: []
    };
  }
}

function summarizePyproject(raw: string): {
  summary: string[];
  frameworks: string[];
  runtimes: string[];
  testing: string[];
} {
  const lower = raw.toLowerCase();
  const frameworks: string[] = [];
  const testing: string[] = [];

  if (lower.includes("django")) frameworks.push("Django");
  if (lower.includes("fastapi")) frameworks.push("FastAPI");
  if (lower.includes("flask")) frameworks.push("Flask");
  if (lower.includes("pytest")) testing.push("Pytest");

  return {
    summary: [
      "pyproject.toml detected",
      lower.includes("[project]") ? "PEP 621 project metadata present" : "Project metadata layout unclear"
    ],
    frameworks,
    runtimes: ["Python"],
    testing
  };
}

function summarizeRequirements(raw: string): {
  summary: string[];
  frameworks: string[];
  runtimes: string[];
  testing: string[];
} {
  const lower = raw.toLowerCase();
  const frameworks: string[] = [];
  const testing: string[] = [];

  if (lower.includes("django")) frameworks.push("Django");
  if (lower.includes("fastapi")) frameworks.push("FastAPI");
  if (lower.includes("flask")) frameworks.push("Flask");
  if (lower.includes("pytest")) testing.push("Pytest");

  return {
    summary: ["requirements.txt detected"],
    frameworks,
    runtimes: ["Python"],
    testing
  };
}

function summarizeReadme(raw: string): string[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const headings = lines.filter((line) => line.startsWith("#")).slice(0, 4);

  if (headings.length === 0) {
    return ["README.md exists but does not expose clear heading structure."];
  }

  return [`README headings: ${headings.join(" | ")}`];
}

function summarizeDocker(raw: string | null): string[] {
  if (!raw) {
    return ["Dockerfile detected."];
  }

  const fromMatch = raw.match(/^FROM\s+([^\s]+)/m);
  return [fromMatch ? `Docker base image: ${fromMatch[1]}` : "Dockerfile detected."];
}

async function collectManifestSummary(projectRoot: string): Promise<{
  manifests: ManifestSummary[];
  frameworks: string[];
  packageManagers: string[];
  runtimes: string[];
  testing: string[];
  deployment: string[];
  documentation: string[];
}> {
  const manifests: ManifestSummary[] = [];
  const frameworks: string[] = [];
  const packageManagers: string[] = [];
  const runtimes: string[] = [];
  const testing: string[] = [];
  const deployment: string[] = [];
  const documentation: string[] = [];

  for (const entry of MANIFEST_FILES) {
    const target = pathJoin(projectRoot, entry);

    if (!(await exists(target))) {
      continue;
    }

    if (entry === ".github/workflows") {
      deployment.push("GitHub Actions");
      manifests.push({
        path: ".github/workflows",
        summary: ["CI workflow directory detected."]
      });
      continue;
    }

    const raw = await safeReadFile(target);
    let summary: string[] = ["File detected."];

    if (entry === "package.json" && raw) {
      const packageSummary = summarizePackageJson(raw);
      summary = packageSummary.summary;
      frameworks.push(...packageSummary.frameworks);
      packageManagers.push(...packageSummary.packageManagers);
      runtimes.push(...packageSummary.runtimes);
      testing.push(...packageSummary.testing);
    } else if (entry === "pyproject.toml" && raw) {
      const pyprojectSummary = summarizePyproject(raw);
      summary = pyprojectSummary.summary;
      frameworks.push(...pyprojectSummary.frameworks);
      runtimes.push(...pyprojectSummary.runtimes);
      testing.push(...pyprojectSummary.testing);
    } else if (entry === "requirements.txt" && raw) {
      const requirementsSummary = summarizeRequirements(raw);
      summary = requirementsSummary.summary;
      frameworks.push(...requirementsSummary.frameworks);
      runtimes.push(...requirementsSummary.runtimes);
      testing.push(...requirementsSummary.testing);
    } else if (entry === "README.md" && raw) {
      summary = summarizeReadme(raw);
      documentation.push("README present");
    } else if (entry === "Dockerfile") {
      summary = summarizeDocker(raw);
      deployment.push("Docker");
    } else if (entry === "docker-compose.yml" || entry === "docker-compose.yaml") {
      summary = ["Docker Compose detected."];
      deployment.push("Docker Compose");
    } else if (entry === "pnpm-workspace.yaml") {
      summary = ["pnpm workspace detected."];
      packageManagers.push("pnpm workspace");
    } else if (entry === "turbo.json") {
      summary = ["Turborepo configuration detected."];
      frameworks.push("Turborepo");
    } else if (entry === "Makefile") {
      summary = ["Makefile detected."];
    }

    manifests.push({
      path: entry,
      summary
    });
  }

  return {
    manifests,
    frameworks: sortStrings(frameworks),
    packageManagers: sortStrings(packageManagers),
    runtimes: sortStrings(runtimes),
    testing: sortStrings(testing),
    deployment: sortStrings(deployment),
    documentation: sortStrings(documentation)
  };
}

async function collectCodeAreas(projectRoot: string, topLevelDirectories: string[]): Promise<ProjectArea[]> {
  const areas: ProjectArea[] = [];

  for (const directory of topLevelDirectories) {
    const fullPath = pathJoin(projectRoot, directory);
    const entries = await safeReadDir(fullPath);
    const sampleChildren = entries
      .filter((entry) => !EXCLUDED_DIRECTORIES.has(entry.name) && !isHiddenPathSegment(entry.name))
      .map((entry) => entry.name)
      .slice(0, 6);

    const lowerDirectory = directory.toLowerCase();
    const hint = AREA_HINTS.find((option) => option.name === lowerDirectory);

    if (hint || sampleChildren.length > 0) {
      areas.push({
        path: directory,
        kind: hint?.kind ?? "project area",
        sampleChildren
      });
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || EXCLUDED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      if (isHiddenPathSegment(entry.name)) {
        continue;
      }

      const nestedRelativePath = pathJoin(directory, entry.name);
      const nestedLowerName = entry.name.toLowerCase();
      const nestedHint = AREA_HINTS.find((option) => option.name === nestedLowerName);

      if (!nestedHint) {
        continue;
      }

      const nestedEntries = await safeReadDir(pathJoin(fullPath, entry.name));
      areas.push({
        path: nestedRelativePath,
        kind: nestedHint.kind,
        sampleChildren: nestedEntries
          .filter((child) => !EXCLUDED_DIRECTORIES.has(child.name) && !isHiddenPathSegment(child.name))
          .map((child) => child.name)
          .slice(0, 6)
      });
    }
  }

  return areas.slice(0, 14);
}

function collectKeyFiles(
  topLevelFiles: string[],
  manifests: ManifestSummary[],
  topLevelDirectories: string[]
): ProjectFileSummary[] {
  const keyFiles: ProjectFileSummary[] = manifests.map((manifest) => ({
    path: manifest.path,
    reason: manifest.summary[0] ?? "Detected project manifest."
  }));

  if (topLevelDirectories.includes("src")) {
    keyFiles.push({ path: "src", reason: "Primary application code likely lives here." });
  }

  if (topLevelDirectories.includes("app")) {
    keyFiles.push({ path: "app", reason: "Application routing or app entry surface detected." });
  }

  if (topLevelDirectories.includes("tests")) {
    keyFiles.push({ path: "tests", reason: "Dedicated test surface detected." });
  }

  if (topLevelDirectories.includes("services")) {
    keyFiles.push({ path: "services", reason: "Service-oriented boundary detected." });
  }

  for (const file of topLevelFiles) {
    if (file.endsWith(".env.example") || file === ".env.example") {
      keyFiles.push({ path: file, reason: "Environment contract example detected." });
    }
  }

  return keyFiles.slice(0, 14);
}

function inferArchitectureSignals(scan: {
  frameworks: string[];
  runtimes: string[];
  deployment: string[];
  codeAreas: ProjectArea[];
  manifests: ManifestSummary[];
}): string[] {
  const signals: string[] = [];
  const paths = scan.codeAreas.map((area) => area.path.toLowerCase());

  if (scan.frameworks.includes("Next.js")) {
    signals.push("This looks like a Next.js-style full-stack web surface with UI and server behavior likely co-located.");
  }

  if (scan.frameworks.includes("React") && !scan.frameworks.includes("Next.js")) {
    signals.push("Frontend behavior appears React-driven and may rely on a separate backend or service layer.");
  }

  if (scan.runtimes.includes("Python")) {
    const hasAppSubfolder = scan.codeAreas.some((area) => {
      const lower = area.path.toLowerCase();
      return lower.includes("app") || lower.includes("src") || (area.sampleChildren.length > 3 && !EXCLUDED_DIRECTORIES.has(area.path));
    });

    if (hasAppSubfolder) {
      signals.push("This looks like an application package with an internal runtime boundary, not just loose scripts.");
    } else {
      signals.push("Python runtime signals suggest a service or automation layer that may need backend/data review first.");
    }
  }

  if (scan.runtimes.length > 1) {
    signals.push(`Multiple runtimes detected (${scan.runtimes.join(", ")}), which suggests a polyglot or service-oriented architecture with potential integration complexity.`);
  }

  if (paths.some((pathEntry) => pathEntry.includes("src-tauri"))) {
    signals.push("A desktop runtime boundary is visible, so Jarvis should treat this as more than a simple web frontend.");
  }

  if (scan.frameworks.length > 2) {
    signals.push("Significant framework diversity detected; Jarvis should be cautious about assuming a single unified architecture pattern.");
  }

  if (paths.some((pathEntry) => pathEntry.includes("services")) && paths.some((pathEntry) => pathEntry.includes("components"))) {
    signals.push("The repo appears split between service logic and UI surfaces, which suggests multi-room handoff instead of a single-room analysis.");
  }

  if (paths.some((pathEntry) => pathEntry === "apps") || scan.frameworks.includes("Turborepo")) {
    signals.push("Workspace or monorepo structure is present, so Jarvis should think in project boundaries rather than one flat app.");
  }

  if (scan.deployment.length > 0) {
    signals.push(`Deployment footprint is already visible through ${scan.deployment.join(", ")}.`);
  }

  if (signals.length === 0) {
    signals.push("The repo shape is still shallow enough that Jarvis should treat this as an exploratory brownfield intake.");
  }

  return signals;
}

function inferRiskAreas(scan: {
  documentation: string[];
  testing: string[];
  deployment: string[];
  frameworks: string[];
  codeAreas: ProjectArea[];
  unresolvedQuestions: string[];
}): string[] {
  const risks: string[] = [];

  if (scan.documentation.length === 0) {
    risks.push("Documentation is thin, so Jarvis may need to infer intent from structure instead of explicit project guidance.");
  }

  if (scan.testing.length === 0) {
    risks.push("Testing signal is weak or absent, which raises regression risk before implementation work begins.");
  }

  if (scan.deployment.length === 0) {
    risks.push("Deployment footprint is unclear, so production assumptions should remain draft-only.");
  }

  if (scan.codeAreas.length === 0) {
    risks.push("Code-area discovery is thin, which means Jarvis may still be missing the actual system boundary.");
  }

  if (
    scan.frameworks.includes("React") &&
    !scan.codeAreas.some((area) => area.path.toLowerCase().includes("api")) &&
    !scan.codeAreas.some((area) => area.path.toLowerCase().includes("server")) &&
    !scan.codeAreas.some((area) => area.path.toLowerCase().includes("src-tauri"))
  ) {
    risks.push("Frontend signals exist without an obvious backend boundary; integration assumptions need confirmation.");
  }

  if (scan.unresolvedQuestions.length > 2) {
    risks.push("There are still enough unknowns that Jarvis should avoid making strong architectural commitments.");
  }

  return risks;
}

function buildUnresolvedQuestions(scan: {
  documentation: string[];
  testing: string[];
  deployment: string[];
  frameworks: string[];
  runtimes: string[];
  codeAreas: ProjectArea[];
}): string[] {
  const questions: string[] = [];

  if (scan.frameworks.length === 0 && scan.runtimes.length === 0) {
    questions.push("Jarvis still needs a confirmed framework or runtime story from the repo itself.");
  }

  if (scan.documentation.length === 0) {
    questions.push("There is no obvious top-level README signal explaining the system intent.");
  }

  if (
    scan.testing.length === 0 &&
    !scan.codeAreas.some((area) => area.kind === "test suite") &&
    !scan.codeAreas.some((area) => area.path.toLowerCase().includes("e2e"))
  ) {
    questions.push("No clear test framework signal was detected yet. Test expectations are still unknown.");
  }

  if (scan.deployment.length === 0) {
    questions.push("Deployment footprint is still unclear from top-level manifests.");
  }

  const hasBackendishSurface =
    scan.codeAreas.some((area) => area.kind.includes("API")) ||
    scan.codeAreas.some((area) => area.kind.includes("server-side runtime")) ||
    scan.codeAreas.some((area) => area.kind.includes("service layer")) ||
    scan.codeAreas.some((area) => area.kind.includes("desktop runtime"));

  if (!hasBackendishSurface && scan.frameworks.some((framework) => framework === "React" || framework === "Next.js")) {
    questions.push("It is not yet clear where the backend/API surface lives, if one exists.");
  }

  return questions;
}

function dedupeLimited(items: string[], limit: number): string[] {
  return [...new Set(items)].slice(0, limit);
}

function buildRecommendedActions(scan: {
  frameworks: string[];
  runtimes: string[];
  codeAreas: ProjectArea[];
  deployment: string[];
  testing: string[];
  unresolvedQuestions: string[];
  riskAreas: string[];
}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const areaPaths = scan.codeAreas.map((area) => area.path.toLowerCase());

  actions.push({
    title: "Build a first real architecture model",
    room: "architect",
    ai: "Claude",
    reason:
      scan.unresolvedQuestions.length > 0
        ? "Brownfield unknowns remain high enough that Jarvis should consolidate them into an architecture-first draft."
        : "A stable architecture view should be established before task routing becomes more aggressive."
  });

  if (
    scan.frameworks.includes("Next.js") ||
    scan.frameworks.includes("React") ||
    areaPaths.some((pathEntry) => pathEntry.includes("components"))
  ) {
    actions.push({
      title: "Inspect the user-facing surface and UI structure",
      room: "frontend",
      ai: "Codex",
      reason: "The repo already exposes UI/client signals, so frontend review can quickly surface concrete implementation opportunities."
    });
  }

  if (
    scan.runtimes.includes("Python") ||
    areaPaths.some((pathEntry) => pathEntry.includes("api")) ||
    areaPaths.some((pathEntry) => pathEntry.includes("server")) ||
    areaPaths.some((pathEntry) => pathEntry.includes("services")) ||
    areaPaths.some((pathEntry) => pathEntry.includes("src-tauri"))
  ) {
    actions.push({
      title: "Map backend and service boundaries",
      room: "backend",
      ai: "Codex",
      reason: "API or service-layer signals are present, so Jarvis can propose bounded backend analysis next."
    });
  }

  if (scan.testing.length === 0 || scan.riskAreas.some((risk) => risk.includes("Testing signal"))) {
    actions.push({
      title: "Assess coverage and regression risk",
      room: "qa",
      ai: "Codex",
      reason: "Weak testing signal makes QA analysis a high-leverage next pass before deeper implementation work."
    });
  }

  if (scan.deployment.length > 0) {
    actions.push({
      title: "Review deployment and runtime assumptions",
      room: "devops",
      ai: "Codex",
      reason: `Deployment signals already exist (${scan.deployment.join(", ")}), so Jarvis can reason about runtime expectations early.`
    });
  }

  return actions.slice(0, 4);
}

function buildRoomContextPack(scan: {
  recommendedActions: RecommendedAction[];
  codeAreas: ProjectArea[];
  keyFiles: ProjectFileSummary[];
  unresolvedQuestions: string[];
}): RoomContextProposal[] {
  return scan.recommendedActions.map((action) => {
    const matchingAreas = scan.codeAreas.filter((area) => {
      const lower = area.path.toLowerCase();

      if (action.room === "frontend") {
        return lower.includes("app") || lower.includes("pages") || lower.includes("components") || lower === "src";
      }

      if (action.room === "backend") {
        return (
          lower.includes("api") ||
          lower.includes("server") ||
          lower.includes("services") ||
          lower.includes("src-tauri") ||
          lower.includes("db")
        );
      }

      if (action.room === "qa") {
        return lower.includes("tests") || lower.includes("e2e");
      }

      if (action.room === "devops") {
        return lower.includes("src-tauri") || lower.includes("services") || lower.includes("apps") || lower.includes("installer");
      }

      return (
        lower === "src" ||
        lower.includes("app") ||
        lower.includes("services") ||
        lower.includes("src-tauri")
      );
    });

    const relevantPaths = dedupeLimited(
      [
        ...matchingAreas.map((area) => area.path),
        ...scan.keyFiles
          .filter((file) => !file.path.startsWith(".github") || action.room === "devops")
          .map((file) => file.path)
      ],
      6
    );

    return {
      room: action.room,
      ai: action.ai,
      focus: action.title,
      relevantPaths,
      openQuestions: scan.unresolvedQuestions.slice(0, 3)
    };
  });
}

function buildDraft(scan: {
  likelyProjectType: string[];
  frameworks: string[];
  runtimes: string[];
  architectureSignals: string[];
  recommendedActions: RecommendedAction[];
  unresolvedQuestions: string[];
}): ProjectDraft {
  return {
    identity: [
      `Proposed project type: ${scan.likelyProjectType[0] ?? "Project type still unclear."}`,
      `Observed runtime stack: ${scan.runtimes[0] ?? "Runtime still unclear."}`,
      `Observed framework signal: ${scan.frameworks[0] ?? "No strong framework signal yet."}`
    ],
    architecture: [
      scan.architectureSignals[0] ?? "Jarvis still needs a stronger architecture read.",
      "Treat current findings as a draft brownfield context pack, not locked truth.",
      "Keep learning additive and read-only until the commander approves any project-specific writes."
    ],
    nextActions: [
      scan.recommendedActions[0]
        ? `Recommended next move: ${scan.recommendedActions[0].room} room with ${scan.recommendedActions[0].ai}.`
        : "Recommended next move still needs stronger room-routing signal.",
      scan.recommendedActions[1]
        ? `Secondary move: ${scan.recommendedActions[1].room} room with ${scan.recommendedActions[1].ai}.`
        : "Secondary move should be chosen after the first architecture pass.",
      scan.unresolvedQuestions[0] ?? "Proceed to a room-specific review once the top unknown is confirmed."
    ]
  };
}

export async function scanProjectRoot(): Promise<ProjectScan> {
  const nexusRoot = resolveNexusRoot();
  // Keep the trace scoped to the adopting project root instead of the whole cwd tree.
  const projectRoot = pathResolve(/* turbopackIgnore: true */ pathDirname(nexusRoot));
  const entries = await fsReaddirWithTypes(projectRoot);

  const filtered = entries.filter((entry) => entry.name !== ".nexus");
  const topLevelDirectories = filtered
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((entry) => !EXCLUDED_DIRECTORIES.has(entry) && !isHiddenPathSegment(entry))
    .sort((left, right) => left.localeCompare(right));
  const topLevelFiles = filtered
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const signals = {
    packageJson: await exists(pathJoin(projectRoot, "package.json")),
    pyproject: await exists(pathJoin(projectRoot, "pyproject.toml")),
    requirementsTxt: await exists(pathJoin(projectRoot, "requirements.txt")),
    dockerfile: await exists(pathJoin(projectRoot, "Dockerfile")),
    gitRepo: await exists(pathJoin(projectRoot, ".git")),
    srcDir: await exists(pathJoin(projectRoot, "src")),
    appDir: await exists(pathJoin(projectRoot, "app")),
    tests:
      (await exists(pathJoin(projectRoot, "tests"))) ||
      (await exists(pathJoin(projectRoot, "playwright.config.ts"))) ||
      (await exists(pathJoin(projectRoot, "vitest.config.ts"))) ||
      (await exists(pathJoin(projectRoot, "pytest.ini"))),
    ci: await exists(pathJoin(projectRoot, ".github", "workflows")),
    readme: await exists(pathJoin(projectRoot, "README.md"))
  };

  const likelyProjectType = inferProjectType(signals);
  const manifestSummary = await collectManifestSummary(projectRoot);
  const codeAreas = await collectCodeAreas(projectRoot, topLevelDirectories);
  const unresolvedQuestions = buildUnresolvedQuestions({
    documentation: manifestSummary.documentation,
    testing: manifestSummary.testing,
    deployment: manifestSummary.deployment,
    frameworks: manifestSummary.frameworks,
    runtimes: manifestSummary.runtimes,
    codeAreas
  });
  const architectureSignals = inferArchitectureSignals({
    frameworks: manifestSummary.frameworks,
    runtimes: manifestSummary.runtimes,
    deployment: manifestSummary.deployment,
    codeAreas,
    manifests: manifestSummary.manifests
  });
  const riskAreas = inferRiskAreas({
    documentation: manifestSummary.documentation,
    testing: manifestSummary.testing,
    deployment: manifestSummary.deployment,
    frameworks: manifestSummary.frameworks,
    codeAreas,
    unresolvedQuestions
  });
  const keyFiles = collectKeyFiles(topLevelFiles, manifestSummary.manifests, topLevelDirectories);
  const recommendedActions = buildRecommendedActions({
    frameworks: manifestSummary.frameworks,
    runtimes: manifestSummary.runtimes,
    codeAreas,
    deployment: manifestSummary.deployment,
    testing: manifestSummary.testing,
    unresolvedQuestions,
    riskAreas
  });
  const roomContextPack = buildRoomContextPack({
    recommendedActions,
    codeAreas,
    keyFiles,
    unresolvedQuestions
  });
  const proposedDraft = buildDraft({
    likelyProjectType,
    frameworks: manifestSummary.frameworks,
    runtimes: manifestSummary.runtimes,
    architectureSignals,
    recommendedActions,
    unresolvedQuestions
  });

  return {
    projectRoot,
    topLevelDirectories,
    topLevelFiles,
    signals,
    likelyProjectType,
    frameworks: manifestSummary.frameworks,
    packageManagers: manifestSummary.packageManagers,
    runtimes: manifestSummary.runtimes,
    testing: manifestSummary.testing,
    deployment: manifestSummary.deployment,
    documentation: manifestSummary.documentation,
    manifests: manifestSummary.manifests,
    keyFiles,
    codeAreas,
    architectureSignals,
    riskAreas,
    unresolvedQuestions,
    recommendedActions,
    roomContextPack,
    proposedDraft
  };
}
