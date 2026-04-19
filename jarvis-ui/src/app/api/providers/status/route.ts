import { NextResponse } from "next/server";

import { readProviderStatuses } from "@/modules/providers/reader";

export async function GET() {
  const providers = await readProviderStatuses();
  return NextResponse.json({ providers });
}
