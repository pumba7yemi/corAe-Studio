import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request, ctx: { params: Promise<{ bucket: string }> }) {
  const params = await ctx.params;
  const { name } = await req.json();
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
  const root = process.cwd();
  const dataRoot = path.resolve(root, "../../../data");
  const p = path.join(dataRoot, params.bucket, name.replace(/[^\w.\-]/g, "_"));
  if (fs.existsSync(p)) fs.unlinkSync(p);
  return NextResponse.json({ ok: true });
}