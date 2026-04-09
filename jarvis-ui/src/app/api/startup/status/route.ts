import { NextResponse } from "next/server";

import { readStartupStatus } from "@/modules/startup/status";

export async function GET() {
  return NextResponse.json(await readStartupStatus());
}
