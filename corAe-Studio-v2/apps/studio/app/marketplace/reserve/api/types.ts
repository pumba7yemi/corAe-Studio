// apps/studio/app/marketplace/reserve/types.ts
/**
 * corAe Reserve™ — Shared Types
 * Used across API, Hooks, and UI layers.
 */

export type FlowMode = "BDO" | "BTDO";
export type ReserveStage =
  | "BOOK"
  | "TRADE_OPEN"
  | "TRADE_LOCKED"
  | "DEAL"
  | "ORDER"
  | "DONE";

export interface ReservationDTO {
  id: string;
  title?: string;
  description?: string | null;
  flowMode: FlowMode;
  btdoStage?: ReserveStage | null;
  status: string;
  vendorRef?: string | null;
  customerRef?: string | null;
  pricelockRef?: string | null;
  quantity?: number;
  commission?: number | null;
  marginBasis?: number | null;
  windowStart?: string | null;
  windowEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealDTO {
  id: string;
  reservationId: string;
  price?: number | null;
  terms?: string | null;
  status: string;
  confirmedAt: string;
}

export interface OrderDTO {
  id: string;
  dealId: string;
  status: string;
  amount?: number | null;
  dispatched?: string | null;
  fulfilled?: string | null;
  invoiced?: string | null;
}

export interface ReserveTimelineEntry {
  stage: ReserveStage | string;
  at: string;
}

export interface ReserveAPIResponse<T> {
  ok: boolean;
  error?: string;
  data?: T;
}