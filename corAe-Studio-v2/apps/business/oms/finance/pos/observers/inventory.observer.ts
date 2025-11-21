// apps/studio/app/business/pos/observers/inventory.observer.ts
// corAe Inventory Observer â€” 150.logic
// Watches OUT FlowEvents and, if below threshold, issues an OBARI Purchase Order
// for the upcoming 28-day slot. No dependency on item.price.

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getNextWeekRef } from "@/lib/obari/utils";
import { issueOrder } from "@/lib/obari/order";

/**
 * Observe a FlowEvent and auto-replenish if needed.
 * Called synchronously by the /stock/adjust API after creating a FlowEvent.
 */
export async function observeInventory(flowEventId: string) {
  // 1) Load the flow + linked item + current stock
  const flow = await prisma.flowEvent.findUnique({
    where: { id: flowEventId },
    include: {
      item: { include: { stock: true } },
    },
  });

  // Guard: must exist, must be OUT, must have stock state
  if (!flow || flow.direction !== "OUT" || !flow.item?.stock) return;

  const item = flow.item;
  const onHand = new Prisma.Decimal(item.stock.onHand);

  // 2) Threshold (simple global for now; can be per-item later)
  const reorderPoint = new Prisma.Decimal(10); // baseline

  if (onHand.gt(reorderPoint)) return; // nothing to do

  // 3) Compute reorder quantity from last 28 days OUT flows
  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentOut = await prisma.flowEvent.findMany({
    where: { itemId: item.id, direction: "OUT", createdAt: { gte: since } },
    select: { qty: true },
  });

  const totalOut = recentOut.reduce(
    (sum: Prisma.Decimal, f: any) => sum.add(f.qty as any),
    new Prisma.Decimal(0)
  );
  const avgWeekly = totalOut.div(4); // four weeks in 28-day cadence

  // Min 5 units, add 20% buffer
  const computed = avgWeekly.mul(1.2);
  const min = new Prisma.Decimal(5);
  const reorderQty = computed.gt(min) ? computed : min;

  // 4) Issue OBARI PO for next week; keep price safe (0) if unknown
  const po = await issueOrder({
    direction: "PURCHASE",
    itemCode: item.code,
    description: item.name,
    qty: reorderQty,
    unitPrice: 0, // price resolved/confirmed later in the OBARI flow
    expectedWeek: getNextWeekRef(),
    scheduleMode: "CYCLE_28",
    vendorCode: "Vendor0001",
    notes: `Auto-replenish @ ${new Date().toISOString().slice(0, 10)} | flow=${flow.id}`,
  });

  // 5) Log a corresponding IN planning event (so Pulse can see intent)
  await prisma.flowEvent.create({
    data: {
      itemId: item.id,
      stage: "ORDER",
      direction: "IN",
      qty: reorderQty,
      sourceRef: po.code,
    },
  });

  console.log(
    `âœ… Inventory observer: PO ${po.code} raised for ${item.code} (qty ${reorderQty.toString()})`
  );
}

