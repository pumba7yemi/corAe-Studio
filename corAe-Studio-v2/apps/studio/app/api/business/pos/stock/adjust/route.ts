/// apps/studio/app/api/business/POS/stock/adjust/route.ts
// POS Stock Adjust API — 150.logic
// Records an ADJUST_IN / ADJUST_OUT, updates StockState, logs FlowEvent,
// and (for OUT) calls the inventory observer to consider auto-replenishment.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { observeInventory } from "@/app/ship/business/oms/finance/pos/observers/inventory.observer";

export const runtime = "nodejs";

type Body = {
  code: string;
  qty: number;
  type: "ADJUST_IN" | "ADJUST_OUT";
  reason?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // Basic validation
    const code = (body.code || "").trim();
    const qtyNum = Number(body.qty);
    const type = body.type;

    if (!code || code.length < 2) {
      return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
    }
    if (!qtyNum || qtyNum <= 0 || !Number.isFinite(qtyNum)) {
      return NextResponse.json({ ok: false, error: "Invalid qty" }, { status: 400 });
    }
    if (type !== "ADJUST_IN" && type !== "ADJUST_OUT") {
      return NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
    }

    const qty = new Prisma.Decimal(qtyNum);

    // Ensure Item & StockState exist
    let item = await (prisma as any).item.findUnique({ where: { code } });
    if (!item) {
      item = await (prisma as any).item.create({
        data: { code, name: code }, // minimal seed; enrich elsewhere
      });
    }

    let stock = await (prisma as any).stockState.findFirst({ where: { itemId: item.id } });
    if (!stock) {
      stock = await (prisma as any).stockState.create({
        data: { itemId: item.id, onHand: new Prisma.Decimal(0) },
      });
    }

    // Compute new onHand
    const delta = type === "ADJUST_IN" ? qty : qty.mul(-1);
    const newOnHand = new Prisma.Decimal(stock.onHand).add(delta);
    const safeOnHand = newOnHand.lt(0) ? new Prisma.Decimal(0) : newOnHand;

    // Persist stock + flow event in a transaction
    const result = await (prisma as any).$transaction(async (tx: any) => {
      const updated = await (tx as any).stockState.update({
        where: { id: stock!.id },
        data: { onHand: safeOnHand, lastSync: new Date() },
      });

      const flow = await (tx as any).flowEvent.create({
        data: {
          itemId: item!.id,
          stage: "STOCK_ADJUST",
          direction: type === "ADJUST_IN" ? "IN" : "OUT",
          qty,
          sourceRef: body.reason || "adjustment",
        },
      });

      return { updated, flowId: flow.id };
    });

    // For OUT adjustments, run the observer (await to keep it simple+deterministic)
    if (type === "ADJUST_OUT") {
      await observeInventory(result.flowId);
    }

    return NextResponse.json({
      ok: true,
      item: { code: item.code, name: item.name },
      stock: { onHand: result.updated.onHand.toString() },
    });
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    console.error("[POS adjust] error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
