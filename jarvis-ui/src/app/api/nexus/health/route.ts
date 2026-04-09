import { NextResponse } from "next/server";

import { readNexusHealth } from "@/modules/nexus-adapter/reader";

export async function GET() {
  const health = await readNexusHealth();
  return NextResponse.json(health);
}
