import { NextResponse } from "next/server";

import { runCommandValidationMatrix } from "@/modules/command/validation";

export async function GET() {
  return NextResponse.json(await runCommandValidationMatrix());
}
