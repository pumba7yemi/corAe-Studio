import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  try {
    const base = path.join(process.cwd(), ".next", "server");
    const chunksDir = path.join(base, "chunks");
    if (!fs.existsSync(chunksDir))
      return NextResponse.json({ ok: true, details: ["No chunks dir (dev or fresh build)"], checkedAt: new Date().toISOString() });

    const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
    const missing: string[] = [];
    for (const f of files) {
      const wrapper = path.join(base, f);
      if (!fs.existsSync(wrapper)) missing.push(`Missing wrapper for ${f}`);
    }
    return NextResponse.json({ ok: missing.length === 0, details: missing, checkedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, details: [String(e?.message ?? e)], checkedAt: new Date().toISOString() }, { status: 200 });
  }
}
