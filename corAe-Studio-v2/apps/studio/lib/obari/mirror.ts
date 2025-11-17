// apps/studio/lib/obari/mirror.ts
// OBARI — Paired (Brokerage) Orders with optional parallel bookings · 150.logic

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentWeekRef } from "@/lib/obari/utils";

export type WeekRef = "W1" | "W2" | "W3" | "W4";
export type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

type Decimalish = number | string | Prisma.Decimal;

export interface PairedDealInput {
  dealRef: string;                 // e.g., BDO-001
  itemCode: string;                // product/service code
  description?: string | null;
  qty: Decimalish;                 // same qty for buy/sell
  unit?: string | null;            // EA/KG/L
  currency?: string | null;        // defaults to AED in schema
  scheduleMode?: ScheduleMode;     // default CYCLE_28
  expectedWeek?: WeekRef;          // default current
  vendorCode: string;              // PURCHASE side party
  customerCode: string;            // SALES side party
  buyUnitPrice: Decimalish;        // X
  sellUnitPrice: Decimalish;       // X + Δ (precomputed by caller if needed)
  taxCode?: string | null;
  notes?: string | null;

  // Optional parallel transport/delivery booking for the same BTDO phase
  booking?: {
    datePlannedISO?: string;       // planned date-time
    pickupLocation?: string;       // free text (e.g., Vendor Site)
    dropLocation?: string;         // free text (e.g., Customer Site)
    specialInst?: string;          // handling notes
    // If provided, we create two bookings (inbound & outbound) unless compact=true
    compact?: boolean;             // when true, create a single booking on PURCHASE order
  };
}

export interface PairedDealResult {
  ok: true;
  weekRef: WeekRef;
  purchase: { id: string; code: string };
  sales: { id: string; code: string };
  bookings?: {
    inbound?: { id: string; bookingRef: string };
    outbound?: { id: string; bookingRef: string };
  };
}

/**
 * Create paired PURCHASE + SALES orders atomically.
 * Optionally create parallel transport/delivery bookings within the same transaction.
 */
export async function issuePairedOrdersForDeal(input: PairedDealInput): Promise<PairedDealResult | { ok: false; error: string }> {
  try {
    const {
      dealRef,
      itemCode,
      description,
      qty,
      unit,
      currency,
      scheduleMode = "CYCLE_28",
      expectedWeek = getCurrentWeekRef(),
      vendorCode,
      customerCode,
      buyUnitPrice,
      sellUnitPrice,
      taxCode,
      notes,
      booking,
    } = input;

    if (!dealRef) throw new Error("dealRef required");
    if (!itemCode) throw new Error("itemCode required");
    if (!vendorCode) throw new Error("vendorCode required");
    if (!customerCode) throw new Error("customerCode required");

    const q = new Prisma.Decimal(qty as any);
    if (q.lte(0)) throw new Error("qty must be > 0");

    const buy = new Prisma.Decimal(buyUnitPrice as any);
    const sell = new Prisma.Decimal(sellUnitPrice as any);
    if (buy.lt(0) || sell.lt(0)) throw new Error("unit prices must be >= 0");

    // Helper for human codes
    const mkCode = (prefix: "PO" | "SO") => {
      const now = new Date();
      const y = String(now.getFullYear()).slice(-2);
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${prefix}-${itemCode}-${y}${m}${d}-${tail}`;
    };

    const purchaseCode = mkCode("PO");
    const salesCode = mkCode("SO");

  const result = await prisma.$transaction(async (tx: any) => {
      // PURCHASE (from vendor)
    const purchase = await (tx as any).obariOrder.create({
        data: {
          code: purchaseCode,
          direction: "PURCHASE",
          stage: "ORDER",
          expectedWeek,
          scheduleMode,
          itemCode,
          description,
          qty: q,
          unit,
          unitPrice: buy,
          currency: currency ?? undefined,
          taxCode: taxCode ?? undefined,
          vendorCode,
          notes: noteWithDeal(notes, dealRef, "PURCHASE"),
        },
        select: { id: true, code: true },
      });

      // SALES (to customer)
    const sales = await (tx as any).obariOrder.create({
        data: {
          code: salesCode,
          direction: "SALES",
          stage: "ORDER",
          expectedWeek,
          scheduleMode,
          itemCode,
          description,
          qty: q,
          unit,
          unitPrice: sell,
          currency: currency ?? undefined,
          taxCode: taxCode ?? undefined,
          customerCode,
          notes: noteWithDeal(notes, dealRef, "SALES"),
        },
        select: { id: true, code: true },
      });

      const bookings: PairedDealResult["bookings"] = {};

      if (booking) {
        const when = booking.datePlannedISO ? new Date(booking.datePlannedISO) : new Date();

        if (booking.compact === true) {
          // Single booking attached to PURCHASE — indicates BTDO phase transport slated.
          const b1 = await (tx as any).obariBooking.create({
            data: {
              bookingRef: makeBookingRef("BK", dealRef),
              orderId: purchase.id,
              datePlanned: when,
              location: compactLocation(booking),
              specialInst: booking.specialInst ?? undefined,
              notes: `BDO:${dealRef} | MIRROR:PO→SO | compact`,
            } as any, // allow notes if your schema includes it; otherwise remove
            select: { id: true, bookingRef: true },
          });
          bookings.inbound = b1;
        } else {
          // Two legs: inbound (vendor→hub) and outbound (hub→customer)
          const inbound = await (tx as any).obariBooking.create({
            data: {
              bookingRef: makeBookingRef("BK-IN", dealRef),
              orderId: purchase.id,
              datePlanned: when,
              location: `Pickup:${booking.pickupLocation ?? "Vendor"} → Drop:Hub`,
              specialInst: booking.specialInst ?? undefined,
              notes: `BDO:${dealRef} | inbound`,
            } as any,
            select: { id: true, bookingRef: true },
          });

          const outbound = await (tx as any).obariBooking.create({
            data: {
              bookingRef: makeBookingRef("BK-OUT", dealRef),
              orderId: sales.id,
              datePlanned: when,
              location: `Pickup:Hub → Drop:${booking.dropLocation ?? "Customer"}`,
              specialInst: booking.specialInst ?? undefined,
              notes: `BDO:${dealRef} | outbound`,
            } as any,
            select: { id: true, bookingRef: true },
          });

          bookings.inbound = inbound;
          bookings.outbound = outbound;
        }
      }

      const weekRef = expectedWeek ?? getCurrentWeekRef();
      const payload: PairedDealResult = {
        ok: true,
        weekRef,
        purchase,
        sales,
        bookings: Object.keys(bookings).length ? bookings : undefined,
      };
      return payload;
    });

    return result;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

/* ------------------------ helpers ------------------------ */

function noteWithDeal(base: string | null | undefined, dealRef: string, side: "PURCHASE" | "SALES") {
  const tag = `[BDO:${dealRef} ${side}]`;
  return base ? `${base} ${tag}` : tag;
}

function makeBookingRef(prefix: string, dealRef: string) {
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${dealRef}-${tail}`;
}

function compactLocation(b: NonNullable<PairedDealInput["booking"]>) {
  const pick = b.pickupLocation ?? "Vendor";
  const drop = b.dropLocation ?? "Customer";
  return `Pickup:${pick} → Drop:${drop}`;
}
