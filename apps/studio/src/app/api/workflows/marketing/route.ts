import { NextResponse } from "next/server";
import { engine } from "@/services/workflows/engine"; // your engine singleton

export async function POST(req: Request) {
  const body = await req.json();
  // expected body: { postId, platform, account, topic, audience, copy, assets, storySeed }
  const event = { type: "post.published", ...body };
  const runId = await engine.start("marketing.loop.v1", { event });
  return NextResponse.json({ ok: true, runId });
}
