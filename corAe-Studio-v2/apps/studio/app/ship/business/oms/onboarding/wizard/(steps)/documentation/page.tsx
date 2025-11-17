"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/** Documentation (Order) — loads requirements and captures document URLs */

type Requirement = {
  id: string;
  dealId: string;
  phase: "BTDO" | "BDO";
  requiredFrom: "CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
  category: "COMMERCIAL" | "OPERATIONAL";
  documentType: string;
  mandatory: boolean;
  notes: string | null;
};

export default function DocumentationStepPage() {
  const router = useRouter();
  // Safe client-only param getter
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const dealId = getParam("dealId") || "";

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [docInputs, setDocInputs] = useState<Record<string, { url: string; notes?: string; issuedAt?: string; expiresAt?: string }>>({});
  const [unmetMandatory, setUnmetMandatory] = useState<number>(0);

  useEffect(() => {
    if (!dealId) { setMsg("⚠️ Missing dealId."); return; }
    (async () => {
      try {
        const res = await fetch(`/api/ship/business/oms/onboarding/wizard/docs-required/list?dealId=${encodeURIComponent(dealId)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load requirements");
        const reqs: Requirement[] = data.requirements || [];
        setRequirements(reqs);
        const init: Record<string, any> = {};
        for (const r of reqs) init[reqKey(r)] = { url: "", notes: "" };
        setDocInputs(init);
        setUnmetMandatory(reqs.filter(r => r.mandatory).length);
      } catch (e: any) {
        setMsg(`⚠️ Could not load requirements: ${e?.message || "Error"}`);
      }
    })();
  }, [dealId]);

  useEffect(() => {
    if (!requirements.length) return;
    const unmet = requirements.filter(r => r.mandatory && !docInputs[reqKey(r)]?.url?.trim()).length;
    setUnmetMandatory(unmet);
  }, [requirements, docInputs]);

  const canGo = useMemo(()=>!busy, [busy]);

  async function saveDocs() {
    setBusy(true); setMsg(null);
    try {
      const { commercial, operational } = collectDocs(requirements, docInputs);
      if (!commercial.length && !operational.length) {
        setMsg("⚠️ Add at least one document URL before saving."); setBusy(false); return;
      }
      const res = await fetch("/api/ship/business/oms/onboarding/wizard/documentation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, commercial, operational }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) { setMsg(`❌ Could not save docs: ${data?.error || "Error"}`); setBusy(false); return; }
      setMsg("✅ Documentation saved.");
      if (typeof window !== "undefined") {
        const target =
          `/ship/business/oms/onboarding/wizard/(steps)/activate` +
          `?dealId=${encodeURIComponent(dealId)}&unmet=${unmetMandatory}`;

        router.push(target);
      }
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top"><h1 className="title">Documentation (Order)</h1></header>
      {msg && <p className="muted" style={{margin:"8px 2px"}}>{msg}</p>}

      <section className="panel">
        {requirements.length === 0 && <p className="muted">No predefined requirements found. You can still add docs below (attach Contract PDF here if applicable).</p>}

        <div className="two">
          <DocColumn
            title="Commercial"
            items={requirements.filter(r => r.category === "COMMERCIAL")}
            values={docInputs}
            onChange={(k,v)=>setDocInputs(s=>({ ...s, [k]: { ...s[k], ...v } }))}
          />
          <DocColumn
            title="Operational"
            items={requirements.filter(r => r.category === "OPERATIONAL")}
            values={docInputs}
            onChange={(k,v)=>setDocInputs(s=>({ ...s, [k]: { ...s[k], ...v } }))}
          />
        </div>

        <div className="muted" style={{marginTop:8}}>Mandatory outstanding: <b>{unmetMandatory}</b></div>

        <div className="end">
          <button className="ghost" onClick={()=>router.push(`/ship/business/oms/onboarding/wizard/(steps)/booking-sheet?dealId=${encodeURIComponent(dealId)}`)}>← Back</button>
          <button className="primary" disabled={!dealId || !canGo} onClick={saveDocs}>Save Docs & Continue →</button>
        </div>
      </section>

      <Styles />
    </div>
  );
}

/* UI/Helpers */
function reqKey(r: Requirement) { return `${r.category}|${r.documentType}`; }
function collectDocs(reqs: Requirement[], vals: Record<string, { url: string; notes?: string; issuedAt?: string; expiresAt?: string }>) {
  const commercial: Array<{ type: string; url: string; notes?: string; issuedAt?: string; expiresAt?: string }> = [];
  const operational: Array<{ type: string; url: string; notes?: string; issuedAt?: string; expiresAt?: string }> = [];
  for (const r of reqs) {
    const k = reqKey(r); const v = vals[k]; if (!v?.url?.trim()) continue;
    const entry = { type: r.documentType, url: v.url.trim(), notes: v.notes, issuedAt: v.issuedAt, expiresAt: v.expiresAt };
    if (r.category === "COMMERCIAL") commercial.push(entry); else operational.push(entry);
  }
  return { commercial, operational };
}
function DocColumn({
  title, items, values, onChange,
}: {
  title: string;
  items: Requirement[];
  values: Record<string, { url: string; notes?: string; issuedAt?: string; expiresAt?: string }>;
  onChange: (key: string, patch: Partial<{ url: string; notes?: string; issuedAt?: string; expiresAt?: string }>) => void;
}) {
  return (
    <div>
      <h3 className="subtle" style={{ marginBottom: 6 }}>{title}</h3>
      {items.length === 0 && <p className="muted">No requirements.</p>}
      <div style={{ display:"grid", gap:10 }}>
        {items.map(r => {
          const key = reqKey(r);
          const v = values[key] || { url: "" };
          const unmet = r.mandatory && !v.url?.trim();
          return (
            <div key={key} className="req">
              <div className="req-h">{r.documentType}</div>
              <div className="muted" style={{fontSize:".8rem"}}>
                From: {r.requiredFrom} {r.mandatory ? "• Mandatory" : "• Optional"} {r.notes ? `• ${r.notes}` : ""}
              </div>
              <div style={{ display:"grid", gap:8, marginTop:8 }}>
                <input className="input" placeholder="Document URL" value={v.url} onChange={(e)=>onChange(key, { url: e.target.value })} />
                <input className="input" placeholder="Notes (optional)" value={v.notes || ""} onChange={(e)=>onChange(key, { notes: e.target.value })} />
                <div className="two">
                  <input className="input" placeholder="Issued At (YYYY-MM-DD)" value={v.issuedAt || ""} onChange={(e)=>onChange(key, { issuedAt: e.target.value })} />
                  <input className="input" placeholder="Expires At (YYYY-MM-DD)" value={v.expiresAt || ""} onChange={(e)=>onChange(key, { expiresAt: e.target.value })} />
                </div>
                {unmet && <div style={{ color:"#fca5a5", fontSize:".75rem" }}>Required to activate.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Styles() {
  return (
    <style jsx global>{`
      :root { --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%); --card: rgba(16,24,40,.72); --fg:#e2e8f0; --fg-muted:#94a3b8; --border:rgba(148,163,184,.18); }
      html, body { background: var(--bg); color: var(--fg); }
      .page { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: Inter, ui-sans-serif; }
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
      .req { background: rgba(16,24,40,.6); border: 1px solid var(--border); border-radius: 14px; padding: 12px; }
      .req-h { font-weight: 700; color: #e6f6ff; margin-bottom: 2px; }
    `}</style>
  );
}