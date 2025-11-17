"use client";
export const dynamic = "force-dynamic";
// apps/studio/apps/ship/app/business/oms/obari/thedeal/bdo/bdo-ready/page.tsx

import React, { useEffect, useMemo, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav";

type BdoReadyRow = {
  id: string;           // surveyId / presetId
  dealId: string;
  code: string;         // human code
  partyType: "vendor" | "client";
  partyName: string | null;
  schedule: "28-day" | "monthly" | "ad-hoc";
  expectedWeek: "W1" | "W2" | "W3" | "W4" | null;
  unitPrice: number;
  currency: string;
  item: string;
  qty: number | null;
  notes?: string | null;
};

type ListPayload = {
  ok: boolean;
  rows: BdoReadyRow[];
  parties: string[]; // distinct party names (for grouping quick nav)
};

export default function BdoReadySpreadsheetPage() {
  const [data, setData] = useState<BdoReadyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [groupIdx, setGroupIdx] = useState<number>(0); // arrow nav over parties
  const [parties, setParties] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch(
        "/api/ship/business/oms/obari/thedeal/bdo/bdo-ready/list",
        { cache: "no-store" }
      );
      const j = (await r.json()) as ListPayload;
      if (j.ok) {
        setData(j.rows);
        setParties(j.parties);
        setGroupIdx(0);
      }
      setLoading(false);
    })();
  }, []);

  // search filter
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((r) =>
      [r.code, r.dealId, r.partyName ?? "", r.item, r.currency, r.schedule, r.expectedWeek ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [data, q]);

  // active group (by party)
  const activeParty = parties[groupIdx] ?? null;
  const grouped = useMemo(() => {
    if (!activeParty) return filtered;
    return filtered.filter((r) => (r.partyName ?? "") === activeParty);
  }, [filtered, activeParty]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allInViewIds = grouped.map((r) => r.id);
  const allSelectedInView = allInViewIds.every((id) => selected.has(id)) && allInViewIds.length > 0;

  const toggleAllInView = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allSelectedInView) {
        for (const id of allInViewIds) n.delete(id);
      } else {
        for (const id of allInViewIds) n.add(id);
      }
      return n;
    });

  const prevGroup = () => setGroupIdx((i) => (i - 1 + parties.length) % Math.max(1, parties.length));
  const nextGroup = () => setGroupIdx((i) => (i + 1) % Math.max(1, parties.length));

  const sendBookings = async () => {
    // Send only visible + selected rows if grouped by a party; otherwise send all selected
    const ids = (activeParty ? grouped : filtered).map((r) => r.id).filter((id) => selected.has(id));
    if (!ids.length) return alert("Select at least one row.");
    const r = await fetch("/api/ship/business/oms/obari/thedeal/bdo/booking/prepare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const j = await r.json();
    if (!j.ok) return alert(`Booking failed: ${j.error || "unknown"}`);
    setSelected(new Set());
    alert(`Prepared ${j.count} booking package(s). Check .data/obari-bookings/`);
  };

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — BDO Ready</h1>
        <p className="muted">
          Review brokered-deal orders ready to flow. Use arrows to jump between parties, select rows, and prepare booking packages.
        </p>
      </header>

      <section className="c-card p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700"
                title="Prev party"
                onClick={prevGroup}
                disabled={!parties.length}
              >
                ←
              </button>
              <div className="min-w-48 text-sm text-slate-300 text-center px-2 py-1 border border-slate-700 rounded-md bg-slate-900/50">
                {activeParty ? activeParty : "All parties"}
              </div>
              <button
                className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700"
                title="Next party"
                onClick={nextGroup}
                disabled={!parties.length}
              >
                →
              </button>
            </div>
          </div>

          <button
            onClick={sendBookings}
            className="ml-0 sm:ml-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
          >
            Send Bookings (amalgamate)
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={allSelectedInView}
                    onChange={toggleAllInView}
                    title="Select all in view"
                  />
                </th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Party</th>
                <th className="px-3 py-2">Sched</th>
                <th className="px-3 py-2">Week</th>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-left">Currency</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {loading && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && grouped.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No rows.
                  </td>
                </tr>
              )}
              {grouped.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-200">{r.code}</td>
                  <td className="px-3 py-2 text-slate-300">
                    <span className="uppercase text-xs text-slate-500 mr-1">{r.partyType === "vendor" ? "V" : "C"}</span>
                    {r.partyName ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-center">{r.schedule}</td>
                  <td className="px-3 py-2 text-center">{r.expectedWeek ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-200">{r.item}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.qty ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2">{r.currency}</td>
                  <td className="px-3 py-2 text-slate-400">{r.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          Tip: Use the arrow buttons to jump between parties and “Select all” to prepare a single combined booking package per party.
        </p>
      </section>

      <ArrowNav
        backHref="/ship/business/oms/obari"
        nextHref="/ship/business/oms/obari/thedeal/bdo/schedule"
        nextLabel="To BDO Schedule"
      >
        Step 1 of 3 — BDO Ready
      </ArrowNav>
    </main>
  );
}