// apps/studio/app/api/retail/products/route.ts
// corAe OS² • Retail Engine API — Products
// - GET: list/search products with pagination + filters
// - POST: create a product (Phase-1 image fallback -> /products/<SKU>.jpg)
//
// Schema dependency: prisma/retail.prisma
//
// Notes:
// • Image rules: if no imageUrl provided, we default to `/products/<SKU>.jpg` (Phase 1).
// • Add remote domains in next.config when you switch to CDN.
// • Extend safely later with PATCH/DELETE in /api/retail/products/[id]/route.ts.

/* eslint-disable */
import { NextResponse } from "next/server";

// Define Unit type used by this module
type Unit = "pc" | "kg" | "box" | "pack" | "litre" | "dozen";

// Minimal Prisma ambient types moved to a separate declaration file (../../types/prisma-ambient.d.ts)
// to avoid module augmentation errors in module files.

// Use a runtime require with a fallback so TypeScript/tsc won't error when @prisma/client is
// not available in the environment (e.g. CI, editor without deps installed).
// Safe Prisma client initialization. We import the generated client at runtime
// and attach a singleton to globalThis to avoid re-instantiation in dev.
let prisma: any;
try {
  // Prefer the installed Prisma client when available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as { prisma?: any };
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
  if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
} catch (e) {
  // If Prisma client isn't available (e.g., editor without deps), provide a minimal stub
  prisma = {
    $transaction: async (arr: any[]) => Promise.all(arr.map((fn) => (typeof fn === 'function' ? fn() : fn))),
    product: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
    },
  };
}

/* ----------------------------- GET /products ------------------------------
Query params:
- q?: string               (matches name, sku, brand)
- categoryId?: string
- vendorId?: string
- activeOnly?: "true"|"false" (default true)
- page?: number            (1-based)
- pageSize?: number        (default 24, max 100)
--------------------------------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const vendorId = searchParams.get("vendorId") ?? undefined;
    const activeOnly = (searchParams.get("activeOnly") ?? "true") === "true";
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const rawSize = parseInt(searchParams.get("pageSize") ?? "24", 10) || 24;
    const pageSize = Math.min(Math.max(rawSize, 1), 100);

    const where: any = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      (prisma as any).product.count({ where }),
      (prisma as any).product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, code: true, name: true } },
          images: { select: { id: true, url: true, alt: true, isPrimary: true } },
        },
        orderBy: [{ name: "asc" }, { sku: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // Ensure Phase-1 image fallback in response if no primary image & no imageUrl set
    const normalized = items.map((p: any) => ({
      ...p,
      imageUrl: p.imageUrl ?? `/products/${p.sku}.jpg`,
    }));

    return NextResponse.json({
      page,
      pageSize,
      total,
      items: normalized,
    });
  } catch (err: any) {
    console.error("GET /api/retail/products error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 },
    );
  }
}

/* ----------------------------- POST /products -----------------------------
Body (JSON):
{
  sku: string,
  name: string,
  retailPrice: number,
  costPrice: number,
  unit?: "pc"|"kg"|"box"|"pack"|"litre"|"dozen" (default "pc"),
  unitSize?: string,
  brand?: string,
  description?: string,
  vendorId?: string,
  categoryId?: string,
  vatRate?: number,           // e.g., 5.00
  imageUrl?: string,          // if omitted -> /products/<SKU>.jpg
  thumbnailUrl?: string,
  blurDataUrl?: string,
  reorderThreshold?: number,  // default 0
  suggestedOrderQty?: number, // default 0
  leadTimeDays?: number,      // default 3
  cycleLengthDays?: number    // default 28
}
--------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Minimal validation without external deps
    const errors: string[] = [];
    function num(n: any, name: string, reqd = false) {
      if (n === undefined || n === null) {
        if (reqd) errors.push(`${name} is required`);
        return undefined;
      }
      const v = Number(n);
      if (Number.isNaN(v)) errors.push(`${name} must be a number`);
      return v;
    }
    function str(s: any, name: string, reqd = false) {
      if (s === undefined || s === null) {
        if (reqd) errors.push(`${name} is required`);
        return undefined;
      }
      const v = String(s).trim();
      if (!v && reqd) errors.push(`${name} cannot be empty`);
      return v;
    }

    const sku = str(data.sku, "sku", true)!;
    const name = str(data.name, "name", true)!;
    const retailPrice = num(data.retailPrice, "retailPrice", true)!;
    const costPrice = num(data.costPrice, "costPrice", true)!;

    const unitRaw = (data.unit ?? "pc") as Unit;
    const unit: Unit = ["pc", "kg", "box", "pack", "litre", "dozen"].includes(unitRaw)
      ? unitRaw
      : "pc";

    const payload = {
      sku,
      name,
      brand: str(data.brand, "brand"),
      description: str(data.description, "description"),
      unit,
      unitSize: str(data.unitSize, "unitSize"),
      retailPrice,
      costPrice,
      vatRate: data.vatRate !== undefined ? num(data.vatRate, "vatRate") : undefined,
      categoryId: str(data.categoryId, "categoryId"),
      vendorId: str(data.vendorId, "vendorId"),
      imageUrl: data.imageUrl ? str(data.imageUrl, "imageUrl") : `/products/${sku}.jpg`,
      thumbnailUrl: str(data.thumbnailUrl, "thumbnailUrl"),
      blurDataUrl: str(data.blurDataUrl, "blurDataUrl"),
      reorderThreshold:
        data.reorderThreshold !== undefined ? Math.max(0, parseInt(data.reorderThreshold, 10) || 0) : 0,
      suggestedOrderQty:
        data.suggestedOrderQty !== undefined ? Math.max(0, parseInt(data.suggestedOrderQty, 10) || 0) : 0,
      leadTimeDays:
        data.leadTimeDays !== undefined ? Math.max(0, parseInt(data.leadTimeDays, 10) || 0) : 3,
      cycleLengthDays:
        data.cycleLengthDays !== undefined ? Math.max(1, parseInt(data.cycleLengthDays, 10) || 28) : 28,
      isActive: true,
      trackExpiry: Boolean(data.trackExpiry ?? false),
    };

    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Enforce unique SKU at app level (DB has unique too)
    const exists = await (prisma as any).product.findUnique({ where: { sku } });
    if (exists) {
      return NextResponse.json(
        { error: `Product with SKU "${sku}" already exists.` },
        { status: 409 },
      );
    }

    const created = await (prisma as any).product.create({
      data: payload as any,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        vendor: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/retail/products error:", err);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}