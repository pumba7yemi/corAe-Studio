// apps/studio/apps/ship/app/api/business/oms/obari/booking/ui/page.tsx
"use client";

/**
 * OBARI — Booking Stage UI (Stage 3)
 * Displays all bookings generated from staged orders (OSTG_*).
 * Allows: viewing details, filtering by status, and transitioning status (demo).
 * Demo store = memory-based API; in prod replace with database.
 */

import { useEffect, useState } from "react";

type BookingStatus =
  | "pending"
  | "scheduled"
  | "dispatched"
  | "completed"
  | "cancelled";

interface BookingRecord {
  booking_id: string;
  source_snapshot_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  status: BookingStatus;
  requested_window?: { start_iso: string; end_iso: string };
  confirmed_window?: { start_iso: string; end_iso: string };
  updated_at_iso: string;
  created_at_iso: string;
  totals: { subtotal: number; lines: number };
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/business/oms/obari/booking");
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) {
          setBookings(data.items);
        }
      } catch {
        setMessage("⚠️ Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    try {
      setMessage(null);
      const res = await fetch("/api/business/oms/obari/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === id ? data.booking : b))
      );
      setMessage(`✅ ${id} → ${status}`);
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    }
  }

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <main className="p-6 space-y-4">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Bookings</h1>
        <p className="muted">
          Stage 3 of OBARI: View and update booking statuses.
        </p>
      </header>

      <section className="flex gap-2 items-center">
        <label className="text-sm text-muted">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded p-1"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {message && <span className="text-sm ml-3">{message}</span>}
      </section>

      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Direction</th>
                <th className="text-left p-2">Counterparty</th>
                <th className="text-left p-2">Order</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.booking_id} className="border-t">
                  <td className="p-2 font-mono">{b.booking_id}</td>
                  <td className="p-2">{b.direction}</td>
                  <td className="p-2">{b.parties.counterparty_name}</td>
                  <td className="p-2">
                    {b.order_numbers.po_no || b.order_numbers.so_no}
                  </td>
                  <td className="p-2">{b.status}</td>
                  <td className="p-2">
                    {(b.totals.subtotal / 100).toFixed(2)} ({b.totals.lines})
                  </td>
                  <td className="p-2">
                    <select
                      className="border rounded p-1 text-sm"
                      value=""
                      onChange={(e) =>
                        updateStatus(b.booking_id, e.target.value as any)
                      }
                    >
                      <option value="">Change…</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}