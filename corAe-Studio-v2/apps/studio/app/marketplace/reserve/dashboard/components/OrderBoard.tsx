// apps/studio/app/marketplace/reserve/dashboard/components/OrderBoard.tsx
"use client";

import React, { useEffect, useState } from "react";

export function OrderBoard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/reserve/orders");
        const data = await res.json();
        if (data.ok) setOrders(data.orders || []);
      } catch (err) {
        console.error("OrderBoard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <div>Loading Order Board...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Order Board</h2>
      {orders.length === 0 && (
        <p className="text-gray-500">No active orders found.</p>
      )}
      {orders.map((order, i) => (
        <div
          key={i}
          className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div>
            <p className="font-medium">
              Order #{order.id.slice(0, 6).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              Status: {order.status} | Amount: {order.amount ?? 0}
            </p>
          </div>
          <button
            onClick={() => alert(`Mark order ${order.id} as fulfilled`)}
            className="px-3 py-1 bg-black text-white rounded text-sm"
          >
            Fulfill
          </button>
        </div>
      ))}
    </div>
  );
}