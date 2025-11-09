import { NextResponse } from "next/server";
import { socialEngine } from "../../../../../../src/services/social/engine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { platform = "debug", content, when } = body ?? {};
  if (!content) return NextResponse.json({ ok: false, error: "content required" }, { status: 400 });

  const res = when && when !== "now"
    ? await socialEngine.schedule({ platform, content, when } as any)
    : await socialEngine.postNow({ platform, content, when: "now" } as any);

  return NextResponse.json(res);
}