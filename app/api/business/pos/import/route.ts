import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

type Row = { code: string; name: string; price?: number|string|null; taxRate?: number|string|null; barcode?: string|null; imageUrl?: string|null; onHand?: number|string|null; };
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
      dryRun = false;
    } else {
      return jsonResponse({ ok: false, error: "Unsupported content type" }, 415);
    }

    if (!rows.length) return jsonResponse({ ok: false, error: "No rows supplied." }, 400);
    if (rows.length > MAX_ROWS) return jsonResponse({ ok: false, error: `Too many rows. Max ${MAX_ROWS}.` }, 400);

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
      if (taxRate != null && (taxRate < 0 || taxRate > 100)) problems.push({ index: idx, issue: "taxRate out of range (0..100)" });
      if (onHand != null && onHand < 0) problems.push({ index: idx, issue: "onHand cannot be negative" });

      clean.push({ code, name, price, taxRate, barcode, imageUrl, onHand });
    });

    if (problems.length) return jsonResponse({ ok: false, error: "Validation failed", problems, sample: clean.slice(0, 3) }, 400);
    if (dryRun) return jsonResponse({ ok: true, dryRun: true, count: clean.length, preview: clean.slice(0, 5) });

    const results = await prisma.$transaction(async (tx: any) => {
      let created = 0;
      let updated = 0;
      for (const r of clean) {
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
          await tx.stockState.upsert({
            where: { itemId: existing.id },
            create: { itemId: existing.id, onHand: new Decimal(r.onHand ?? 0) },
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
          await tx.stockState.create({ data: { itemId: createdItem.id, onHand: new Decimal(r.onHand ?? 0) } });
        }
      }
      return { created, updated };
    });

    return jsonResponse({ ok: true, ...results, total: rows.length, message: `Import complete: ${results.created} created, ${results.updated} updated.` });
  } catch (err: any) {
    console.error("[POS Import Error]", err);
    const msg = String(err?.message || "");
    if (msg.includes("Unique") && msg.includes("barcode")) return jsonResponse({ ok: false, error: "Duplicate barcode encountered." }, 409);
    if (msg.includes("Unique") && msg.includes("code")) return jsonResponse({ ok: false, error: "Duplicate code encountered." }, 409);
    return jsonResponse({ ok: false, error: err?.message ?? "Unknown error" }, 500);
  }
}

/* helpers */
function toNumber(v: any, fb = 0) { if (v == null || v === "") return fb; const n = Number(v); return Number.isFinite(n) ? n : fb; }
function toOptionalNumber(v: any) { if (v == null || v === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function toOptionalString(v: any) { if (v == null) return null; const s = String(v).trim(); return s.length ? s : null; }
function normalizeRows(arr: any[]) { return arr.map((r) => ({ code: String(r.code ?? "").trim(), name: String(r.name ?? "").trim(), price: r.price, taxRate: r.taxRate, barcode: r.barcode, imageUrl: r.imageUrl, onHand: r.onHand })); }

function parseCsvToRows(csv: string) {
  const lines = csv.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
  const idx = (n: string) => header.indexOf(n);
  const iCode = idx("code"), iName = idx("name"), iPrice = idx("price"), iTax = idx("taxrate"), iBarcode = idx("barcode"), iImage = idx("imageurl"), iOnHand = idx("onhand");
  const out: any[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cols = safeSplitCsvLine(lines[li]);
    out.push({ code: (cols[iCode] ?? "").trim(), name: (cols[iName] ?? "").trim(), price: cols[iPrice], taxRate: cols[iTax], barcode: cols[iBarcode], imageUrl: cols[iImage], onHand: cols[iOnHand] });
  }
  return out;
}
function safeSplitCsvLine(line: string) {
  const res: string[] = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\"') { if (inQ && line[i + 1] === '\"') { cur += '\"'; i++; } else { inQ = !inQ; } continue; }
    if (ch === ',' && !inQ) { res.push(cur); cur = ""; continue; }
    cur += ch;
  }
  res.push(cur);
  return res.map(s => s.trim());
}
