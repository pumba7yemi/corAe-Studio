import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();
const CORE_DIR = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "core");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file") || "";
    if (!file.endsWith(".json")) {
      return NextResponse.json({ ok: false, error: "Invalid file" }, { status: 400 });
    }

    const target = path.join(CORE_DIR, file);
    const json = JSON.parse(fs.readFileSync(target, "utf8"));
    return NextResponse.json({ ok: true, json });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
