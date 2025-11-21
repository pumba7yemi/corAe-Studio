import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(_: Request, ctx: { params: Promise<{ bucket: string }> }) {
  const params = await ctx.params;
  const root = process.cwd();
  const dataRoot = path.resolve(root, "../../../data");
  const dir = path.join(dataRoot, params.bucket);
  if (!fs.existsSync(dir)) return NextResponse.json({ ok: true, items: [] });

  const items = fs.readdirSync(dir).map(name => {
    const p = path.join(dir, name); const s = fs.statSync(p);
    return { name, size: s.size, mtime: s.mtime.toISOString() };
  });
  return NextResponse.json({ ok: true, items });
}