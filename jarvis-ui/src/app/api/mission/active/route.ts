import { NextResponse } from "next/server";

import { readActiveMission } from "@/modules/nexus-adapter/writer";

export async function GET() {
  const mission = await readActiveMission();

  if (!mission) {
    return NextResponse.json({ error: "Active mission not found." }, { status: 404 });
  }

  return NextResponse.json(mission);
}
