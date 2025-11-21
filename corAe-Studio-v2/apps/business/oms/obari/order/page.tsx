"use client";

/**
 * OBARI â€” Orders (UI) Â· 150.logic
 * Step 3 of 7 â€” after Schedule & Prep.
 * - Lists recent orders via /api/obari/order/list
 * - Quick-create via /api/obari/order/issue
 * - Reads schedule snapshot from sessionStorage for continuity
 */

import { useEffect, useMemo, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav";

type Direction = "PURCHASE" | "SALES";
type WeekRef = "W1" | "W2" | "W3" | "W4";
type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

type OrderListItem = {
  id: string;
  code: string;
  direction: Direction;
  expectedWeek: WeekRef | null;
  scheduleMode: ScheduleMode;
  itemCode: string | null;
  description: string | null;
  qty: string;
  unit: string | null;
  unitPrice: string;
  currency: string;
  vendorCode: string | null;
  customerCode: string | null;
  createdAt: string;
};

type SavedSchedule = {
  mode: ScheduleMode;
  weekRef?: WeekRef | null;
  month?: number | null;
  year?: number | null;
  startDate: string;
  endDate: string;
  label?: string | null;
};

type ListResponse =
  | { ok: true; count: number; nextCursor: string | null; items: OrderListItem[] }
  | { ok: false; error: string };

const DEFAULT_LIMIT = 20;

export default function ObariOrdersPage() {
  // filters
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<Direction | "">("");

  // schedule snapshot
  const [sched, setSched] = useState<SavedSchedule | null>(null);

  // data
  const [rows, setRows] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // create form
  const [form, setForm] = useState({
    direction: "PURCHASE" as Direction,
    itemCode: "",
    description: "",
    qty: "1",
    unit: "EA",
    unitPrice: "0",
    scheduleMode: "CYCLE_28" as ScheduleMode,
    expectedWeek: "" as "" | WeekRef,
    vendorCode: "",
    customerCode: "",
    taxCode: "",
    currency: "AED",
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  const canCreate = useMemo(() => {
    if (!form.itemCode.trim()) return false;
    const qty = Number(form.qty);
    const price = Number(form.unitPrice);
    return Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price >= 0;
  }, [form]);

  useEffect(() => {
    // load schedule snapshot
    try {
      const raw = sessionStorage.getItem("obari.schedule.selection");
      if (raw) setSched(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    void reload();
  }, []);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(DEFAULT_LIMIT));
      if (q.trim()) params.set("q", q.trim());
      if (direction) params.set("direction", direction);
      const res = await fetch(`/api/obari/order/list?${params.toString()}`, { cache: "no-store" });
      const data: ListResponse = await res.json();
      if (!data.ok) throw new Error(data.error);
      setRows(data.items);
      setMore(data.nextCursor);
    } catch (e: any) {
      setErr(e.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function createOrder() {
    if (!canCreate) return;
    setCreating(true);
    setErr(null);
    try {
      const payload = {
        direction: form.direction,
        itemCode: form.itemCode.trim(),
        description: form.description.trim() || undefined,
        qty: Number(form.qty),
        unit: form.unit.trim() || undefined,
        unitPrice: Number(form.unitPrice),
        currency: form.currency.trim() || undefined,
        taxCode: form.taxCode.trim() || undefined,
        scheduleMode: form.scheduleMode,
        expectedWeek: (form.expectedWeek || undefined) as WeekRef | undefined,
        vendorCode:
          form.direction === "PURCHASE"
            ? form.vendorCode.trim() || "Vendor0001"
            : undefined,
        customerCode:
          form.direction === "SALES"
            ? form.customerCode.trim() || "Customer0001"
            : undefined,
        notes: form.notes.trim() || undefined,
      };

      const res = await fetch("/api/obari/order/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Issue failed.");
      await reload();
      setForm((f) => ({ ...f, itemCode: "", description: "", qty: "1", unitPrice: "0", notes: "" }));
    } catch (e: any) {
      setErr(e.message || "Failed to issue order.");
    } finally {
      setCreating(false);
    }
  }

  const schedLine = sched
    ? (() => {
        const s = new Date(sched.startDate);
        const e = new Date(sched.endDate);
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")}`;
        return `Mode: ${sched.mode} Â· Week: ${sched.weekRef ?? "â€”"} Â· Window: ${fmt(
          s
        )} â†’ ${fmt(e)}`;
      })()
    : null;

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI â€” Orders</h1>
        <p className="muted">Create and review orders (PURCHASE / SALES) aligned to cadence.</p>
      </header>

      {sched && (
        <section className="c-card p-3 small muted">
          <strong>Schedule:</strong> {schedLine}
        </section>
      )}

      {/* Filters */}
      <section className="c-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code, item, vendor/customerâ€¦"
            className="border border-ring rounded-lg p-2"
          />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction | "")}
            className="border border-ring rounded-lg p-2 bg-card"
          >
            <option value="">All directions</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="SALES">SALES</option>
          </select>
          <button className="btn" onClick={reload} disabled={loading}>
            Refresh
          </button>
        </div>
        {err && <div className="small text-red-500 mt-2">âš  {err}</div>}
      </section>

      {/* Quick Create */}
      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Issue Order</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="stack">
            <span className="small muted">Direction</span>
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value as Direction })}
              className="border border-ring rounded-lg p-2 bg-card"
            >
              <option value="PURCHASE">PURCHASE</option>
              <option value="SALES">SALES</option>
            </select>
          </label>

          <label className="stack">
            <span className="small muted">Item Code</span>
            <input
              value={form.itemCode}
              onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
              placeholder="Product0001"
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Qty</span>
            <input
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })}
              inputMode="decimal"
              className="border border-ring rounded-lg p-2"
            />
          </label>
        </div>

        <div className="row justify-end">
          <button
            className="btn btn-primary"
            onClick={createOrder}
            disabled={!canCreate || creating}
          >
            {creating ? "Issuingâ€¦" : "Issue Order"}
          </button>
        </div>
      </section>

      {/* List */}
      <section className="c-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left border-b border-ring">
              <th className="py-2 px-3">Code</th>
              <th className="px-3">Dir</th>
              <th className="px-3">Item</th>
              <th className="px-3">Qty</th>
              <th className="px-3">UnitPrice</th>
              <th className="px-3">Week</th>
              <th className="px-3">Mode</th>
              <th className="px-3">Party</th>
              <th className="px-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ring">
                <td className="py-2 px-3 font-mono">{r.code}</td>
                <td className="px-3">{r.direction}</td>
                <td className="px-3">{r.itemCode}</td>
                <td className="px-3">{r.qty}</td>
                <td className="px-3">
                  {r.unitPrice} {r.currency}
                </td>
                <td className="px-3">{r.expectedWeek ?? "â€”"}</td>
                <td className="px-3">{r.scheduleMode}</td>
                <td className="px-3">
                  {r.direction === "PURCHASE" ? r.vendorCode ?? "â€”" : r.customerCode ?? "â€”"}
                </td>
                <td className="px-3">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td className="p-4 muted" colSpan={9}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="p-3 small muted text-center">Loading ordersâ€¦</div>
        )}
      </section>

      <ArrowNav backHref="/business/oms/obari/thedeal/bdo/prep" nextHref="/business/oms/obari/booking" nextLabel="To Bookings">
        Stage 1 â€” Order
      </ArrowNav>
    </main>
  );
}

