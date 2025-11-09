// apps/studio/app/api/copilot/reconcile/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Copilot Reconcile — enqueue blueprint for orchestration.
 * - Validates minimal payload
 * - Persists a queued job into a dev-friendly FS queue
 * - Returns jobId + poll URL (UI will read last report separately)
 *
 * No other files required. Safe to paste and run.
 */

type CopilotJobStatus = "queued" | "running" | "succeeded" | "failed";

type CopilotJob = {
  id: string;
  status: CopilotJobStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  source: "wizard" | "studio" | "api";
  // What the orchestrator will need:
  blueprint: Record<string, any>;
  // Optional context for auditing:
  meta?: {
    requestedBy?: string | null;
    notes?: string | null;
    tenantId?: string | null;
    orgId?: string | null;
  };
};

const ROOT = path.join(process.cwd(), "build", ".data");
const COPILOT_DIR = path.join(ROOT, "copilot");
const JOBS_FILE = path.join(COPILOT_DIR, "jobs.json");

// ---- FS Queue helpers -------------------------------------------------------

async function ensureFs() {
  await fs.mkdir(COPILOT_DIR, { recursive: true });
  try {
    await fs.access(JOBS_FILE);
  } catch {
    await fs.writeFile(JOBS_FILE, "[]", "utf8");
  }
}

async function readJobs(): Promise<CopilotJob[]> {
  await ensureFs();
  const raw = await fs.readFile(JOBS_FILE, "utf8").catch(() => "[]");
  try {
    const list = JSON.parse(raw) as CopilotJob[];
    return Array.isArray(list) ? list : [];
  } catch {
    // Corrupt file: reset
    await fs.writeFile(JOBS_FILE, "[]", "utf8");
    return [];
  }
}

async function writeJobs(list: CopilotJob[]) {
  // keep recent first, cap to 500
  const trimmed = list.slice(0, 500);
  await fs.writeFile(JOBS_FILE, JSON.stringify(trimmed, null, 2), "utf8");
}

// ---- Minimal validation (no external deps) ----------------------------------

function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validatePayload(body: any): {
  ok: boolean;
  reason?: string;
  source: "wizard" | "studio" | "api";
  blueprint: Record<string, any>;
  meta?: CopilotJob["meta"];
} {
  if (!isPlainObject(body)) {
    return { ok: false, reason: "Invalid JSON body.", source: "api", blueprint: {} };
  }

  const { blueprint, source, meta } = body;

  if (!isPlainObject(blueprint)) {
    return { ok: false, reason: "`blueprint` must be an object.", source: "api", blueprint: {} };
  }

  // Optional: sanity hints to catch common mistakes early
  if (blueprint.models && !isPlainObject(blueprint.models)) {
    return { ok: false, reason: "`blueprint.models` must be an object.", source: "api", blueprint };
  }

  const src: any = (source ?? "api").toString().toLowerCase();
  const srcTag: "wizard" | "studio" | "api" =
    src === "wizard" ? "wizard" : src === "studio" ? "studio" : "api";

  const cleanMeta: CopilotJob["meta"] | undefined = meta && isPlainObject(meta)
    ? {
        requestedBy: meta.requestedBy ?? null,
        notes: meta.notes ?? null,
        tenantId: meta.tenantId ?? null,
        orgId: meta.orgId ?? null,
      }
    : undefined;

  return { ok: true, source: srcTag, blueprint, meta: cleanMeta };
}

// ---- Route: POST /api/copilot/reconcile -------------------------------------

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const v = validatePayload(body);

    if (!v.ok) {
      return NextResponse.json(
        { ok: false, error: v.reason ?? "Bad Request" },
        { status: 400 }
      );
    }

    const now = new Date();
    const jobId = [
      now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14), // YYYYMMDDhhmmss
      crypto.randomBytes(6).toString("hex"),
    ].join("-");

    const job: CopilotJob = {
      id: jobId,
      status: "queued",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      source: v.source,
      blueprint: v.blueprint,
      meta: v.meta,
    };

    const jobs = await readJobs();
    jobs.unshift(job);
    await writeJobs(jobs);

    // Provide a conventional location to poll (UI may use this eventually).
    const pollUrl = `/api/copilot/jobs/${encodeURIComponent(jobId)}`;
    const uiUrl = `/cims/copilot?jobId=${encodeURIComponent(jobId)}`;

    const res = NextResponse.json(
      {
        ok: true,
        jobId,
        status: "queued",
        poll: pollUrl,
        ui: uiUrl,
      },
      { status: 202 }
    );
    res.headers.set("Location", pollUrl);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Internal error enqueuing job", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

// Optional: explicit runtime edge/node selection if needed by your project.
// export const runtime = "nodejs";