// app/api/business/pos/import/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { Prisma } from "@prisma/client";

/**
 * POST /api/business/pos/import
 *
 * Accepts:
 *  - text/csv      (UTF-8)
 *  - application/json  → { rows: Array<Row>, dryRun?: boolean }
 *
 * CSV headers supported (case-insensitive, spaces ignored):
 *   code,name,price,taxRate,barcode,imageUrl,onHand
 *
 * Notes:
 *  - Upsert by Item.code (unique) or barcode (if provided)
 *  - Creates StockState if missing; sets onHand if provided
 *  - dryRun=true validates and reports without DB writes
 *  - Hard row cap: 500 per request (150.logic safety)
 */

type Row = {
  code: string;
  name: string;
  price?: number | string;
  taxRate?: number | string;
  barcode?: string | null;
  imageUrl?: string | null;
  onHand?: number | string | null;
};

const MAX_ROWS = 500;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let rows: Row[] = [];
    let dryRun = false;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      rows = normalizeRows(Array.isArray(body) ? body : body.rows || []);
      dryRun = Boolean((body && body.dryRun) || false);
    } else if (contentType.includes("text/csv")) {
      const csv = await req.text();
      rows = parseCsvToRows(csv);
      dryRun = false; // CSV path: no dryRun flag
    } else {
      return NextResponse.json(
        { ok: false, error: "Unsupported content-type. Use text/csv or application/json." },
        { status: 415 }
      );
    }

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "No rows supplied." }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { ok: false, error: `Too many rows. Max ${MAX_ROWS} per request.` },
        { status: 400 }
      );
    }

    // Validate rows
    const problems: Array<{ index: number; issue: string }> = [];
    const clean: Row[] = [];

    rows.forEach((r, idx) => {
      const code = String(r.code || "").trim();
      const name = String(r.name || "").trim();
      const price = toNumber(r.price, 0);
      const taxRate = toOptionalNumber(r.taxRate);
      const barcode = toOptionalString(r.barcode);
      const imageUrl = toOptionalString(r.imageUrl);
      const onHand = toOptionalNumber(r.onHand);

      if (code.length < 3) problems.push({ index: idx, issue: "code must be at least 3 chars" });
      if (name.length < 2) problems.push({ index: idx, issue: "name must be at least 2 chars" });
      if (price < 0) problems.push({ index: idx, issue: "price cannot be negative" });
      if (taxRate != null && (taxRate < 0 || taxRate > 100))
        problems.push({ index: idx, issue: "taxRate out of range (0..100)" });
      if (onHand != null && onHand < 0) problems.push({ index: idx, issue: "onHand cannot be negative" });

  clean.push({ code, name, price, taxRate, barcode, imageUrl, onHand: onHand ?? undefined } as any);
    });

    if (problems.length) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", problems, sample: clean.slice(0, 3) },
        { status: 400 }
      );
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        count: clean.length,
        preview: clean.slice(0, 5),
      });
    }
  // Perform upserts in a transaction (chunked for safety if needed)
            const results = await prisma.$transaction(async (tx: any) => {
              let created = 0;
              let updated = 0;
        
              for (const r of clean) {
                // Try to find by code (primary key for catalog)
                const existing = await tx.item.findUnique({ where: { code: r.code } });
        
                if (existing) {
                  await tx.item.update({
                    where: { code: r.code },
                    data: {
                      name: r.name,
                      price: new Decimal(r.price ?? 0),
                      taxRate: r.taxRate != null ? new Decimal(r.taxRate) : null,
                      barcode: r.barcode || null,
                      imageUrl: r.imageUrl || null,
                      isActive: true,
                    },
                  });
                  updated++;
        
                  // StockState upsert and optional onHand set
                  await tx.stockState.upsert({
                    where: { itemId: existing.id },
                    create: {
                      itemId: existing.id,
                      onHand: new Decimal(r.onHand ?? 0),
                    },
                    update: r.onHand != null ? { onHand: new Decimal(r.onHand) } : {},
                  });
                } else {
                  const createdItem = await tx.item.create({
                    data: {
                      code: r.code,
                      name: r.name,
                      price: new Decimal(r.price ?? 0),
                      taxRate: r.taxRate != null ? new Decimal(r.taxRate) : null,
                      barcode: r.barcode || null,
                      imageUrl: r.imageUrl || null,
                      isActive: true,
                    },
                  });
                  created++;
        
                  await tx.stockState.create({
                    data: {
                      itemId: createdItem.id,
                      onHand: new Decimal(r.onHand ?? 0),
                    },
                  });
                }
              }
        
              return { created, updated };
            });

    return NextResponse.json({
      ok: true,
      ...results,
      total: clean.length,
      message: `Import complete: ${results.created} created, ${results.updated} updated.`,
    });
  } catch (err) {
    // Unique constraint clarity for code / barcode
    const msg = String((err as any)?.message || "");
    if (msg.includes("Unique") && msg.includes("barcode")) {
      return NextResponse.json(
        { ok: false, error: "Duplicate barcode encountered in DB. Resolve and retry." },
        { status: 409 }
      );
    }
    if (msg.includes("Unique") && msg.includes("code")) {
      return NextResponse.json(
        { ok: false, error: "Duplicate code encountered in DB. Use update path." },
        { status: 409 }
      );
    }
      console.error("[POS Import Error]", err);
      return NextResponse.json({ ok: false, error: msg || "Unknown error" }, { status: 500 });
  }
}

/* ---------------- helpers (150.logic, no deps) ---------------- */

function toNumber(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function toOptionalNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toOptionalString(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function normalizeRows(arr: any[]): Row[] {
  return arr.map((r) => ({
    code: String(r.code ?? "").trim(),
    name: String(r.name ?? "").trim(),
    price: r.price,
    taxRate: r.taxRate,
    barcode: r.barcode,
    imageUrl: r.imageUrl,
    onHand: r.onHand,
  }));
}

function parseCsvToRows(csv: string): Row[] {
  const lines = csv.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];

  const header = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));

  const idx = (name: string) => header.indexOf(name);

  const iCode = idx("code");
  const iName = idx("name");
  const iPrice = idx("price");
  const iTax = idx("taxrate");
  const iBarcode = idx("barcode");
  const iImage = idx("imageurl");
  const iOnHand = idx("onhand");

  const out: Row[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cols = safeSplitCsvLine(lines[li]);
    const row: Row = {
      code: (cols[iCode] ?? "").trim(),
      name: (cols[iName] ?? "").trim(),
      price: cols[iPrice],
      taxRate: cols[iTax],
      barcode: cols[iBarcode],
      imageUrl: cols[iImage],
      onHand: cols[iOnHand],
    };
    out.push(row);
  }
  return out;
}

/** Minimal CSV splitter (handles quoted commas) */
function safeSplitCsvLine(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'; // escaped quote
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }

    if (ch === "," && !inQ) {
      res.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  res.push(cur);
  return res.map((s) => s.trim());
}
