import { promises as fs } from "node:fs";

import { resolveInsideNexus, resolveNexusRoot } from "@/lib/nexus-path";
import type {
  ArtifactDirectoryState,
  ArtifactNode,
  ArtifactFileState,
  CommandSessionRecord,
  ExecutionRecord,
  NexusHealth,
  OverviewState,
  QueueState,
  RoomDetailState,
  RoomState,
  VaultDocumentState
} from "@/modules/nexus-adapter/types";

const ROOM_NAMES = [
  "architect",
  "frontend",
  "backend",
  "security",
  "devops",
  "qa",
  "product",
  "writer",
  "data",
  "marketing"
] as const;

const INBOX_FILES = ["ideas.md", "bugs.md", "requests.md", "questions.md"] as const;
const OUTBOX_DIRS = ["specs", "prompts", "reports", "decisions"] as const;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfPresent(relativePath: string): Promise<string | null> {
  const filePath = resolveInsideNexus(relativePath);

  if (!(await fileExists(filePath))) {
    return null;
  }

  return fs.readFile(filePath, "utf8");
}

function extractValue(lines: string[], prefix: string): string | null {
  const line = lines.find((entry) => entry.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : null;
}

async function countMarkdownSections(relativePath: string): Promise<number> {
  const text = await readTextIfPresent(relativePath);

  if (!text) {
    return 0;
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## ") && !line.includes("README"))
    .length;
}

async function countDirectoryEntries(relativePath: string): Promise<number> {
  const dirPath = resolveInsideNexus(relativePath);

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).length;
  } catch {
    return 0;
  }
}

