// apps/studio/app/api/business/oms/obari/deal/[dealId]/new/page.tsx

"use client";
import { useState } from "react";

export default function NewDeal() {
  const [loading, setLoading] = useState(false);
  async function create() {
    setLoading(true);
    const res = await fetch("/api/deals", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        mode:"BROKER",
        vendorId:"ven_demo", clientId:"cli_demo",
        currency:"AED", vatPercent:5,
        items:[{ sku:"SKU-1", name:"Sample", uom:"carton", qty:10, unitPrice:12.5 }]
      })
    });
    const deal = await res.json();
    alert(`BTDO created: ${deal.code}`);
    setLoading(false);
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">New Deal (BTDO)</h1>
      <button onClick={create} disabled={loading} className="rounded px-4 py-2 border">
        {loading ? "Creating..." : "Create BTDO"}
      </button>
    </div>
  );
}
