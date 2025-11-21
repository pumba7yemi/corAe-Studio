import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "build", ".data", "agent");
const JOBS_DIR = path.join(DATA_DIR, "jobs");
const QUEUE_FILE = path.join(DATA_DIR, "queue.jsonl");
const LOGS_DIR = path.join(ROOT, "build", "logs");
const BUILD_LOG = path.join(LOGS_DIR, "one-build.log.jsonl");

function uid() {
  return "JOB-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}
async function ensure() {
  await fsp.mkdir(JOBS_DIR, { recursive: true });
  await fsp.mkdir(LOGS_DIR, { recursive: true });
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(QUEUE_FILE)) await fsp.writeFile(QUEUE_FILE, "", "utf8");
}
async function appendLog(ev: any) {
  try { await fsp.appendFile(BUILD_LOG, JSON.stringify(ev) + "\n", "utf8"); } catch {}
}

export async function POST(req: NextRequest) {
  try {
    await ensure();
    const body = await req.json();
    const type = String(body?.type || "");
    if (!type) return NextResponse.json({ ok: false, error: "Missing job type" }, { status: 400 });

    const jobId = uid();
    const job = {
      id: jobId,
      type,
      status: "QUEUED",
      createdAt: new Date().toISOString(),
      payload: body?.payload || {}
    };

    await fsp.writeFile(path.join(JOBS_DIR, `${jobId}.json`), JSON.stringify(job, null, 2), "utf8");
    await fsp.appendFile(QUEUE_FILE, JSON.stringify({ id: jobId }) + "\n", "utf8");
    await appendLog({ ts: new Date().toISOString(), level: "INFO", scope: "agent.queue", action: "ENQUEUE", meta: { jobId, type } });

    return NextResponse.json({ ok: true, jobId });
  } catch (e: any) {
    await appendLog({ ts: new Date().toISOString(), level: "ERROR", scope: "agent.queue", action: "ENQUEUE_FAIL", notes: e?.message || "unknown" });
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
