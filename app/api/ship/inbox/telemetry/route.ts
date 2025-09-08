// apps/studio/app/api/ship/inbox/telemetry/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { withBBB } from "@/bbb/gate";
import { appendEvent } from "@/build/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest) {
  // Parse JSON safely
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), "build", ".data", "ship", "telemetry");
  const file = path.join(dir, `${day}.jsonl`);

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      file,
      JSON.stringify({ ts: now.toISOString(), payload }) + "\n",
      "utf8"
    );

    await appendEvent({
      ts: now.toISOString(),
      level: "INFO",
      scope: "bbb",
      action: "INGEST_TELEMETRY",
      meta: { file }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await appendEvent({
      ts: now.toISOString(),
      level: "ERROR",
      scope: "bbb",
      action: "INGEST_TELEMETRY",
      notes: err?.message ?? String(err),
      meta: { file }
    });
    return NextResponse.json(
      { ok: false, error: err?.message ?? "write_failed" },
      { status: 500 }
    );
  }
}

export const POST = withBBB("INBOUND", "TELEMETRY", handler);