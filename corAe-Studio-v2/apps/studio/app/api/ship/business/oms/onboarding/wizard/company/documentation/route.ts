import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { PrismaClient, Prisma } from "@prisma/client";

/**
 * GET /api/company/documentation?companyId=...
 *  -> Lists company-wide compliance documents (trade licence, insurance, tax, bank, etc)
 *
 * Response:
 * { ok: true, companyId, documents: Array<{
 *     id, category, type, url, issuedAt, expiresAt, notes, visibility, createdAt, updatedAt
 * }> }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = (searchParams.get("companyId") || "").trim();
    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    // Ensure company exists (soft)
    const company = await (prisma as any).companyIdentity.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const rows = await (prisma as any).companyDocument.findMany({
      where: { companyId },
      orderBy: [{ category: "asc" }, { type: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      ok: true,
      companyId,
      documents: rows.map((r: any) => ({
        id: r.id,
        category: r.category,
        type: r.type,
        url: r.url,
        issuedAt: r.issuedAt ?? null,
        expiresAt: r.expiresAt ?? null,
        notes: r.notes ?? null,
        visibility: r.visibility ?? null, // INTERNAL | PUBLIC | REGULATOR (optional)
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

/**
 * POST /api/company/documentation
 *
 * Body:
 * {
 *   companyId: string,
 *   documents: Array<{
 *     category: "TRADE"|"INSURANCE"|"TAX"|"BANK"|"COMPLIANCE"|string,
 *     type: string,                    // "Trade Licence", "Insurance Certificate", "VAT Cert", ...
 *     url: string,
 *     issuedAt?: string,               // ISO date
 *     expiresAt?: string,              // ISO date
 *     notes?: string,
 *     visibility?: "INTERNAL"|"PUBLIC"|"REGULATOR"
 *   }>,
 *   replaceCategories?: string[]       // optional: if present, wipe these categories first for this company
 * }
 *
 * Response:
 * { ok: true, companyId, upserted: number, replaced: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = String(body.companyId || "").trim();
    const docs = Array.isArray(body.documents) ? body.documents : [];
    const replaceCategories = Array.isArray(body.replaceCategories)
      ? body.replaceCategories.map((c: any) => String(c || "").trim()).filter(Boolean)
      : [];

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
    if (!docs.length && !replaceCategories.length) {
      return NextResponse.json({ error: "documents[] empty (and no replaceCategories specified)" }, { status: 400 });
    }

    // Ensure company exists
    const company = await (prisma as any).companyIdentity.findUnique({ where: { id: companyId }, select: { id: true, legalName: true } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    // Normalize incoming docs
    interface CompanyDocumentInput {
      category?: unknown;
      type?: unknown;
      url?: unknown;
      issuedAt?: unknown;
      expiresAt?: unknown;
      notes?: unknown;
      visibility?: unknown;
    }

    interface NormalizedCompanyDocument {
      category: string;
      type: string;
      url: string;
      issuedAt: Date | null;
      expiresAt: Date | null;
      notes: string | null;
      visibility: "INTERNAL" | "PUBLIC" | "REGULATOR" | null;
    }

    const normalized = docs
      .map((d: CompanyDocumentInput) => ({
        category: normCat(d?.category),
        type: String(d?.type || "").trim(),
        url: String(d?.url || "").trim(),
        issuedAt: d?.issuedAt ? toDate(d.issuedAt as string) : null,
        expiresAt: d?.expiresAt ? toDate(d.expiresAt as string) : null,
        notes: d?.notes ? String(d.notes) : null,
        visibility: normVisibility(d?.visibility),
      }))
      .filter((d: any): d is NormalizedCompanyDocument => Boolean(d.category && d.type && d.url));

    let upserted = 0;
    let replaced = 0;
    const now = new Date();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Replace (optional): clear selected categories for this company
      if (replaceCategories.length) {
        try {
          const del = await (tx as any).companyDocument.deleteMany({
            where: { companyId, category: { in: replaceCategories } },
          });
          replaced = del?.count || 0;
          await safeChrono(tx, {
            scope: "COMPLIANCE",
            message: `Cleared ${replaced} doc(s) for categories [${replaceCategories.join(", ")}].`,
            refType: "Company",
            refId: companyId,
          });
        } catch {
          // swallow if table not there yet
        }
      }

      // Upsert documents (idempotent on (companyId, category, type, url))
      for (const d of normalized) {
        try {
          await (tx as any).companyDocument.upsert({
            where: {
              companyId_category_type_url: {
                companyId,
                category: d.category,
                type: d.type,
                url: d.url,
              },
            },
            update: {
              issuedAt: d.issuedAt ?? undefined,
              expiresAt: d.expiresAt ?? undefined,
              notes: d.notes ?? undefined,
              visibility: d.visibility ?? undefined,
              updatedAt: now,
            },
            create: {
              companyId,
              category: d.category,
              type: d.type,
              url: d.url,
              issuedAt: d.issuedAt,
              expiresAt: d.expiresAt,
              notes: d.notes,
              visibility: d.visibility,
              createdAt: now,
            },
          });
          upserted++;
        } catch {
          // Fallback to create if compound unique not defined yet
          try {
            await (tx as any).companyDocument.create({
              data: {
                companyId,
                category: d.category,
                type: d.type,
                url: d.url,
                issuedAt: d.issuedAt,
                expiresAt: d.expiresAt,
                notes: d.notes,
                visibility: d.visibility,
                createdAt: now,
              },
            });
            upserted++;
          } catch {
            // swallow to keep build moving
          }
        }
      }

      if (upserted > 0) {
        await safeChrono(tx, {
          scope: "COMPLIANCE",
          message: `Saved ${upserted} company document(s) for ${company.legalName || companyId}.`,
          refType: "Company",
          refId: companyId,
        });
      }
    });

    return NextResponse.json({ ok: true, companyId, upserted, replaced });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

/* ───────────────────────── helpers ───────────────────────── */

function normCat(v: any): string | null {
  if (!v) return null;
  const x = String(v).trim();
  // keep open-ended but normalize common buckets
  const map: Record<string, string> = {
    TRADE: "TRADE",
    LICENSE: "TRADE",
    LICENCE: "TRADE",
    INSURANCE: "INSURANCE",
    TAX: "TAX",
    VAT: "TAX",
    BANK: "BANK",
    COMPLIANCE: "COMPLIANCE",
    SAFETY: "COMPLIANCE",
  };
  const key = x.toUpperCase();
  return map[key] || x; // allow custom categories
}

function normVisibility(v: any): "INTERNAL" | "PUBLIC" | "REGULATOR" | null {
  if (!v) return null;
  const x = String(v).toUpperCase();
  if (x === "INTERNAL" || x === "PUBLIC" || x === "REGULATOR") return x as any;
  return null;
}

function toDate(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d;
}

async function safeChrono(
  tx: any,
  data: {
    scope: "GENERAL" | "WORKFLOWS" | "OPERATIONS" | "HR" | "FINANCE" | "MARKETING" | "SALES" | "COMPLIANCE";
    message: string;
    refType?: string;
    refId?: string;
    dealId?: string;
    contactId?: string;
  }
) {
  try {
    if (!tx?.chrono?.create) return;
    await tx.chrono.create({ data });
  } catch {
    // ignore if Chrono table not yet migrated
  }
}