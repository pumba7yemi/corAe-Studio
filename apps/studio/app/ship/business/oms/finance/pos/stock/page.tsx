// app/ship/business/pos/stock/page.tsx
"use client";

import { useMemo, useState } from "react";

type Level = {
  sku: string;
  name: string;
  location: string; // MAIN | WHS-01 | POS-COUNTER
  onHand: number;
  reserved: number;
};

type AdjustType = "ADJUST_IN" | "ADJUST_OUT";

type AdjustForm = {
  sku: string;
  location: string;
  type: AdjustType;
  qty: number;
  reason?: string;
};

// Seeded demo view (UI stays responsive even before DB backfill)
const seedLevels: Level[] = [
  { sku: "Product0001", name: "Seed Product",     location: "MAIN",        onHand: 120, reserved: 5 },
  { sku: "COLA330",    name: "Cola 330ml",        location: "POS-COUNTER", onHand: 60,  reserved: 0 },
  { sku: "MILK1L",     name: "Fresh Milk 1L",     location: "MAIN",        onHand: 24,  reserved: 2 },
];

export default function StockPage() {
  const [levels, setLevels] = useState<Level[]>(seedLevels);
  const [q, setQ] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<AdjustForm>({
    sku: "",
    location: "MAIN",
    type: "ADJUST_IN",
    qty: 1,
    reason: "",
  });

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return levels;
    return levels.filter(
      (l) =>
        l.sku.toLowerCase().includes(k) ||
        l.name.toLowerCase().includes(k) ||
        l.location.toLowerCase().includes(k)
    );
  }, [levels, q]);

  function openAdjust(sku: string, location: string) {
    setForm({ sku, location, type: "ADJUST_IN", qty: 1, reason: "" });
    setMessage(null);
    setShowAdjust(true);
  }

  async function commitAdjust() {
    if (!form.sku || form.qty <= 0) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // Real API call → posts a FlowEvent and runs the inventory observer
      const res = await fetch("/api/business/pos/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.sku,
          qty: form.qty,
          type: form.type,          // "ADJUST_IN" | "ADJUST_OUT"
          reason: form.reason || undefined,
          location: form.location,  // passed through for future multi-location support
        }),
      });
      const data = await res.json();

      if (!data?.ok) {
        setMessage(`❌ ${data?.error || "Adjustment failed."}`);
        return;
      }

      // Optimistic UI: reflect the change in the current table view
      setLevels((prev) =>
        prev.map((l) => {
          if (l.sku === form.sku && l.location === form.location) {
            const delta = form.type === "ADJUST_IN" ? form.qty : -form.qty;
            return { ...l, onHand: Math.max(0, l.onHand + delta) };
          }
          return l;
        })
      );

      setMessage("✅ Adjustment recorded and observer triggered.");
      setShowAdjust(false);
    } catch (e: any) {
      setMessage(`⚠️ ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const totalOnHand = filtered.reduce((s, l) => s + l.onHand, 0);
  const totalReserved = filtered.reduce((s, l) => s + l.reserved, 0);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Stock</h1>
        <p className="muted">Live levels, search, and governed adjustments (OBARI-linked).</p>
      </header>

      {/* Search + Totals */}
      <section className="c-card p-4">
        <div className="row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU, name, or location…"
            className="flex-1 border border-ring rounded-lg p-3 bg-surface text-text"
          />
          <div className="badge">On hand: {totalOnHand}</div>
          <div className="badge">Reserved: {totalReserved}</div>
        </div>
      </section>

      {/* Table */}
      <section className="c-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left border-b border-ring">
              <th className="py-2 px-3">SKU</th>
              <th className="px-3">Name</th>
              <th className="px-3">Location</th>
              <th className="px-3 text-right">On Hand</th>
              <th className="px-3 text-right">Reserved</th>
              <th className="px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={`${l.sku}@${l.location}`} className="border-b border-ring">
                <td className="py-2 px-3 font-mono">{l.sku}</td>
                <td className="px-3">{l.name}</td>
                <td className="px-3">{l.location}</td>
                <td className="px-3 text-right">{l.onHand}</td>
                <td className="px-3 text-right">{l.reserved}</td>
                <td className="px-3">
                  <button className="btn" onClick={() => openAdjust(l.sku, l.location)}>
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 muted" colSpan={6}>No rows match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Result message */}
      {message && <div className="small">{message}</div>}

      {/* Adjust modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="c-card p-4 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Stock Adjust</h2>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="col-span-2 small">
                SKU: <span className="font-mono">{form.sku}</span>
              </div>

              <label className="stack">
                <span className="small muted">Location</span>
                <select
                  className="border border-ring rounded-lg p-2 bg-card"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option>MAIN</option>
                  <option>WHS-01</option>
                  <option>POS-COUNTER</option>
                </select>
              </label>

              <label className="stack">
                <span className="small muted">Type</span>
                <select
                  className="border border-ring rounded-lg p-2 bg-card"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as AdjustType })}
                >
                  <option value="ADJUST_IN">Adjust In</option>
                  <option value="ADJUST_OUT">Adjust Out</option>
                </select>
              </label>

              <label className="stack">
                <span className="small muted">Quantity</span>
                <input
                  type="number"
                  min={1}
                  className="border border-ring rounded-lg p-2 bg-surface text-text"
                  value={form.qty}
                  onChange={(e) =>
                    setForm({ ...form, qty: Math.max(1, Number(e.target.value || 1)) })
                  }
                />
              </label>

              <label className="stack col-span-2">
                <span className="small muted">Reason (optional)</span>
                <input
                  className="border border-ring rounded-lg p-2 bg-surface text-text"
                  placeholder="Breakage, count correction, etc."
                  value={form.reason || ""}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>
            </div>

            <div className="row justify-end mt-4">
              <button className="btn" onClick={() => setShowAdjust(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={commitAdjust}
                disabled={submitting}
                title="Record adjustment and trigger observers"
              >
                {submitting ? "Saving…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
