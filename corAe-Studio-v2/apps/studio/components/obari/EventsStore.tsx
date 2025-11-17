"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * OBARI Shared Event Store
 * - Persists to localStorage so /obari (engine) and /ship/business/oms/obari (lifecycle)
 *   see the same live data.
 * - API: publish(), useEvents(), useEventsByStage(), clear().
 */

export type ObariStage = "ORDERS" | "BOOKING" | "ACTIVE" | "REPORTING" | "INVOICING";
export type ObariStatus = "placed" | "confirmed" | "running" | "closing" | "invoiced" | "failed";

export type ObariEvent = {
  id: string;           // order id
  workflowId: string;   // workflow id
  stage: ObariStage;
  status: ObariStatus;
  vendor: string;
  sku: string;
  qty?: number;
  note?: string;
  at: string;           // ISO time
};

type Store = {
  events: ObariEvent[];
  publish: (e: ObariEvent | ObariEvent[]) => void;
  clear: () => void;
};

const LS_KEY = "corae.obari.events.v1";
const Ctx = createContext<Store | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ObariEvent[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as ObariEvent[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(events));
    } catch {}
  }, [events]);

  function publish(e: ObariEvent | ObariEvent[]) {
    setEvents((prev) => {
      const add = Array.isArray(e) ? e : [e];
      const seen = new Set(prev.map((x) => `${x.id}:${x.at}:${x.stage}:${x.status}`));
      const merged = [...prev];
      for (const ev of add) {
        const key = `${ev.id}:${ev.at}:${ev.stage}:${ev.status}`;
        if (!seen.has(key)) {
          merged.push(ev);
          seen.add(key);
        }
      }
      merged.sort((a, b) => (a.at < b.at ? 1 : -1));
      return merged;
    });
  }

  function clear() {
    setEvents([]);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }

  const value = useMemo<Store>(() => ({ events, publish, clear }), [events]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEvents() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvents must be used inside <EventsProvider>");
  return ctx;
}

// Safe variant that returns a no-op fallback when the provider is absent.
export function useEventsSafe() {
  const ctx = useContext(Ctx);
  return ctx ?? { events: [], publish: (_: any) => {}, clear: () => {} };
}

export function useEventsByStage(stage: ObariStage | ObariStage[]) {
  const { events } = useEvents();
  const set = new Set(Array.isArray(stage) ? stage : [stage]);
  return events.filter((e) => set.has(e.stage));
}

export function makeEvent(
  p: Partial<ObariEvent> & Pick<ObariEvent, "id" | "workflowId" | "stage" | "status">
): ObariEvent {
  return {
    vendor: "Demo Partner",
    sku: "SKU-PEPSI-500",
    qty: undefined,
    note: undefined,
    at: new Date().toISOString(),
    ...p,
  };
}

export function StageBadge({ stage }: { stage: ObariStage }) {
  const tone =
    stage === "ORDERS"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : stage === "BOOKING"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : stage === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : stage === "REPORTING"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${tone}`}>{stage}</span>;
}

export function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
