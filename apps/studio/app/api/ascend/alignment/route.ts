import { NextResponse } from "next/server";
import { hasSignedSocialContract } from "@corae/core-ascend";

export async function GET() {
  const aligned = await hasSignedSocialContract();
  const summary = null;
  return NextResponse.json({ aligned, summary });
}
