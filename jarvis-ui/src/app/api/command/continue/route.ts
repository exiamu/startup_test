import { NextResponse } from "next/server";

import { buildCommandPlan } from "@/modules/command/engine";
import {
  appendCommandSessionTurn,
  readActiveMission,
  syncActiveMissionForSession
} from "@/modules/nexus-adapter/writer";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string | null;
    request?: string;
  };

  const currentMission = await readActiveMission();

  if (!currentMission) {
    return NextResponse.json({ error: "Active mission not found." }, { status: 404 });
  }

  if (body.sessionId && body.sessionId !== currentMission.sessionId) {
    return NextResponse.json(
      { error: "Requested session does not match the active mission." },
      { status: 409 }
    );
  }

  const mission = await syncActiveMissionForSession(currentMission.sessionId);

  if (!mission || !mission.canContinue) {
    return NextResponse.json(
      { error: "Jarvis cannot safely continue the current mission right now." },
      { status: 409 }
    );
  }

  const plan = await buildCommandPlan({
    request: body.request?.trim() || "Continue the active mission.",
    source: "direct",
    sessionId: mission.sessionId
  });

  const { session, turn } = await appendCommandSessionTurn({
    sessionId: mission.sessionId,
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
