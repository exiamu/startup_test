import { NextResponse } from "next/server";

import { analyzeOnboardingInput } from "@/modules/onboarding/engine";

export async function POST(request: Request) {
  const body = (await request.json()) as { idea?: string };
  const idea = body.idea?.trim() ?? "";

  if (!idea) {
    return NextResponse.json(
      { error: "Idea input is required." },
      { status: 400 }
    );
  }

  return NextResponse.json(analyzeOnboardingInput(idea));
}
