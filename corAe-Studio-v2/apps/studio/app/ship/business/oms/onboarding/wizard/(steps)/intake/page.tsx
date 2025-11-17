"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getParam } from "@/app/lib/nav/qs";

/** BTDO Intake (Smart Survey) */

type PostRes =
  | { ok: true; dealId: string; nextStep: string | null }
  | { error: string | string[] };

type Relationship = "CLIENT" | "VENDOR" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
const RELS: Relationship[] = ["CLIENT", "VENDOR", "SUPPLIER", "SUBCONTRACTOR", "PARTNER"];

type PredictedDoc = {
  documentType: string;
  category: "COMMERCIAL" | "OPERATIONAL";
  requiredFrom: "CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
  mandatory: boolean;
};

function pretty(r: Relationship) {
  return r === "SUPPLIER" ? "Supplier" :
         r === "SUBCONTRACTOR" ? "Subcontractor" :
         r === "PARTNER" ? "Partner" :
         r === "VENDOR" ? "Vendor" : "Client";
}
function labelOrderType(v: "oneOff" | "recurring" | "project" | "emergency") {
  switch (v) {
    case "oneOff": return "One-off";
    case "recurring": return "Recurring";
    case "project": return "Project";
    case "emergency": return "Emergency";
  }
}
function nullIfEmpty<T extends string | undefined | null>(v: T): T | null { /* @ts-ignore */ return v && (v as any).trim?.().length ? v : null; }
function eqDoc(a: PredictedDoc, b: PredictedDoc) { return a.documentType === b.documentType && a.category === b.category; }

