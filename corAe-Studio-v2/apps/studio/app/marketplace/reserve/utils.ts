// apps/studio/app/marketplace/reserve/utils.ts
/**
 * corAe Reserve™ — Utility Functions
 * Helper utilities shared across API handlers, hooks, and UI.
 */

// Local type declarations to replace missing ./types module
export type ReservationDTO = {
  id: string;
  title: string;
  description: string | null;
  flowMode: string;
  btdoStage: string | null;
  status: string;
  vendorRef: string | null;
  customerRef: string | null;
  pricelockRef: string | null;
  quantity: number;
  commission: number | null;
  marginBasis: string | null;
  windowStart: string | Date | null;
  windowEnd: string | Date | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
};

export type ReserveTimelineEntry = {
  stage: string;
  at: string | Date | null;
};

import { statusFor } from "./laws/btdo.law";

/** Format timestamp into human-readable form */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Build timeline array from reservation + relations */
export function buildTimeline(reservation: any): ReserveTimelineEntry[] {
  const entries: ReserveTimelineEntry[] = [];

  if (!reservation) return entries;

  entries.push({ stage: "BOOK", at: reservation.createdAt });
  if (reservation.btdoStage === "TRADE_OPEN")
    entries.push({ stage: "TRADE_OPEN", at: reservation.updatedAt });
  if (reservation.btdoStage === "TRADE_LOCKED")
    entries.push({ stage: "TRADE_LOCKED", at: reservation.updatedAt });
  if (reservation.Deal)
    entries.push({ stage: "DEAL", at: reservation.Deal.confirmedAt });
  if (reservation.Order)
    entries.push({ stage: "ORDER", at: reservation.Order.dispatched });
  if (reservation.Order?.fulfilled)
    entries.push({ stage: "DONE", at: reservation.Order.fulfilled });

  return entries;
}

/** Normalize a ReservationDTO for client use */
export function normalizeReservation(r: any): ReservationDTO {
  return {
    id: r.id,
    title: r.title ?? "Untitled Reservation",
    description: r.description ?? null,
    flowMode: (r.flowMode as any) ?? "BDO",
    btdoStage: r.btdoStage ?? null,
    status: statusFor(r.btdoStage || "BOOK"),
    vendorRef: r.vendorRef ?? null,
    customerRef: r.customerRef ?? null,
    pricelockRef: r.pricelockRef ?? null,
    quantity: r.quantity ?? 1,
    commission: r.commission ?? null,
    marginBasis: r.marginBasis ?? null,
    windowStart: r.windowStart ?? null,
    windowEnd: r.windowEnd ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/** Combine multiple reservation timelines into unified array */
export function mergeTimelines(
  reservations: ReservationDTO[],
  limit = 50
): { id: string; stage: string; at: string | Date | null }[] {
  return reservations
    .flatMap((r) => {
      return buildTimeline(r).map((t) => ({
        id: r.id,
        stage: t.stage,
        at: t.at,
      }));
    })
    .sort((a, b) => {
      const ta = a.at ? new Date(a.at).getTime() : 0;
      const tb = b.at ? new Date(b.at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, limit);
}