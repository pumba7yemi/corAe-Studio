import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = "unknown", phone = "", email = "", src = "direct", variant = "business" } = body;

    const logDir = path.join(process.cwd(), "data");
    await fs.mkdir(logDir, { recursive: true });
    const line = `${new Date().toISOString()} | ${name} | ${phone || email || "n/a"} | ${src} | ${variant}\n`;
    await fs.appendFile(path.join(logDir, "leads.log"), line, "utf8");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}