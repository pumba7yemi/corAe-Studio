import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const p = resolve(process.cwd(), "prisma", "schema.prisma");
    const txt = readFileSync(p, "utf8");
    return new Response(txt, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "schema not found" }, { status:404 });
  }
}