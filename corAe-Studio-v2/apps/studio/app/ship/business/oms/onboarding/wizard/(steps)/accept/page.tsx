"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Quote Acceptance (Pricelock + corAe Confirmed) */

type PostRes =
  | { ok: true; dealId: string; nextStep: string | null }
  | { error: string | string[] };

export default function AcceptStepPage() {
  const router = useRouter();
  // safe client-only param getter
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const dealId = getParam("dealId") || "";

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [accept, setAccept] = useState({
    quoteId: "",
    priceLocked: true,
    corAeConfirmed: true,
    acceptedByEmail: "",
    note: "",
  });

  useEffect(() => {
    if (!dealId) setMsg("âš ï¸ Missing dealId in URL.");
  }, [dealId]);

  async function runAccept() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/business/oms/onboarding/wizard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "btdo.accept",
          payload: {
            dealId,
            quoteId: accept.quoteId,
            priceLocked: accept.priceLocked,
            corAeConfirmed: accept.corAeConfirmed,
            acceptedBy: accept.acceptedByEmail ? { email: accept.acceptedByEmail } : undefined,
            note: accept.note || null,
          }
        })
      });
      const data = (await res.json()) as PostRes;
      if (!res.ok || "error" in data) {
        const e = "error" in data ? (Array.isArray(data.error) ? data.error.join(", ") : data.error) : "Failed";
        setMsg(`âŒ ${e}`); setBusy(false); return;
      }
      setMsg("âœ… Acceptance saved.");
      // navigate to pricelock step
      router.push(`/business/oms/onboarding/wizard/(steps)/pricelock?dealId=${encodeURIComponent(dealId)}` as unknown as any);
    } catch (e: any) {
      setMsg(`âŒ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top"><h1 className="title">Quote Acceptance</h1></header>
      {msg && <p className="muted" style={{margin:"8px 2px"}}>{msg}</p>}

      <section className="panel">
        <Two>
          <Field label="Quote ID"><input className="input" value={accept.quoteId} onChange={(e)=>setAccept({...accept, quoteId:e.target.value})} /></Field>
          <Field label="Accepted By (Email)"><input className="input" value={accept.acceptedByEmail} onChange={(e)=>setAccept({...accept, acceptedByEmail:e.target.value})} /></Field>
        </Two>
        <Two>
          <Check label="Price Locked (Pricelock)" checked={accept.priceLocked} onChange={(v)=>setAccept({...accept, priceLocked:v})} />
          <Check label="corAe Confirmed" checked={accept.corAeConfirmed} onChange={(v)=>setAccept({...accept, corAeConfirmed:v})} />
        </Two>
        <Field label="Acceptance Note"><input className="input" value={accept.note} onChange={(e)=>setAccept({...accept, note:e.target.value})} /></Field>

        <div className="end">
          <button className="ghost" onClick={()=>router.push(`/business/oms/onboarding/wizard/(steps)/intake` as unknown as any)}>â† Back</button>
          <button className="primary" disabled={!dealId || busy} onClick={runAccept}>Save & Continue â†’</button>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Two({ children }: { children: React.ReactNode }) { return <div className="two">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return (<div><div className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>{label}</div>{children}</div>); }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v:boolean)=>void; }) {
  return (<label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:".95rem"}}><input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />{label}</label>);
}
function Styles() {
  return (
    <style jsx global>{`
      :root { --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%); --card: rgba(16,24,40,.72);
        --fg:#e2e8f0; --fg-muted:#94a3b8; --border:rgba(148,163,184,.18); --pill:linear-gradient(180deg,#0e1626 0%,#0b1220 100%); --pill-on:linear-gradient(180deg,#0ea5e9 0%,#0284c7 100%);
        --shadow-inner: inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35);
      }
      html, body { background: var(--bg); color: var(--fg); }
      .page { max-width: 900px; margin: 0 auto; padding: 24px; font-family: Inter, ui-sans-serif; }
      .top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
      .title { font-weight:700; font-size:1.3rem; color:#e5f3ff; }
      .panel { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 14px; margin-top: 12px; }
      .two { display:grid; grid-template-columns:1fr; gap:12px; }
      @media (min-width: 680px) { .two { grid-template-columns:1fr 1fr; } }
      .input { width: 100%; border-radius: 12px; padding: .75rem .9rem; background: #0b1323; color: var(--fg); border: 1px solid var(--border); }
      .muted { color: var(--fg-muted); }
      .ghost, .primary { border-radius: 12px; padding:.7rem 1.1rem; }
      .ghost { background:#0a1222; color:#d1eaff; border:1px solid var(--border); }
      .primary { background:linear-gradient(180deg,#22d3ee 0%,#0ea5e9 55%,#0284c7 100%); color:#00121c; font-weight:800; border:none; }
      .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top: 10px; }
    `}</style>
  );
}
