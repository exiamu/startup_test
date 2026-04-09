import { NextResponse } from "next/server";

import { scanProjectRoot } from "@/modules/project-discovery/reader";

export async function GET() {
  return NextResponse.json(await scanProjectRoot());
}
