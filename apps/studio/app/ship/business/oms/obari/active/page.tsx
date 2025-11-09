// apps/studio/app/ship/business/oms/obari/active/page.tsx
"use client";

/**
 * OBARI — Active (Stage 4)
 * - If ?dealId=… is present, shows a banner that the deal is Active (Pricelock + SLA attached)
 * - Lists all booked/active orders via the repo singleton (with a safe fallback)
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ArrowNav from "@/components/navigation/ArrowNav";

type ActiveRecord = {
  booking_id: string;
  order_no: string;
  direction: "inbound" | "outbound";
  when_iso: string;
  status: "booked" | "active" | "complete";
};

export default function ObariActivePage() {
  // safe client-only param getter
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const dealId = getParam("dealId") || "";
  const [rows, setRows] = useState<ActiveRecord[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try to import the in-app singleton (dev/proto)
        const mod = (await import("@/app/api/ship/business/oms/obari/_singletons").catch(() => null)) as
          | { repo?: { list: () => Promise<any[]> } }
          | null;

        let list: any[] = [];

        if (mod?.repo?.list) {
          list = await mod.repo.list();
        } else {
          // Fallback mock so the page never breaks
          list = [
            {
              booking_id: "bk_001",
              order_no: "SO-1001",
              direction: "outbound",
              when_iso: new Date().toISOString(),
              status: "active",
            },
          ];
        }

        const active = list
          .filter((r: any) => r?.status === "booked" || r?.status === "active")
          .map((r: any): ActiveRecord => ({
            booking_id: String(r.booking_id ?? r.id ?? "unknown"),
            order_no: String(r.order_no ?? r.so_no ?? r.po_no ?? "—"),
            direction:
              r.direction === "inbound" || r.direction === "outbound"
                ? r.direction
                : "inbound",
            when_iso: String(r.when_iso ?? r.createdAt ?? new Date().toISOString()),
            status:
              r.status === "booked" || r.status === "active" || r.status === "complete"
                ? r.status
                : "booked",
          }));

        if (!cancelled) setRows(active);
      } catch (e: any) {
        if (!cancelled) setMsg(`❌ ${e?.message || "Failed to load active records"}`);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-6 space-y-6 flex flex-col min-h-screen text-zinc-100">
      {/* Header */}
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Active</h1>
        <p className="muted">Orders currently booked or in progress.</p>
      </header>

      {/* Deal banner (if query param present) */}
      {dealId && (
        <section className="rounded-2xl border border-emerald-900/40 bg-emerald-900/15 p-4 text-sm">
          <p className="text-emerald-200">
            Deal <span className="font-mono text-emerald-100">{dealId}</span> has
            {" "}Pricelock and SLA attached. You’re now in <strong>Active</strong>.
          </p>
          <ul className="mt-2 list-disc pl-5 text-emerald-200/90">
            <li>Generate Work Orders / Assign partners</li>
            <li>Dispatch Have-You prompts</li>
            <li>Enable QA and Reporting routes</li>
          </ul>
        </section>
      )}

      {/* Active list */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex-1">
        {rows.length === 0 ? (
          <div className="text-sm text-zinc-400">No active records.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.booking_id}
                className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/40"
              >
                <div className="font-mono text-zinc-100">{r.order_no}</div>
                <div className="text-xs text-zinc-400">
                  {r.direction.toUpperCase()} • {r.status} •{" "}
                  {new Date(r.when_iso).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {msg && <div className="text-sm text-red-500">{msg}</div>}

      {/* Nav */}
      <footer className="pt-4 mt-auto">
        <ArrowNav
          backHref="/ship/business/oms/obari/booking"
          nextHref="/ship/business/oms/obari/report"
        >
          Stage 4 — Active
        </ArrowNav>
      </footer>
    </main>
  );
}