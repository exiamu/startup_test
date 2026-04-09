import { NextResponse } from "next/server";

import { buildCommandPlan } from "@/modules/command/engine";
import type { CommandSource } from "@/modules/command/types";
import { appendCommandSessionTurn } from "@/modules/nexus-adapter/writer";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    request?: string;
    source?: CommandSource;
    sessionId?: string | null;
  };

  const plan = await buildCommandPlan({
    request: body.request,
    source: body.source
  });

  const { session, turn } = await appendCommandSessionTurn({
    sessionId: body.sessionId,
    request: plan.request,
    source: plan.source,
    intent: plan.classification.intent,
    summary: plan.classification.summary,
    recommendedRoom: plan.recommendation.room,
    recommendedAi: plan.recommendation.ai
  });

  return NextResponse.json({
    sessionId: session.sessionId,
    turnId: turn.turnId,
    plan
  });
}
