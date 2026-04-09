import { CommandClient } from "@/app/command/command-client";
import type { CommandSource } from "@/modules/command/types";

type CommandPageProps = {
  searchParams: Promise<{
    request?: string;
    source?: CommandSource;
    sessionId?: string;
  }>;
};

export default async function CommandPage({ searchParams }: CommandPageProps) {
  const { request, source, sessionId } = await searchParams;

  return (
    <CommandClient
      initialRequest={request ?? ""}
      initialSource={source ?? "direct"}
      initialSessionId={sessionId ?? null}
    />
  );
}
