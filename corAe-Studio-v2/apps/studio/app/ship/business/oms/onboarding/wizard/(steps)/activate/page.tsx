"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/** Activate Deal */

type PostRes =
  | { ok: true; dealId: string; nextStep: string | null }
  | { error: string | string[] };

export default function ActivateStepPage() {
  const router = useRouter();
  // safe client param getter
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const dealId = getParam("dealId") || "";
  const unmet = Number(getParam("unmet") || "0");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canActivate = useMemo(()=>!busy && !!dealId && unmet <= 0, [busy, dealId, unmet]);

  async function activate() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/business/oms/onboarding/wizard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "bdo.activate", payload: { dealId } }),
      });
      const data = (await res.json()) as PostRes;
      if (!res.ok || "error" in data) {
        const e = "error" in data ? (Array.isArray(data.error) ? data.error.join(", ") : data.error) : "Failed";
        setMsg(`âŒ ${e}`); setBusy(false); return;
      }
      setMsg("ðŸŽ‰ Deal activated.");
      router.push(`/business/oms/deals/${encodeURIComponent(dealId)}` as any);
    } catch (e: any) {
      setMsg(`âŒ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top"><h1 className="title">Activate Deal</h1></header>
      <section className="panel">
        <p className="muted">Mandatory docs outstanding: <b>{unmet}</b>.</p>
        {msg && <p className="muted" style={{marginTop:8}}>{msg}</p>}
        <div className="end">
          <button className="ghost" onClick={()=>router.push(`/business/oms/onboarding/wizard/(steps)/documentation?dealId=${encodeURIComponent(dealId)}` as any)}>â† Back</button>
          <button className="primary" disabled={!canActivate} onClick={activate} title={unmet > 0 ? "Upload all mandatory documents first" : "Activate"}>
            Activate â†’
          </button>
        </div>
      </section>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      :root { --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%); --card: rgba(16,24,40,.72); --fg:#e2e8f0; --fg-muted:#94a3b8; --border:rgba(148,163,184,.18); }
      html, body { background: var(--bg); color: var(--fg); }
      .page { max-width: 700px; margin: 0 auto; padding: 24px; font-family: Inter, ui-sans-serif; }
      .top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
      .title { font-weight:700; font-size:1.3rem; color:#e5f3ff; }
      .panel { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 14px; margin-top: 12px; }
      .muted { color: var(--fg-muted); }
      .ghost, .primary { border-radius:12px; padding:.7rem 1.1rem; }
      .ghost { background:#0a1222; color:#d1eaff; border:1px solid var(--border); }
      .primary { background:linear-gradient(180deg,#22d3ee 0%,#0ea5e9 55%,#0284c7 100%); color:#00121c; font-weight:800; border:none; }
      .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top: 10px; }
    `}</style>
  );
}
