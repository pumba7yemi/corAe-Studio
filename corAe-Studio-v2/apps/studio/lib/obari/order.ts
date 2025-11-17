// lib/obari/order.ts
// corAe OBARI Order Bridge — reconciled with apps/studio/prisma/schemas/obari.prisma

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentWeekRef } from "@/lib/obari/utils";

// Align with your enums in obari.prisma
export type Direction = "PURCHASE" | "SALES";               // InvoiceDirection
export type WeekRef = "W1" | "W2" | "W3" | "W4";            // WeekRef
export type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID"; // ScheduleMode

interface IssueOrderInput {
  direction: Direction;          // PURCHASE ⇒ PO, SALES ⇒ SO
  itemCode: string;              // e.g., Product0001
  description?: string;
  qty: number | Prisma.Decimal;
  unit?: string;                 // EA, KG, L (optional in your schema)
  unitPrice: number | Prisma.Decimal;
  currency?: string;             // defaults to AED via schema
  taxCode?: string | null;
  scheduleMode?: ScheduleMode;   // default CYCLE_28
  expectedWeek?: WeekRef;        // default current 28-day slot
  vendorCode?: string | null;    // set when direction = PURCHASE
  customerCode?: string | null;  // set when direction = SALES
  notes?: string | null;
}

/** Generate a human code matching your style: PO-<item>-<yyMMdd>-<short> */
function makeOrderCode(direction: Direction, itemCode: string) {
  const prefix = direction === "PURCHASE" ? "PO" : "SO";
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${itemCode}-${y}${m}${d}-${tail}`;
}

/**
 * Issue an OBARI order record.
 * Writes exactly the fields present in your ObariOrder model.
 */
export async function issueOrder(input: IssueOrderInput) {
  const {
    direction,
    itemCode,
    description,
    qty,
    unit,
    unitPrice,
    currency,        // schema has default("AED")
    taxCode,
    scheduleMode = "CYCLE_28",
    expectedWeek = getCurrentWeekRef(),
    vendorCode,
    customerCode,
    notes,
  } = input;

  if (!itemCode) throw new Error("itemCode required");
  const q = new Prisma.Decimal(qty as any);
  if (q.lte(0)) throw new Error("qty must be > 0");

  const price = new Prisma.Decimal(unitPrice as any);

  const code = makeOrderCode(direction, itemCode);

  // Map parties based on direction (soft codes until Partners module lands)
  const vendorCodeFinal   = direction === "PURCHASE" ? (vendorCode ?? "Vendor0001") : null;
  const customerCodeFinal = direction === "SALES"    ? (customerCode ?? "Customer0001") : null;

  const created = await prisma.obariOrder.create({
    data: {
      code,
      direction,             // InvoiceDirection enum
      stage: "ORDER",        // ObariStage default, explicit for clarity
      expectedWeek,          // WeekRef enum
      scheduleMode,          // ScheduleMode enum
      itemCode,
      description,
      qty: q,
      unit,
      unitPrice: price,
      currency,              // optional; Prisma will use default if undefined
      taxCode,
      vendorCode: vendorCodeFinal ?? undefined,
      customerCode: customerCodeFinal ?? undefined,
      notes,
    },
  });

  return created;
}