async function readLinesIfPresent(relativePath: string): Promise<string[]> {
  const filePath = resolveInsideNexus(relativePath);

  if (!(await fileExists(filePath))) {
    return [];
  }

  const content = await fs.readFile(filePath, "utf8");

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function readJsonIfPresent<T>(relativePath: string): Promise<T | null> {
  const filePath = resolveInsideNexus(relativePath);

  if (!(await fileExists(filePath))) {
    return null;
  }

  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function listJsonFiles(relativePath: string): Promise<string[]> {
  const dirPath = resolveInsideNexus(relativePath);

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

export async function readNexusHealth(): Promise<NexusHealth> {
  const root = resolveNexusRoot();
  const exists = await fileExists(root);

  return {
    root,
    exists,
    coreFiles: {
      nexus: await fileExists(resolveInsideNexus("NEXUS.md")),
      handoff: await fileExists(resolveInsideNexus("HANDOFF.md")),
      routing: await fileExists(resolveInsideNexus("ROUTING.md")),
      foundingPrompt: await fileExists(resolveInsideNexus("vault", "FOUNDING_PROMPT.md")),
      roomContract: await fileExists(resolveInsideNexus("contracts", "ROOM_AI_CONTRACT.md"))
    }
  };
}

export async function readOverviewState(): Promise<OverviewState> {
  const health = await readNexusHealth();
  const handoffLines = await readLinesIfPresent("HANDOFF.md");

  const handoffSummary = handoffLines.filter((line) => {
    return (
      line.startsWith("Project:") ||
      line.startsWith("Phase:") ||
      line.startsWith("Next Action:") ||
      line.startsWith("Blocker:") ||
      line.startsWith("Last Session:")
    );
  });

  return {
    health,
    handoffSummary
  };
}

export async function readRoomsState(): Promise<RoomState[]> {
  return Promise.all(
    ROOM_NAMES.map(async (room) => {
      const promptExists = await fileExists(resolveInsideNexus("rooms", room, "PROMPT.md"));
      const contextExists = await fileExists(resolveInsideNexus("rooms", room, "CONTEXT.md"));
      const roomExists = await fileExists(resolveInsideNexus("rooms", room, "ROOM.md"));
      const contextLines = await readLinesIfPresent(`rooms/${room}/CONTEXT.md`);

      return {
        name: room,
        promptExists,
        contextExists,
        roomExists,
        currentState: extractValue(contextLines, "Phase:"),
        nextAction: extractValue(contextLines, "Next Action:")
      };
    })
  );
}

export async function readVaultState(): Promise<VaultDocumentState[]> {
  const docs = [
    { file: "VISION.md", path: "vault/VISION.md" },
    { file: "CONSTRAINTS.md", path: "vault/CONSTRAINTS.md" },
    { file: "DECISIONS.md", path: "vault/DECISIONS.md" },
    { file: "ARCHITECTURE.md", path: "vault/ARCHITECTURE.md" },
    { file: "FOUNDING_PROMPT.md", path: "vault/FOUNDING_PROMPT.md" }
  ] as const;

  return Promise.all(
    docs.map(async (doc) => {
      const lines = await readLinesIfPresent(doc.path);
      const exists = lines.length > 0;
      const heading = lines.find((line) => line.startsWith("# ")) ?? null;
      const statusLine = lines.find((line) => line.startsWith("## Status:")) ?? null;

      return {
        name: doc.file,
        exists,
        heading,
        status: statusLine ? statusLine.replace("## Status:", "").trim() : null
      };
    })
  );
}

export async function readQueueState(): Promise<QueueState> {
  const inboxCounts = Object.fromEntries(
    await Promise.all(
      INBOX_FILES.map(async (file) => {
        const count = await countMarkdownSections(`inbox/${file}`);
        return [file, count];
      })
    )
  );

  const outboxCounts = Object.fromEntries(
    await Promise.all(
      OUTBOX_DIRS.map(async (dir) => {
        const count = await countDirectoryEntries(`outbox/${dir}`);
        return [dir, count];
      })
    )
  );

  const [sessionFiles, executionFiles] = await Promise.all([
    listJsonFiles("sessions"),
    listJsonFiles("execution")
  ]);

  const [sessions, executions] = await Promise.all([
    Promise.all(
      sessionFiles.map((file) =>
        readJsonIfPresent<CommandSessionRecord>(`sessions/${file}`)
      )
    ),
    Promise.all(
      executionFiles.map((file) =>
        readJsonIfPresent<ExecutionRecord>(`execution/${file}`)
      )
    )
  ]);

  return {
    inboxCounts,
    outboxCounts,
    recentSessions: sessions
      .filter((session): session is CommandSessionRecord => Boolean(session))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 8)
      .map((session) => ({
        sessionId: session.sessionId,
        updatedAt: session.updatedAt,
        turnCount: session.turns.length,
        lastRequest: session.lastRequest
      })),
    recentExecutions: executions
      .filter((execution): execution is ExecutionRecord => Boolean(execution))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 8)
      .map((execution) => ({
        executionId: execution.executionId,
        provider: execution.provider,
        room: execution.room,
        status: execution.status,
        createdAt: execution.createdAt,
        outputPath: execution.outputPath,
        sessionId: execution.sessionId
      }))
  };
}

export async function readRoomDetailState(room: string): Promise<RoomDetailState> {
  const roomText = await readTextIfPresent(`rooms/${room}/ROOM.md`);
  const promptText = await readTextIfPresent(`rooms/${room}/PROMPT.md`);
  const contextText = await readTextIfPresent(`rooms/${room}/CONTEXT.md`);

  return {
    name: room,
    roomMarkdown: roomText,
    promptMarkdown: promptText,
    contextMarkdown: contextText
  };
}

function normalizeArtifactPath(inputPath: string[]): string[] {
  return inputPath.filter(Boolean);
}

export async function readArtifactDirectoryState(
  pathSegments: string[] = []
): Promise<ArtifactDirectoryState> {
  const safeSegments = normalizeArtifactPath(pathSegments);
  const currentPath = safeSegments.join("/");
  const dirPath = resolveInsideNexus(...safeSegments);

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const mappedEntries: ArtifactNode[] = entries
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => ({
      name: entry.name,
      path: [...safeSegments, entry.name].join("/"),
      kind: (entry.isDirectory() ? "directory" : "file") as ArtifactNode["kind"]
    }))
    .sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === "directory" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });

  return {
    currentPath,
    entries: mappedEntries
  };
}

export async function readArtifactFileState(pathSegments: string[]): Promise<ArtifactFileState> {
  const safeSegments = normalizeArtifactPath(pathSegments);
  const filePath = resolveInsideNexus(...safeSegments);
  const content = await fs.readFile(filePath, "utf8");

  return {
    path: safeSegments.join("/"),
    content
  };
}
