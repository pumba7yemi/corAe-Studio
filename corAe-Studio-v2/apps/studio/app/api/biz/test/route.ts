// apps/studio/app/api/biz/test/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/biz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

/**
 * GET -> quick health + counts from key tables
 */
export async function GET() {
  try {
    const [
      itemCats,
      items,
      partners,
      pos,
      sos,
      inventory,
      bdos,
      events,
    ] = await Promise.all([
  (prisma as any).itemCategory.count(),
  (prisma as any).item.count(),
  (prisma as any).businessPartner.count(),
  (prisma as any).purchaseOrder.count(),
  (prisma as any).salesOrder.count(),
  (prisma as any).inventory.count(),
  (prisma as any).bDO.count(),
  (prisma as any).event.count(),
    ]);

    return NextResponse.json({
      ok: true,
      db: "biz",
      counts: {
        itemCategories: itemCats,
        items,
        partners,
        purchaseOrders: pos,
        salesOrders: sos,
        inventory,
        bdos,
        events,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

/**
 * POST -> seed a minimal demo set (idempotent via upserts)
 */
export async function POST() {
  try {
    // Category
  const cat = await (prisma as any).itemCategory.upsert({
      where: { id: "seed-cat-grocery" },
      update: {},
      create: { id: "seed-cat-grocery", name: "Grocery" },
    });

    // Partner (supplier)
  const supplier = await (prisma as any).businessPartner.upsert({
      where: { id: "seed-supplier" },
      update: {},
      create: {
        id: "seed-supplier",
        name: "Demo Supplier Co.",
        isSupplier: true,
        email: "supplier@example.com",
      },
    });

    // Item
  const item = await (prisma as any).item.upsert({
      where: { id: "seed-item-001" },
      update: {},
      create: {
        id: "seed-item-001",
        name: "Bottled Water 500ml",
        type: "FINISHED_GOOD",
        sku: "WAT-500",
        unit: "EA",
        categoryId: cat.id,
        defaultSupplierId: supplier.id,
        standardCost: 0.75 as any,
        salesPrice: 1.5 as any,
      },
    });

    // Inventory record at a synthetic location (or skip if you don’t have a Location yet)
    // We'll create a lightweight location if missing
  const loc = await (prisma as any).location.upsert({
      where: { id: "seed-loc-store" },
      update: {},
      create: { id: "seed-loc-store", name: "Main Store", type: "STORE" },
    });

  await (prisma as any).inventory.upsert({
      where: { itemId_locationId: { itemId: item.id, locationId: loc.id } },
      update: {},
      create: {
        itemId: item.id,
        locationId: loc.id,
        onHand: 24 as any,
        allocated: 0 as any,
        onOrder: 0 as any,
        backorder: 0 as any,
      },
    });

    // A minimal BDO + Event
  const bdo = await (prisma as any).bDO.upsert({
      where: { id: "seed-bdo-001" },
      update: {},
      create: {
        id: "seed-bdo-001",
        name: "Water Top-up",
        tenantId: "demo",
        lastKnownStatus: "PENDING",
        estTotal: 36 as any,
        estTax: 0 as any,
      },
    });

  const ev = await (prisma as any).event.create({
      data: {
        type: "message",
        payload: { note: "Seeded via /api/biz/test POST" },
        bdoId: bdo.id,
        refType: "Seed",
        refId: "seed-evt-1",
      },
    });

    return NextResponse.json({
      ok: true,
      seeded: {
        category: cat,
        supplier,
        item,
        location: loc,
        bdo,
        event: ev,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
