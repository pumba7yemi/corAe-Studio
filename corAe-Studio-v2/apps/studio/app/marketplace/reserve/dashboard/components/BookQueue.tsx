// apps/studio/app/marketplace/reserve/dashboard/components/BookQueue.tsx
"use client";

import React, { useEffect, useState } from "react";

export function BookQueue() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await fetch("/api/reserve/timeline?id=all");
        const data = await res.json();
        if (data.ok) setReservations(data.timeline || []);
      } catch (err) {
        console.error("BookQueue fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, []);

  if (loading) return <div>Loading Book Queue...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Book Queue</h2>
      {reservations.length === 0 && (
        <p className="text-gray-500">No current bookings found.</p>
      )}
      {reservations.map((r, i) => (
        <div
          key={i}
          className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50"
        >
          <div>
            <p className="font-medium">{r.title || "Untitled Reservation"}</p>
            <p className="text-sm text-gray-500">
              Stage: {r.stage || "BOOKED"}
            </p>
          </div>
          <button
            onClick={() => alert(`Elevate ${r.id} to BTDO`)}
            className="px-3 py-1 bg-black text-white rounded text-sm"
          >
            Elevate
          </button>
        </div>
      ))}
    </div>
  );
}