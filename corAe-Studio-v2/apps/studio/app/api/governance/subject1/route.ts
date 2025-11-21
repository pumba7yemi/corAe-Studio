import { NextRequest, NextResponse } from "next/server";
import { appendSubject1Update } from "@/../GOVERNANCE/api/append-subject1-update";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body?.text || "").trim();
    if (!text) return NextResponse.json({ ok: false, error: "Empty update" }, { status: 400 });

    await appendSubject1Update(text);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();
const SUBJECT1_DIR = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "subject1");

export async function GET() {
  try {
    const files = fs.readdirSync(SUBJECT1_DIR).filter((f) => f.endsWith(".md"));
    return NextResponse.json({ ok: true, files });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const file = body.file as string;
    const content = body.content as string;

    if (!file || !file.endsWith(".md")) {
      return NextResponse.json({ ok: false, error: "Invalid file" }, { status: 400 });
    }

    const target = path.join(SUBJECT1_DIR, file);
    fs.writeFileSync(target, content ?? "", "utf8");

    return NextResponse.json({ ok: true, file });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
