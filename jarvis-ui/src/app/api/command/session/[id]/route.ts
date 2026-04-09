import { NextResponse } from "next/server";

import { readCommandSession } from "@/modules/nexus-adapter/writer";

type CommandSessionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: CommandSessionRouteProps) {
  const { id } = await params;
  const session = await readCommandSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session record not found." }, { status: 404 });
  }

  return NextResponse.json(session);
}
