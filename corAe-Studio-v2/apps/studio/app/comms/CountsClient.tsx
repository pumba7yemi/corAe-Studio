"use client";
import { useEffect, useState } from "react";

type Counts = {
  orders: number; booking: number; active: number; reporting: number; invoicing: number;
  operations?: number; finance?: number; ts?: number;
};

export default function CountsClient() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/oms/stages", { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setCounts(j); setErr(null);
    } catch (e: any) {
      setErr(e?.message || "failed");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // refresh every 5s
    return () => clearInterval(t);
  }, []);

  const tiles = [
    { key: "orders", label: "Order" },
    { key: "booking", label: "Booking" },
    { key: "active", label: "Active" },
    { key: "reporting", label: "Reporting" },
    { key: "invoicing", label: "Invoicing" },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {tiles.map(t => (
        <div key={t.key} className="rounded border bg-gray-50 px-3 py-2">
          <div className="text-[11px] text-gray-600">{t.label}</div>
          <div className="text-base font-semibold">
            {counts ? (counts as any)[t.key] ?? 0 : "…"}
          </div>
        </div>
      ))}
      {err && <div className="col-span-full text-xs text-red-600">Feed error: {err}</div>}
    </div>
  );
}
