// apps/shipyard/app/api/shipyard/generate/route.ts
import { NextResponse } from "next/server";

// Stub: plug into your real worker/queue later
export async function POST() {
  // TODO: call your build worker (or write a file into root/dist)
  return NextResponse.json({ ok: true, queued: true });
}