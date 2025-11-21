// apps/studio/app/marketplace/reserve/api/cims.ts
type CimsPayload = {
  kind:
    | "reserve.booked"
    | "reserve.trade.opened"
    | "reserve.pricelocked"
    | "reserve.deal.confirmed"
    | "reserve.order.dispatched";
  refId: string;
  title?: string | null;
  vendorRef?: string | null;
  customerRef?: string | null;
  meta?: Record<string, any>;
};

/** Dev-safe CIMS sender (logs now, swap with real CIMS adapter later) */
export async function sendCims(payload: CimsPayload) {
  try {
    // TODO: replace with CIMS endpoint call
    console.info("[CIMS]", JSON.stringify(payload));
  } catch (e) {
    console.warn("[CIMS] send failed:", (e as Error).message);
  }
}