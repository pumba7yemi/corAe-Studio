// apps/studio/app/api/ship/business/oms/obari/thedeal/bdo/confirm/route.ts
// OBARI ▸ BDO ▸ Confirm — seal a BDO "=" snapshot with a price-lock baton
// POST { dealId, equalsHash? } → { ok, confirm, file }

import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { createHash } from "node:crypto";

/* ───────────── Types (local) ───────────── */
type EqualsSnap = {
  dealId: string;
  at: string;
  stage: "BDO";
  number: string;
  currency: string;
  payload: string; // canonical JSON
  hash: string;    // sha256(payload)
  version: number;
};

type ConfirmBaton = {
  kind: "BDO_CONFIRM";
  dealId: string;
  at: string;            // ISO
  bdoHash: string;       // full sha256 of "=" payload
  number: string;
  currency: string;
  approvedBy: string;
  priceLock: true;
  signature: string;     // content signature for audit
  version: number;
  file: string;          // relative FS pointer
};

type PostBody = {
  dealId: string;
  equalsHash?: string;   // optional; if omitted, confirm newest "=" by at
  approvedBy?: string;   // defaults to "caia"
};

/* ───────────── FS helpers ───────────── */
async function listEquals(dealId: string) {
  const dir = pathResolve(process.cwd(), ".data", "equals");
  try {
    const fs = await import("node:fs/promises");
    const names = await fs.readdir(dir);
    const mine = names.filter(n => n.startsWith(`${dealId}-`) && n.endsWith(".json"));
    return mine.map(n => pathJoin(dir, n));
  } catch {
    return [];
  }
}

async function readJsonSafe<T>(file: string): Promise<T | null> {
  try { return JSON.parse(await readFile(file, "utf-8")) as T; } catch { return null; }
}

function newestByAt<T extends { at?: string }>(rows: Array<{ file: string; data: T }>) {
  if (!rows.length) return null;
  rows.sort((a, b) => (a.data.at ?? "") < (b.data.at ?? "") ? 1 : -1);
  return rows[0];
}

/* ───────────── crypto ───────────── */
function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

/* ───────────── Route ───────────── */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const dealId = body?.dealId?.trim();
    if (!dealId) {
      return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });
    }

    // 1) Load candidate "=" snapshots for this deal
    const files = await listEquals(dealId);
    if (!files.length) {
      return NextResponse.json({ ok: false, error: "BDO '=' not found" }, { status: 404 });
    }

    const rows: Array<{ file: string; data: EqualsSnap }> = [];
    for (const f of files) {
      const j = await readJsonSafe<EqualsSnap>(f);
      if (j?.dealId === dealId && j.stage === "BDO" && typeof j.payload === "string" && j.hash) {
        rows.push({ file: f, data: j });
      }
    }
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "No valid BDO '=' snapshots" }, { status: 404 });
    }

    // 2) Choose by provided hash or newest
    let chosen = newestByAt(rows)!;
    if (body.equalsHash) {
      const m = rows.find(r => r.data.hash.startsWith(body.equalsHash!));
      if (!m) {
        return NextResponse.json({ ok: false, error: "equalsHash not found for deal" }, { status: 404 });
      }
      chosen = m;
    }

    // 3) Compose confirm baton
    const hash = chosen.data.hash;
    const hash16 = hash.slice(0, 16);
    const approvedBy = body.approvedBy?.trim() || "caia";

    const baton: ConfirmBaton = {
      kind: "BDO_CONFIRM",
      dealId,
      at: new Date().toISOString(),
      bdoHash: hash,
      number: chosen.data.number,
      currency: chosen.data.currency,
      approvedBy,
      priceLock: true,
      signature: sha256(`${dealId}|${hash}|${approvedBy}`),
      version: 1,
      file: `.data/bdo-confirms/${dealId}-${hash16}.json`,
    };

    // 4) Write once (idempotent on hash16)
    const outDir = pathResolve(process.cwd(), ".data", "bdo-confirms");
    await mkdir(outDir, { recursive: true });
    const outFile = pathJoin(outDir, `${dealId}-${hash16}.json`);

    await writeFile(outFile, JSON.stringify(baton, null, 2), { encoding: "utf-8", flag: "wx" })
      .catch((e: any) => {
        if (e?.code === "EEXIST") return; // idempotent success
        throw e;
      });

    return NextResponse.json({ ok: true, confirm: baton, file: baton.file });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
