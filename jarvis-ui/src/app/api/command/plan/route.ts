import { NextResponse } from "next/server";

import { buildCommandPlan } from "@/modules/command/engine";
import type { CommandSource } from "@/modules/command/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    request?: string;
    source?: CommandSource;
  };

  return NextResponse.json(
    await buildCommandPlan({
      request: body.request,
      source: body.source
    })
  );
}
