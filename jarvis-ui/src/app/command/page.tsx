import { CommandClient } from "@/app/command/command-client";
import type { CommandSource } from "@/modules/command/types";

type CommandPageProps = {
  searchParams: Promise<{
    request?: string;
    source?: CommandSource;
  }>;
};

export default async function CommandPage({ searchParams }: CommandPageProps) {
  const { request, source } = await searchParams;

  return (
    <CommandClient
      initialRequest={request ?? ""}
      initialSource={source ?? "direct"}
    />
  );
}
