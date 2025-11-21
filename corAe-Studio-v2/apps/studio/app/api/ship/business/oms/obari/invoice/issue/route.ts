// apps/studio/app/api/business/oms/obari/invoice/issue/route.ts
// OBARI â€” Invoice Issue (from FINAL "=")
// Re-validates gates, renders a PDF invoice, and returns a public URL.
// Filesystem-only. No Prisma. No aliases.

import { NextResponse } from "next/server";
import { readdir, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ---------- Types ----------
type FinalSnap = {
  dealId: string;
  bookingId?: string | null;
  number: string;            // BDO human code
  baseHash: string;
  adjustedHash: string;
  hash: string;              // FINAL payload hash
  at: string;                // ISO
  stage: "REPORT";
  variant: "FINAL";
  currency: string;
  version: number;
  payload: string;           // canonical JSON
};

type InvoiceLine = {
  sku?: string | null;
  itemName: string;
  qty: number;
  unitPrice: number;
  taxRate: number;           // 0..1
  lineSubtotal: number;
  taxAmount: number;
  lineTotal: number;
};

type InvoiceDTO = {
  dealId: string;
  bookingId?: string | null;
  number: string;            // suggested external invoice # (from BDO + date)
  currency: string;
  totals: { subtotal: number; taxTotal: number; total: number };
  lines: InvoiceLine[];
};

type PostBody = { dealId: string; bookingId?: string };

// ---------- Helpers (FS) ----------
async function listJson(dir: string): Promise<string[]> {
  try {
    const names = await readdir(dir);
    const files: string[] = [];
    for (const n of names) {
      const p = pathJoin(dir, n);
      try {
        const s = await stat(p);
        if (s.isFile() && p.endsWith(".json")) files.push(p);
      } catch { /* ignore */ }
    }
    return files;
  } catch {
    return [];
  }
}

async function readJsonSafe<T>(p: string): Promise<T | null> {
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function newestFinal(dealId: string, bookingId?: string | null) {
  const dir = pathResolve(process.cwd(), ".data", "equals-final");
  const files = (await listJson(dir)).filter((f) => f.includes(`${dealId}-`));
  const rows: Array<{ snap: FinalSnap; file: string }> = [];
  for (const f of files) {
    const j = await readJsonSafe<FinalSnap>(f);
    if (!j) continue;
    if (j.variant !== "FINAL" || j.dealId !== dealId) continue;
    if (bookingId && (j.bookingId ?? null) !== bookingId) continue;
    rows.push({ snap: j, file: f });
  }
  if (!rows.length) return null;
  rows.sort((a, b) => (a.snap.at < b.snap.at ? 1 : -1));
  return rows[0];
}

// ---------- Helpers (math/validation) ----------
function toNum(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

const SUPPORTED_CURRENCIES = new Set(["AED", "USD", "EUR", "GBP", "ZAR"]);

function normalizeInvoiceFromFinal(final: FinalSnap): InvoiceDTO | { error: string } {
  let p: any;
  try {
    p = JSON.parse(final.payload);
  } catch {
    return { error: "Corrupt FINAL payload" };
  }

  const currency = typeof p?.currency === "string" ? p.currency : final.currency || "AED";
  if (!SUPPORTED_CURRENCIES.has(currency)) return { error: `Unsupported currency: ${currency}` };

  const linesSrc: any[] = Array.isArray(p?.lines) ? p.lines : [];
  if (!linesSrc.length) return { error: "No lines in FINAL payload" };

  const lines: InvoiceLine[] = [];
  for (const l of linesSrc) {
    const qty = toNum(l?.qty);
    const unit = toNum(l?.unitPrice);
    const rate = toNum(l?.taxRate ?? 0);
    if (![qty, unit, rate].every((n) => Number.isFinite(n) && n >= 0)) {
      return { error: "Invalid numeric values in lines" };
    }
    const lineSubtotal = +(qty * unit).toFixed(2);
    const taxAmount = +(lineSubtotal * rate).toFixed(2);
    const lineTotal = +(lineSubtotal + taxAmount).toFixed(2);
    lines.push({
      sku: typeof l?.sku === "string" ? l.sku : null,
      itemName: String(l?.itemName ?? "Line"),
      qty,
      unitPrice: unit,
      taxRate: rate,
      lineSubtotal,
      taxAmount,
      lineTotal,
    });
  }

  // Totals: trust payload if consistent, else compute
  const cSub = +lines.reduce((s, l) => s + l.lineSubtotal, 0).toFixed(2);
  const cTax = +lines.reduce((s, l) => s + l.taxAmount, 0).toFixed(2);
  const cTot = +(cSub + cTax).toFixed(2);

  const pSub = toNum(p?.totals?.subtotal);
  const pTax = toNum(p?.totals?.taxTotal);
  const pTot = toNum(p?.totals?.total);
  const near = (a: number, b: number) => Math.abs(a - b) <= 0.01;

  const totals =
    [pSub, pTax, pTot].every((n) => Number.isFinite(n) && n >= 0) &&
    near(pSub, cSub) &&
    near(pTax, cTax) &&
    near(pTot, cTot)
      ? { subtotal: +pSub.toFixed(2), taxTotal: +pTax.toFixed(2), total: +pTot.toFixed(2) }
      : { subtotal: cSub, taxTotal: cTax, total: cTot };

  const ym = final.at.replace(/[-:TZ.]/g, "").slice(0, 6); // YYYYMM
  const suggestedNumber = `INV-${final.number}-${ym}`;

  return {
    dealId: final.dealId,
    bookingId: final.bookingId ?? null,
    number: suggestedNumber,
    currency,
    totals,
    lines,
  };
}

// ---------- Helpers (PDF) ----------
async function renderInvoicePdf(dto: InvoiceDTO, provenance: { baseHash: string; adjustedHash: string; finalHash: string; finalizedAt: string }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const draw = (t: string, x: number, y: number, b = false, size = 12) =>
    page.drawText(t, { x, y, size, font: b ? bold : font, color: rgb(0.1, 0.1, 0.1) });

  // Header
  draw("corAe â€” Invoice", 40, 800, true, 18);
  draw(`Invoice No: ${dto.number}`, 40, 778, true);
  draw(`Currency: ${dto.currency}`, 300, 778);

  // Meta
  draw(`Deal ID: ${dto.dealId}`, 40, 756);
  draw(`Booking ID: ${dto.bookingId || "â€”"}`, 300, 756);
  draw(`Finalized At: ${new Date(provenance.finalizedAt).toLocaleString()}`, 40, 736);

  // Table header
  let y = 708;
  draw("Item", 40, y, true);
  draw("Qty", 280, y, true);
  draw("Unit", 330, y, true);
  draw("Tax", 390, y, true);
  draw("Total", 450, y, true);
  y -= 16;

  // Lines (cap drawing if too long to fit one page)
  for (const l of dto.lines.slice(0, 25)) {
    draw(`${l.itemName}`, 40, y);
    draw(`${l.qty}`, 280, y);
    draw(`${l.unitPrice.toFixed(2)}`, 330, y);
    draw(`${(l.taxRate * 100).toFixed(1)}%`, 390, y);
    draw(`${l.lineTotal.toFixed(2)}`, 450, y);
    y -= 16;
  }

  // Totals
  y -= 10;
  draw(`Subtotal: ${dto.totals.subtotal.toFixed(2)}`, 380, y); y -= 16;
  draw(`Tax: ${dto.totals.taxTotal.toFixed(2)}`, 380, y);     y -= 16;
  draw(`Total: ${dto.totals.total.toFixed(2)}`, 380, y, true);

  // Provenance footer
  y = 120;
  draw("Provenance (hashes):", 40, y, true); y -= 16;
  draw(`Base: ${provenance.baseHash.slice(0, 12)}â€¦`, 40, y); y -= 16;
  draw(`Adjusted: ${provenance.adjustedHash.slice(0, 12)}â€¦`, 40, y); y -= 16;
  draw(`Final: ${provenance.finalHash.slice(0, 12)}â€¦`, 40, y);

  return await pdf.save();
}

async function ensureDir(p: string) { await mkdir(p, { recursive: true }); }

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const dealId = body?.dealId?.trim();
    const bookingId = body?.bookingId?.trim();

    if (!dealId) {
      return NextResponse.json({ ok: false, error: "dealId is required" }, { status: 400 });
    }

    // Load latest FINAL for scope
    const found = await newestFinal(dealId, bookingId || null);
    if (!found) {
      return NextResponse.json({ ok: false, error: "FINAL snapshot not found" }, { status: 404 });
    }

    // Normalize + validate (re-run gates locally)
    const dto = normalizeInvoiceFromFinal(found.snap);
    if ("error" in dto) {
      return NextResponse.json({ ok: false, error: dto.error }, { status: 409 });
    }

    // Render PDF
    const bytes = await renderInvoicePdf(dto, {
      baseHash: found.snap.baseHash,
      adjustedHash: found.snap.adjustedHash,
      finalHash: found.snap.hash,
      finalizedAt: found.snap.at,
    });

    // Save to public uploads
    const baseDir = pathResolve(process.cwd(), "apps", "studio", "public", "uploads", "obari", "invoice", found.snap.dealId);
    await ensureDir(baseDir);

    const ymd = found.snap.at.replace(/[-:TZ.]/g, "").slice(0, 8);
    const fname = `${dto.number}-${ymd}-${found.snap.hash.slice(0, 10)}.pdf`;
    const disk = pathJoin(baseDir, fname);
    await writeFile(disk, bytes);

    const fileUrl = `/uploads/obari/invoice/${found.snap.dealId}/${fname}`;

    return NextResponse.json({
      ok: true,
      fileUrl,
      invoice: dto,
      provenance: {
        baseHash: found.snap.baseHash,
        adjustedHash: found.snap.adjustedHash,
        finalHash: found.snap.hash,
        finalFile: found.file.replace(process.cwd(), "."),
        finalizedAt: found.snap.at,
        version: found.snap.version,
      },
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

