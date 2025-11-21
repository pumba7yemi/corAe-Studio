import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CAIA_DIR = path.resolve(process.cwd(), "corAe-Studio-v2", ".corae");
const EVENING_FILE = path.join(CAIA_DIR, "evening-checks.json");
const DECISION_FILE = path.join(CAIA_DIR, "decision-memory.json");

async function ensureDir() {
  try {
    await fs.promises.mkdir(CAIA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function GET() {
  try {
    const data = await fs.promises.readFile(EVENING_FILE, "utf-8");
    const json = JSON.parse(data);
    return NextResponse.json({ ok: true, checks: json });
  } catch (e) {
    return NextResponse.json({ ok: true, checks: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await ensureDir();
    let existing: any[] = [];
    try {
      const data = await fs.promises.readFile(EVENING_FILE, "utf-8");
      existing = JSON.parse(data);
    } catch (e) {
      existing = [];
    }

    const entry = { id: Date.now(), ts: new Date().toISOString(), payload: body };
    existing.push(entry);
    await fs.promises.writeFile(EVENING_FILE, JSON.stringify(existing, null, 2), "utf-8");

    // Also append a decision-memory entry so CAIA/decision-record can ingest it.
    try {
      let dm: any = { entries: [] };
      try {
        const raw = await fs.promises.readFile(DECISION_FILE, "utf-8");
        dm = JSON.parse(raw);
        if (!Array.isArray(dm.entries)) dm.entries = [];
      } catch (e) {
        dm = { entries: [] };
      }

      const confirmedCount = Array.isArray(body?.confirmed) ? body.confirmed.length : 0;
      const dmEntry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        type: "evening-check",
        subject: "evening-check",
        actor: "human",
        result: confirmedCount > 0 ? "confirmed" : "skipped",
        reason: typeof body?.notes === "string" ? body.notes : "",
        payload: body,
      };
      dm.entries.push(dmEntry);
      await fs.promises.writeFile(DECISION_FILE, JSON.stringify(dm, null, 2), "utf-8");
    } catch (e) {
      // best-effort: don't fail the request if decision-memory update fails
      console.warn("Failed to record to decision-memory:", e);
    }

    return NextResponse.json({ ok: true, saved: entry });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
