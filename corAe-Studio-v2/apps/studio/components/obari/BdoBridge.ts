// Lightweight bridge so BDO can feed Orders/OMS without touching the UI.
// Usage in a React page:  const { publish } = useEvents();  const bdo = createBdoBridge(publish);

import { makeEvent, ObariEvent } from "../../components/obari/EventsStore";

export type BdoOrder = {
  id: string;             // external order id (BDO)
  workflowId: string;     // external workflow id (BDO)
  vendor: string;
  sku: string;
  qty: number;
  price?: number;
  note?: string;
  at?: string;            // ISO time; default = now
};

export type StandingSchedule = {
  // A simple 28-day standing schedule (weekly/biweekly etc.)
  // Example: { days: [1,8,15,22], qty: 120 }
  days: number[];         // 1..28
  qty: number;
  price?: number;
  note?: string;
};

export type PublishFn = (e: ObariEvent | ObariEvent[]) => void;

export function createBdoBridge(publish: PublishFn) {
  // 1) Push an ad-hoc *placed* order (immediate)
  function pushPlaced(order: BdoOrder) {
    publish(
      makeEvent({
        id: order.id,
        workflowId: order.workflowId,
        stage: "ORDERS",
        status: "placed",
        vendor: order.vendor,
        sku: order.sku,
        qty: order.qty,
        note: order.note ?? (order.price ? `Price ${order.price.toFixed(2)}` : undefined),
        at: order.at ?? new Date().toISOString(),
      })
    );
  }

  // 2) Mark vendor confirmation
  function confirm(order: BdoOrder, note = "Vendor confirmed") {
    publish(
      makeEvent({
        id: order.id,
        workflowId: order.workflowId,
        stage: "BOOKING",
        status: "confirmed",
        note,
        at: order.at ?? new Date().toISOString(),
      })
    );
  }

  // 3) Move to active/running
  function startRun(order: BdoOrder, note = "PO in execution") {
    publish(
      makeEvent({
        id: order.id,
        workflowId: order.workflowId,
        stage: "ACTIVE",
        status: "running",
        note,
        at: order.at ?? new Date().toISOString(),
      })
    );
  }

  // 4) Close & report
  function close(order: BdoOrder, note = "Cycle closing, compiling report") {
    publish(
      makeEvent({
        id: order.id,
        workflowId: order.workflowId,
        stage: "REPORTING",
        status: "closing",
        note,
        at: order.at ?? new Date().toISOString(),
      })
    );
  }

  // 5) Invoice
  function invoice(order: BdoOrder, note?: string) {
    publish(
      makeEvent({
        id: order.id,
        workflowId: order.workflowId,
        stage: "INVOICING",
        status: "invoiced",
        note: note ?? (order.price ? `Invoice issued @ ${order.price.toFixed(2)}` : "Invoice issued"),
        at: order.at ?? new Date().toISOString(),
      })
    );
  }

  // 6) Convenience: push full happy-path in one go (placed → confirmed → running → reporting → invoiced)
  function pushEndToEnd(order: BdoOrder) {
    pushPlaced(order);
    confirm(order);
    startRun(order);
    close(order);
    invoice(order);
  }

  // 7) Standing 28-day schedule helper (generate order ids & events for given days)
  function seedStanding(workflowId: string, vendor: string, sku: string, sched: StandingSchedule) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // current month for demo
    for (const d of sched.days) {
      const date = new Date(year, month, d);
      const id = `ord-${Math.random().toString(36).slice(2, 8)}`;
      const base: BdoOrder = {
        id,
        workflowId,
        vendor,
        sku,
        qty: sched.qty,
        price: sched.price,
        at: date.toISOString(),
      };
      // Place & confirm on the same day; the rest can be done by your engine or called later
      pushPlaced(base);
      confirm(base, "Standing order confirmed");
    }
  }

  return {
    pushPlaced,
    confirm,
    startRun,
    close,
    invoice,
    pushEndToEnd,
    seedStanding,
  };
}
