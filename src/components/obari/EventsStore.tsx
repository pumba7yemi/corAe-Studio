"use client";

// OBARI — UI Event Store (Context-based, no external deps)
// Exports: EventsProvider, useEvents, makeEvent

import React, { createContext, useContext, useMemo, useRef, useState } from "react";

/* ---------- Types ---------- */
export type EventStage = "ORDERS" | "BOOKING" | "ACTIVE" | "REPORTING" | "INVOICING" | "NOTE";
export type EventStatus =
  | "placed"
  | "confirmed"
  | "running"
  | "closing"
  | "invoiced"
  | "info"
  | "warning"
  | "error";

export type UIEvent = {
  id: string;               // correlate to order/booking id if applicable
  workflowId?: string;      // script/workflow correlation
  stage: EventStage;
  status: EventStatus;
  vendor?: string | null;
  sku?: string | null;
  qty?: number | null;
  note?: string | null;
  at: string;               // ISO timestamp
};

export function makeEvent(e: Partial<UIEvent> & Pick<UIEvent, "id" | "stage" | "status">): UIEvent {
  return {
    id: e.id,
    stage: e.stage,
    status: e.status,
    workflowId: e.workflowId ?? undefined,
    vendor: e.vendor ?? null,
    sku: e.sku ?? null,
    qty: typeof e.qty === "number" ? e.qty : null,
    note: e.note ?? null,
    at: new Date().toISOString(),
  };
}

/* ---------- Context ---------- */
type CtxValue = {
  events: UIEvent[];
  publish: (ev: UIEvent) => void;
  clear: () => void;
};

const Ctx = createContext<CtxValue | null>(null);

/* ---------- Provider ---------- */
export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const seq = useRef(0);

  const value = useMemo<CtxValue>(
    () => ({
      events,
      publish: (ev: UIEvent) => {
        // Attach a monotonic suffix to preserve ordering in fast emission bursts
        seq.current += 1;
        const stamped: UIEvent = { ...ev, id: `${ev.id}:${seq.current}` };
        setEvents((prev) => [stamped, ...prev].slice(0, 500)); // keep last 500
      },
      clear: () => setEvents([]),
    }),
    [events]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ---------- Hook ---------- */
export function useEvents() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvents must be used within <EventsProvider>");
  return ctx;
}