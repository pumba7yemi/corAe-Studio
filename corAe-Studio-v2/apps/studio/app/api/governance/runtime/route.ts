import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();
const CORE_DIR = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "core");

export async function GET() {
  try {
    const files = fs.readdirSync(CORE_DIR).filter((f) => f.endsWith(".json"));
    return NextResponse.json({ ok: true, files });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const file = body.file as string;
    const json = body.json;

    if (!file || !file.endsWith(".json")) {
      return NextResponse.json({ ok: false, error: "Invalid file" }, { status: 400 });
    }

    const target = path.join(CORE_DIR, file);
    fs.writeFileSync(target, JSON.stringify(json ?? {}, null, 2), "utf8");

    return NextResponse.json({ ok: true, file });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
