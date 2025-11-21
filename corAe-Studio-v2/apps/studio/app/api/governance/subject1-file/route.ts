import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();
const SUBJECT1_DIR = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "subject1");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file") || "";
    if (!file.endsWith(".md")) {
      return NextResponse.json({ ok: false, error: "Invalid file" }, { status: 400 });
    }

    const target = path.join(SUBJECT1_DIR, file);
    const content = fs.readFileSync(target, "utf8");
    return NextResponse.json({ ok: true, content });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
