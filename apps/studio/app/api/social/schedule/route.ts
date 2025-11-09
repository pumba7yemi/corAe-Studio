import { NextResponse } from "next/server";
// inline implementation instead of import
const socialEngine = {
    async schedule({ platform, content, when }: { platform: string; content: string; when: string }) {
        // paste the actual engine.schedule implementation here
        return { ok: true, platform, content, when };
    }
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { platform = "debug", content, when } = body ?? {};
  if (!content || !when) {
    return NextResponse.json({ ok: false, error: "content & when required" }, { status: 400 });
  }
  const res = await socialEngine.schedule({ platform, content, when });
  return NextResponse.json(res);
}