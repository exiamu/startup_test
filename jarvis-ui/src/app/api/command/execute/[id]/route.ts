import { NextResponse } from "next/server";

import { readExecutionRecord } from "@/modules/nexus-adapter/writer";

type ExecutionStatusRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ExecutionStatusRouteProps) {
  const { id } = await params;
  const record = await readExecutionRecord(id);

  if (!record) {
    return NextResponse.json({ error: "Execution record not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}
