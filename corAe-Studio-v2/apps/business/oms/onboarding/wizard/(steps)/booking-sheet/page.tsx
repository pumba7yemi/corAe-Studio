"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getParam } from "@/app/lib/nav/qs";

/** Booking Sheet (PO + SO) */

type PostRes =
  | { ok: true; dealId: string; nextStep: string | null }
  | { error: string | string[] };

export default function BookingSheetStepPage() {
  const router = useRouter();
  const [dealId, setDealId] = React.useState<string>("");

  useEffect(() => {
    setDealId(getParam("dealId", ""));
  }, []);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [booking, setBooking] = useState({
    poNumber: "",
    soNumber: "",
    bookingSheetUrl: "",
    confirmedByEmail: "",
  });

  async function runBooking() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/ship/business/oms/onboarding/wizard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "bdo.booking-sheet",
          payload: {
            dealId,
            poNumber: booking.poNumber,
            soNumber: booking.soNumber,
            bookingSheetUrl: booking.bookingSheetUrl,
            confirmedBy: booking.confirmedByEmail ? { email: booking.confirmedByEmail } : undefined,
          }
        })
      });
      const data = (await res.json()) as PostRes;
      if (!res.ok || "error" in data) {
        const e = "error" in data ? (Array.isArray(data.error) ? data.error.join(", ") : data.error) : "Failed";
        setMsg(`❌ ${e}`); setBusy(false); return;
      }
      setMsg("✅ Booking sheet saved.");
      router.push(`/ship/business/oms/onboarding/wizard/(steps)/documentation?dealId=${encodeURIComponent(dealId)}` as any);
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top"><h1 className="title">Email Booking Sheet (PO + SO)</h1></header>
      {msg && <p className="muted" style={{margin:"8px 2px"}}>{msg}</p>}

      <section className="panel">
        <Two>
          <Field label="PO Number"><input className="input" value={booking.poNumber} onChange={(e)=>setBooking({...booking, poNumber:e.target.value})} /></Field>
          <Field label="SO Number"><input className="input" value={booking.soNumber} onChange={(e)=>setBooking({...booking, soNumber:e.target.value})} /></Field>
        </Two>
        <Two>
          <Field label="Booking Sheet URL"><input className="input" value={booking.bookingSheetUrl} onChange={(e)=>setBooking({...booking, bookingSheetUrl:e.target.value})} /></Field>
          <Field label="Confirmed By (Email)"><input className="input" value={booking.confirmedByEmail} onChange={(e)=>setBooking({...booking, confirmedByEmail:e.target.value})} /></Field>
        </Two>

          <div className="end">
          <button className="ghost" onClick={()=>router.push(`/ship/business/oms/onboarding/wizard/(steps)/pricelock?dealId=${encodeURIComponent(dealId)}` as any)}>← Back</button>
          <button className="primary" disabled={!dealId || busy} onClick={runBooking}>Save & Continue →</button>
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