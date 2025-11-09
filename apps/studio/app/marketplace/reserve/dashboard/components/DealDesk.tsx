// apps/studio/app/marketplace/reserve/dashboard/components/DealDesk.tsx
"use client";

import React, { useEffect, useState } from "react";

export function DealDesk() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/reserve/deals");
        const data = await res.json();
        if (data.ok) setDeals(data.deals || []);
      } catch (err) {
        console.error("DealDesk fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  if (loading) return <div>Loading Deal Desk...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Deal Desk</h2>
      {deals.length === 0 && (
        <p className="text-gray-500">No confirmed deals yet.</p>
      )}
      {deals.map((deal, i) => (
        <div
          key={i}
          className="border rounded-lg p-3 hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {deal.reservation?.title || "Unnamed Deal"}
              </p>
              <p className="text-sm text-gray-500">
                Price: {deal.price ?? 0} | Terms: {deal.terms || "N/A"}
              </p>
            </div>
            <button
              onClick={() => alert(`Dispatch order for deal ${deal.id}`)}
              className="px-3 py-1 bg-black text-white rounded text-sm"
            >
              Dispatch
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}