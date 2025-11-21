import { NextRequest } from "next/server";
import { memoryPulseStore } from "@corae/core-pulse";

export const runtime = "nodejs"; // safer for future adapters

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const summary = memoryPulseStore.upsertDelta(payload);
    return Response.json({ ok: true, summary });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "bad payload" }, { status: 400 });
  }
}
