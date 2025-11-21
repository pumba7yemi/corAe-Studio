// apps/studio/app/marketplace/reserve/dashboard/components/BtdoRail.tsx
"use client";

import React, { useEffect, useState } from "react";

export function BtdoRail() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrades() {
      try {
        const res = await fetch("/api/reserve/trades");
        const data = await res.json();
        if (data.ok) setTrades(data.trades || []);
      } catch (err) {
        console.error("BTDO Rail fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrades();
  }, []);

  if (loading) return <div>Loading BTDO Rail...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">BTDO Rail</h2>
      {trades.length === 0 && (
        <p className="text-gray-500">
          No open BTDO (Book → Trade → Deal → Order) flows right now.
        </p>
      )}
      {trades.map((trade, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 hover:bg-gray-50 transition flex justify-between items-center"
        >
          <div>
            <p className="font-medium">
              {trade.reservation?.title || "Untitled Booking"}
            </p>
            <p className="text-sm text-gray-500">
              Stage: {trade.btdoStage} | Pricelock: {trade.pricelockRef || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Advance trade ${trade.id} to DEAL`)}
              className="px-3 py-1 bg-black text-white rounded text-sm"
            >
              Confirm Deal
            </button>
            <button
              onClick={() => alert(`Cancel trade ${trade.id}`)}
              className="px-3 py-1 bg-gray-300 text-black rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}