"use client";

/**
 * OBARI â€” Booking (corAe Stable Alias Build)
 * - Lists staged PO/SO snapshots from repo
 * - One-click â€œConfirm Bookingâ€ â†’ POST /api/business/oms/obari/booking
 * - Stage: after Order / before Active
 */

import { useEffect, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav"; // âœ… alias (never breaks)

type Staged = {
  snapshot_id: string;
  direction: "inbound" | "outbound";
  order_no: string;
  schedule: any;
  transport: any;
  lines: { sku: string; qty: number; uom?: string; unit_price: number }[];
  created_at_iso: string;
};

type ListResp = { ok: true; staged: Staged[] } | { ok: false; error: string };
type BookResp = { ok: true; booking: any } | { ok: false; error: string };

export default function ObariBookingPage() {
  const [rows, setRows] = useState<Staged[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  /* ---------------- fetch staged orders ---------------- */
  async function load() {
    setMsg(null);
    try {
      const res = await fetch("/api/business/oms/obari/booking", { cache: "no-store" });
      const data: ListResp = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load");
      setRows(data.staged);
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Failed to load"}`);
    }
  }

  useEffect(() => { load(); }, []);

  /* ---------------- confirm booking ---------------- */
  async function confirm(snapshot_id: string) {
    setBusy(snapshot_id);
    setMsg(null);
    try {
      const res = await fetch("/api/business/oms/obari/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId: snapshot_id }),
      });
      const data: BookResp = await res.json();
      if (!data.ok) throw new Error(data.error || "Booking failed");
      setMsg(`âœ… Booked ${data.booking.order_no} (${data.booking.booking_id})`);
      await load();
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Booking failed"}`);
    } finally {
      setBusy(null);
    }
  }

  /* ---------------- render ---------------- */
  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <header className="stack">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">OBARI â€” Booking</h1>
        </div>
        <p className="text-sm text-slate-400">
          Pick a staged order (PO/SO) and confirm booking (demo).
        </p>
      </header>

      {/* Main card */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        {rows.length === 0 ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">No staged orders found.</div>
            <button
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
              onClick={load}
            >
              Reload
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li
                key={r.snapshot_id}
                className="rounded-xl border border-slate-700 bg-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-slate-200">{r.order_no}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {r.direction.toUpperCase()} â€¢{" "}
                      {new Date(r.created_at_iso).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="px-3 py-2 rounded-lg border border-emerald-800 text-white"
                    style={{ background: "linear-gradient(to right,#059669,#10b981)" }}
                    disabled={busy === r.snapshot_id}
                    onClick={() => confirm(r.snapshot_id)}
                  >
                    {busy === r.snapshot_id ? "Bookingâ€¦" : "Confirm Booking"}
                  </button>
                </div>

                <div className="text-xs text-slate-300 mt-2">
                  {r.lines.map((l, i) => (
                    <span key={i} className="mr-3">
                      {l.sku} Ã— {l.qty}
                      {l.uom ? ` ${l.uom}` : ""} @ {(l.unit_price / 100).toFixed(2)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Message */}
      {msg && <div className="text-sm">{msg}</div>}

      {/* Nav */}
      <ArrowNav
        backHref="/business/oms/obari/order"
        nextHref="/business/oms/obari/active"
        nextLabel="To Active"
      >
        Step 4 â€” Booking
      </ArrowNav>
    </main>
  );
}
