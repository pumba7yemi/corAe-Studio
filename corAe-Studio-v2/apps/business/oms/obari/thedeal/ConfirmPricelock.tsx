"use client";

import { useState } from "react";

export default function ConfirmPricelock({ dealId }: { dealId: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirm() {
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/oms/obari/thedeal/pricelock/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Failed");
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={confirm}
        disabled={busy || ok}
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {ok ? "Pricelock Confirmed" : busy ? "Confirming…" : "Confirm Pricelock"}
      </button>
      {err && <span className="text-sm text-red-400">{err}</span>}
    </div>
  );
}