export default function IntakeStepPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [mode, setMode] = useState<"NEW" | "ESTABLISHED">("NEW");
  const [relationship, setRelationship] = useState<Relationship>("CLIENT");
  const surveyMode: "SALE" | "PROCUREMENT" = ["VENDOR","SUPPLIER","SUBCONTRACTOR","PARTNER"].includes(relationship) ? "PROCUREMENT" : "SALE";
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const m = getParam("mode", "") as any;
    if (m === "ESTABLISHED") setMode("ESTABLISHED");
    const rel = (getParam("relationship", "") as Relationship) || null;
    if (rel) setRelationship(rel);
    const cid = getParam("companyId", "");
    if (cid) setCompanyId(cid);
  }, []);

  const [lead, setLead] = useState({
    fullName: "", email: "", phone: "", product: "",
    intent: "Set up" as "Set up" | "Subscribe",
    companyName: "", plan: "Standard",
    roles: [relationship] as Relationship[],
    source: "",
    surveySiteAddress: "", surveyPreferredWindow: "", surveyAccessNotes: "",
  });

  const sectorOptions = ["Waste","Construction","Hospitality","Retail","Transport","Cleaning","Other"] as const;
  const [intake, setIntake] = useState({
    sector: "", service: "", workKind: "", geography: "", siteAddress: "",
    orderType: "oneOff" as "oneOff" | "recurring" | "project" | "emergency",
  });

  const [predictions, setPredictions] = useState<PredictedDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<PredictedDoc[]>([]);
  const canGo = useMemo(() => !busy, [busy]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wizard:seed");
      if (!raw) return;
      sessionStorage.removeItem("wizard:seed");
      const seed = JSON.parse(raw);
      if (seed?.companyId && !companyId) { setCompanyId(seed.companyId); setMode("ESTABLISHED"); }
      if (seed?.lead) setLead((v)=>({ ...v, ...seed.lead }));
      if (seed?.survey) {
        setIntake((s)=>({ ...s, siteAddress: seed.survey.siteAddress || s.siteAddress }));
        setLead((v)=>({ ...v,
          surveySiteAddress: seed.survey.siteAddress || v.surveySiteAddress,
          surveyPreferredWindow: seed.survey.preferredWindow || v.surveyPreferredWindow,
          surveyAccessNotes: seed.survey.accessNotes || v.surveyAccessNotes,
        }));
      }
      setMsg("✨ Prefilled.");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!intake.sector || !intake.service) { setPredictions([]); setSelectedDocs([]); return; }
      try {
        const url = `/api/ship/business/oms/onboarding/wizard/docs-required?sector=${encodeURIComponent(intake.sector)}&serviceType=${encodeURIComponent(intake.service)}&orderType=${intake.orderType}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Prediction failed");
        if (ignore) return;
        const preds: PredictedDoc[] = data.predictions || [];
        setPredictions(preds); setSelectedDocs(preds);
      } catch (e: any) { if (!ignore) setMsg(`⚠️ Doc prediction: ${e?.message || "Error"}`); }
    })();
    return () => { ignore = true; };
  }, [intake.sector, intake.service, intake.orderType]);

  async function createIntakeAndProceed() {
    setBusy(true); setMsg(null);
    try {
      const res1 = await fetch("/api/ship/business/oms/onboarding/wizard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "btdo.intake",
          payload: {
            sector: nullIfEmpty(intake.sector),
            service: nullIfEmpty(intake.service),
            workKind: nullIfEmpty(intake.workKind),
            geography: nullIfEmpty(intake.geography),
            siteAddress: nullIfEmpty(intake.siteAddress),
            meta: {
              companyId: companyId || null,
              lead: {
                fullName: lead.fullName || (mode === "ESTABLISHED" ? "Primary Contact" : ""),
                email: lead.email || null,
                phone: lead.phone || null,
                product: lead.product || null,
                intent: lead.intent,
                companyName: lead.intent === "Set up" ? lead.companyName || null : null,
                plan: lead.intent === "Subscribe" ? lead.plan : null,
                roles: [relationship],
                source: lead.source || null,
              },
              survey: {
                siteAddress: lead.surveySiteAddress || null,
                preferredWindow: lead.surveyPreferredWindow || null,
                accessNotes: lead.surveyAccessNotes || null,
              },
              established: mode === "ESTABLISHED",
              establishedRole: relationship,
              surveyMode,
              direction: surveyMode,
            },
            contacts: [
              {
                fullName: lead.fullName || "Primary Contact",
                email: lead.email || null,
                phone: lead.phone || null,
                role: pretty(relationship),
                primary: true,
                linkRole: "client",
              },
            ],
          },
        }),
      });
      const data1 = (await res1.json()) as PostRes;
      if (!res1.ok || "error" in data1) {
        const e = "error" in data1 ? (Array.isArray(data1.error) ? data1.error.join(", ") : data1.error) : "Failed";
        setMsg(`❌ ${e}`); setBusy(false); return;
      }
      const newDealId = data1.dealId;

      const docsPayload = selectedDocs.map(d => ({
        documentType: d.documentType,
        category: d.category,
        requiredFrom: surveyMode === "PROCUREMENT"
          ? (d.requiredFrom === "CLIENT" ? "SUPPLIER" : d.requiredFrom === "SUPPLIER" ? "CLIENT" : d.requiredFrom)
          : d.requiredFrom,
        mandatory: d.mandatory,
      }));
      if (docsPayload.length) {
        await fetch("/api/ship/business/oms/onboarding/wizard/docs-required", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dealId: newDealId,
            sector: intake.sector,
            serviceType: intake.service,
            orderType: intake.orderType,
            requiredDocs: docsPayload,
          }),
        }).catch(() => {});
      }

      setMsg("✅ Intake & required docs saved.");
      router.push(`/ship/business/oms/onboarding/wizard/(steps)/accept?dealId=${encodeURIComponent(newDealId)}`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Network error"}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <header className="top">
        <div className="top-left"><h1 className="title">BTDO Intake (Smart Survey)</h1></div>
        <div className="tag">{surveyMode === "SALE" ? "Sales Route" : "Procurement Route"}</div>
      </header>

      <section className="panel compact">
        <div className="row wrap">
          <div className="tag">Mode</div>
          <div className="chips">
            {["NEW","ESTABLISHED"].map(m => (
              <button key={m} className={`chip ${mode===m?"on":""}`} onClick={()=>setMode(m as any)}>{m==="NEW"?"New Lead":"Established"}</button>
            ))}
          </div>
          <div className="tag">Relationship</div>
          <div className="chips">
            {RELS.map(r => (
              <button key={r} className={`chip ${relationship===r?"on":""}`} onClick={()=>setRelationship(r)}>{pretty(r)}</button>
            ))}
          </div>
        </div>
      </section>

      {msg && <p className="muted" style={{margin:"8px 2px"}}>{msg}</p>}

      <section className="panel">
        <h2 className="subtle" style={{marginBottom:8}}>Scope</h2>
        <Two>
          <Field label="Sector">
            <div className="chips">
              {sectorOptions.map(s => (
                <button key={s} className={`chip ${intake.sector===s?"on":""}`} onClick={()=>setIntake({...intake, sector:s, service:""})}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="Order Type">
            <div className="chips">
              {(["oneOff","recurring","project","emergency"] as const).map(t => (
                <button key={t} className={`chip ${intake.orderType===t?"on":""}`} onClick={()=>setIntake({...intake, orderType:t})}>{labelOrderType(t)}</button>
              ))}
            </div>
          </Field>
        </Two>

        <Two>
          <Field label="Service"><ServiceMini sector={intake.sector} value={intake.service} onPick={(v)=>setIntake({...intake, service:v})} /></Field>
          <Field label="Geography"><input className="input" value={intake.geography} onChange={(e)=>setIntake({...intake, geography:e.target.value})} /></Field>
        </Two>

        <Two>
          <Field label="Work Kind"><input className="input" value={intake.workKind} onChange={(e)=>setIntake({...intake, workKind:e.target.value})} placeholder="e.g., Collection, Fit-out, Cleaning, Install" /></Field>
          <Field label={surveyMode==="SALE" ? "Site Address" : "Delivery / Collection Site"}><input className="input" value={intake.siteAddress} onChange={(e)=>setIntake({...intake, siteAddress:e.target.value})} /></Field>
        </Two>
      </section>

      <section className="panel">
        <h2 className="subtle" style={{marginBottom:8}}>Required Documentation (predicted)</h2>
        <div className="chips-wrap">
          {!intake.sector || !intake.service ? (
            <p className="muted">Select sector and service to see predicted docs.</p>
          ) : predictions.length === 0 ? (
            <p className="muted">No predictions for this combination. You can proceed and add docs later.</p>
          ) : (
            selectedDocs.map((d,i)=>(
              <button key={`${d.documentType}-${i}`} className="chip on" title={`${d.category} • ${d.requiredFrom}${d.mandatory?" • mandatory":""}`}
                onClick={()=>setSelectedDocs(arr=>arr.some(x=>eqDoc(x,d))?arr.filter(x=>!eqDoc(x,d)):[...arr,d])}>
                {d.documentType}
              </button>
            ))
          )}
        </div>
      </section>

      <div className="end">
        <button className="ghost" onClick={()=>router.push("/ship/business/oms/onboarding/wizard/(steps)/lead" as any)}>← Back</button>
        <button className="primary" disabled={!canGo} onClick={createIntakeAndProceed}>Save Intake & Continue →</button>
      </div>

      <style jsx global>{`
        :root {
          --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%);
          --card: rgba(16,24,40,.72);
          --card-2: rgba(16,24,40,.55);
          --fg:#e2e8f0; --fg-muted:#94a3b8; --border:rgba(148,163,184,.18);
          --pill:linear-gradient(180deg,#0e1626 0%,#0b1220 100%); --pill-on:linear-gradient(180deg,#0ea5e9 0%,#0284c7 100%);
          --shadow-inner: inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35);
          --shadow-outer:0 24px 60px rgba(2,6,23,.55);
        }
        html, body { background: var(--bg); color: var(--fg); }
        .page { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: Inter, ui-sans-serif; }
        .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .title { font-weight:700; font-size:1.3rem; color:#e5f3ff; }
        .panel { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:14px; box-shadow:var(--shadow-outer), var(--shadow-inner); margin-bottom:12px; }
        .panel.compact { background: var(--card-2); }
        .row { display:flex; align-items:center; gap:10px; }
        .wrap { flex-wrap:wrap; }
        .tag { font-size:.8rem; color:var(--fg-muted); padding:4px 8px; border-radius:9999px; border:1px solid var(--border); background:rgba(255,255,255,.02); }
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { padding:.55rem .9rem; border-radius:9999px; border:1px solid var(--border); background:var(--pill); color:#cfe9ff; box-shadow:var(--shadow-inner); font-weight:600; }
        .chip.on { background: var(--pill-on); color: #fff; border-color:#0ea5e9; }
        .input { width:100%; border-radius:12px; padding:.75rem .9rem; background:#0b1323; color:var(--fg); border:1px solid var(--border); box-shadow:inset 0 2px 6px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06); }
        .two { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:680px){ .two{ grid-template-columns:1fr 1fr; } }
        .chips-wrap{ display:flex; flex-wrap:wrap; gap:8px; }
        .muted { color: var(--fg-muted); }
        .ghost{ background:#0a1222; color:#d1eaff; border:1px solid var(--border); padding:.7rem 1.1rem; border-radius:12px; box-shadow:var(--shadow-inner); }
        .primary{ background:linear-gradient(180deg,#22d3ee 0%,#0ea5e9 55%,#0284c7 100%); color:#00121c; font-weight:800; padding:.75rem 1.15rem; border-radius:12px; border:none; }
        .end{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:12px; }
      `}</style>
    </div>
  );
}

/* UI bits */
function Two({ children }: { children: React.ReactNode }) { return <div className="two">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><div className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>{label}</div>{children}</div>);
}
function ServiceMini({ sector, value, onPick }: { sector: string; value: string; onPick: (v: string)=>void; }) {
  const map: Record<string, string[]> = {
    Waste:["General Waste","Food Waste"],
    Construction:["Skip Hire","Material Supply"],
    Hospitality:["Kitchen Deep Clean","Pest Control"],
    Retail:["Stock Supply"], Transport:["Courier"], Cleaning:["General Cleaning"], Other:["Custom"]
  };
  const list = map[sector] || [];
  if (!sector) return <input className="input" value={value} onChange={(e)=>onPick(e.target.value)} placeholder="Pick a sector first" />;
  return (
    <div className="chips">
      {list.map(opt => <button key={opt} className={`chip ${value===opt?"on":""}`} onClick={()=>onPick(opt)}>{opt}</button>)}
      {sector==="Other" && <input className="input" value={value} onChange={(e)=>onPick(e.target.value)} placeholder="Describe service" />}
    </div>
  );
}