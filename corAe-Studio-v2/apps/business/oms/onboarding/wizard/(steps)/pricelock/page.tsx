"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getParam } from "@/app/lib/nav/qs";

/** Pricelock Chain (replaces Contract gate) */

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default function PricelockStepPage() {
  const router = useRouter();
  const [dealId, setDealId] = React.useState<string>("");

  useEffect(() => {
    setDealId(getParam("dealId", ""));
  }, []);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [total, setTotal] = useState<string>("");
  const [currency, setCurrency] = useState("AED");
  const [days, setDays] = useState<number>(7);
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");

  async function createPricelock() {
    setBusy(true); setMsg(null);
    try {
      const priceNumber = Number(total);
      if (!priceNumber || priceNumber <= 0) { setMsg("âŒ Enter a valid total."); setBusy(false); return; }

      await fetch("/api/business/oms/onboarding/wizard/pricelock", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          price: priceNumber,
          currency,
          validFrom: new Date().toISOString(),
          validUntil: addDays(new Date(), days).toISOString(),
          confirmedBy: signerName || signerEmail || null,
        }),
      });
      setMsg("ðŸ”’ Pricelock Chain created.");
      router.push(`/business/oms/onboarding/wizard/(steps)/booking-sheet?dealId=${encodeURIComponent(dealId)}`);
    } catch (e: any) {
      setMsg(`âŒ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top"><h1 className="title">corAe Pricelock Chainâ„¢</h1></header>
      {msg && <p className="muted" style={{margin:"8px 2px"}}>{msg}</p>}

      <section className="panel">
        <Two>
          <Field label="Total"><input className="input" type="number" value={total} onChange={(e)=>setTotal(e.target.value)} placeholder="e.g., 1250" /></Field>
          <Field label="Currency">
            <select className="input" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
              <option>AED</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </Field>
        </Two>
        <Two>
          <Field label="Validity (days)"><input className="input" type="number" min={1} value={days} onChange={(e)=>setDays(Number(e.target.value||1))} /></Field>
          <Field label="Signer (Email)"><input className="input" value={signerEmail} onChange={(e)=>setSignerEmail(e.target.value)} placeholder="ops@customer.com" /></Field>
        </Two>
        <Field label="Signer (Name)"><input className="input" value={signerName} onChange={(e)=>setSignerName(e.target.value)} placeholder="e.g., Jane Smith" /></Field>

        <div className="end">
          <button className="ghost" onClick={()=>router.push(`/business/oms/onboarding/wizard/(steps)/accept?dealId=${encodeURIComponent(dealId)}`)}>â† Back</button>
          <button className="primary" disabled={!dealId || busy || !total} onClick={createPricelock}>Create Pricelock & Continue â†’</button>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Two({ children }: { children: React.ReactNode }) { return <div className="two">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return (<div><div className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>{label}</div>{children}</div>); }
function Styles() {
  return (
    <style jsx global>{`
      :root { --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%); --card: rgba(16,24,40,.72); --fg:#e2e8f0; --fg-muted:#94a3b8; --border:rgba(148,163,184,.18); }
      html, body { background: var(--bg); color: var(--fg); }
      .page { max-width: 900px; margin: 0 auto; padding: 24px; font-family: Inter, ui-sans-serif; }
      .top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
      .title { font-weight:700; font-size:1.3rem; color:#e5f3ff; }
      .panel { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 14px; margin-top: 12px; }
      .two { display:grid; grid-template-columns:1fr; gap:12px; }
      @media (min-width:680px){ .two{ grid-template-columns:1fr 1fr; } }
      .input { width:100%; border-radius:12px; padding:.75rem .9rem; background:#0b1323; color:var(--fg); border:1px solid var(--border); }
      .muted { color: var(--fg-muted); }
      .ghost, .primary { border-radius:12px; padding:.7rem 1.1rem; }
      .ghost { background:#0a1222; color:#d1eaff; border:1px solid var(--border); }
      .primary { background:linear-gradient(180deg,#22d3ee 0%,#0ea5e9 55%,#0284c7 100%); color:#00121c; font-weight:800; border:none; }
      .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top: 10px; }
    `}</style>
  );
}
