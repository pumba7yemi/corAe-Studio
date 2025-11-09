// app/BDO/pos/stock/reconcile.ts
/* ============================================================
   corAe POS Autonomous Stock Reconciliation
   - Aligned with 150-Logic schema (Item, StockState, FlowEvent)
   - Runs on Pulse (no buttons, no manual input)
   ============================================================ */

import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient();

type FlowEventLite = {
  id: string;
  itemId: string;
  direction?: string;
  qty?: number | string | null;
  createdAt?: string | Date;
  [k: string]: any;
};

export async function runStockReconciliation() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 1); // last 24h

  // 1️⃣ Gather unprocessed flow events within window
  const events = await (prisma as any).flowEvent.findMany({
    where: {
      createdAt: { gte: start, lte: now },
    },
    select: { id: true, itemId: true, direction: true, qty: true },
  }) as FlowEventLite[];

  if (!events.length) {
    console.log("✅ No new stock movements to reconcile.");
    return { ok: true, message: "No movements" };
  }

  // 2️⃣ Calculate net deltas for each item
  const deltaByItem: Record<string, number> = {};
  for (const e of events) {
    const q = Number(e.qty || 0);
    const delta = e.direction === "IN" ? q : -q;
    deltaByItem[e.itemId] = (deltaByItem[e.itemId] || 0) + delta;
  }

  // 3️⃣ Apply deltas to StockState
  await prisma.$transaction(async (tx: any) => {
    for (const [itemId, delta] of Object.entries(deltaByItem)) {
      const level = await tx.stockState.upsert({
        where: { itemId },
        update: { onHand: { increment: delta }, lastSync: now },
        create: { itemId, onHand: Math.max(0, delta), lastSync: now },
      });

      // Optional safeguard: never negative
      if (Number(level.onHand) < 0) {
        await tx.stockState.update({
          where: { itemId },
          data: { onHand: 0 },
        });
      }
    }
  });

  // 4️⃣ Log reconciliation as a FlowEvent summary
  await (prisma as any).flowEvent.create({
    data: {
      itemId: "system",
      stage: "RECONCILE",
      direction: "IN",
      qty: 0,
      sourceRef: `AUTO-RECONCILE-${now.toISOString().slice(0, 10)}`,
    },
  });

  console.log(`✅ Reconciled ${Object.keys(deltaByItem).length} items.`);
  return { ok: true, updated: Object.keys(deltaByItem).length };
}
