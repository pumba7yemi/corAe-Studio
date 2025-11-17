"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import WizardShell from "@shared/wizard";
import MaintenancePage from "../../../../home/onboarding/wizard/maintenance/page";

/**
 * Local fallback EthosCard component to avoid missing module errors.
 * If you later add a shared component at "@/components/EthosCard", you can remove this.
 */
const EthosCard: React.FC = () => {
  return (
    <div className="panel" role="article" aria-label="Ethos">
      <h3 className="subtle" style={{ marginBottom: 6 }}>corAe</h3>
      <div className="muted">Welcome to the onboarding wizard — this is a lightweight placeholder Ethos card.</div>
    </div>
  );
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

/* ───────────────────────── Types ───────────────────────── */
type StepName =
  | "lead"
  | "btdo.intake"
  | "btdo.accept"
  | "bdo.pricelock"      // <— Contract gate replaced by Pricelock gate
  | "bdo.booking-sheet"
  | "bdo.documentation"
  | "bdo.activate";

type PostRes =
  | { ok: true; dealId: string; nextStep: StepName | null }
  | { error: string | string[] };

async function postStep(step: StepName, payload: any): Promise<PostRes> {
  const res = await fetch("/api/ship/business/oms/onboarding/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, payload }),
  });
  return res.json();
}

type PredictedDoc = {
  documentType: string;
  category: "COMMERCIAL" | "OPERATIONAL";
  requiredFrom: "CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
  mandatory: boolean;
};

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

type Relationship = "CLIENT" | "VENDOR" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
const RELS: Relationship[] = ["CLIENT", "VENDOR", "SUPPLIER", "SUBCONTRACTOR", "PARTNER"];

/* helpers */
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function labelOrderType(v: "oneOff" | "recurring" | "project" | "emergency") {
  switch (v) {
    case "oneOff": return "One-off";
    case "recurring": return "Recurring";
    case "project": return "Project";
    case "emergency": return "Emergency";
  }
}
function reqKey(r: Requirement) { return `${r.category}|${r.documentType}`; }
function hasDoc(arr: PredictedDoc[], d: PredictedDoc) { return arr.some((x) => eqDoc(x, d)); }
function eqDoc(a: PredictedDoc, b: PredictedDoc) { return a.documentType === b.documentType && a.category === b.category; }
function nullIfEmpty<T extends string | undefined | null>(v: T): T | null { /* @ts-ignore */ return v && (v as any).trim?.().length ? v : null; }
function pretty(r: Relationship) {
  return r === "SUPPLIER" ? "Supplier" :
         r === "SUBCONTRACTOR" ? "Subcontractor" :
         r === "PARTNER" ? "Partner" :
         r === "VENDOR" ? "Vendor" : "Client";
}

/* ───────────────────────── Page ───────────────────────── */
export default function WizardPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [dealId, setDealId] = useState<string | null>(null);
  const [step, setStep] = useState<StepName>("lead");
  const [msg, setMsg] = useState<string | null>(null);

  // Mode + relationship (NEW vs ESTABLISHED)
  const [mode, setMode] = useState<"NEW" | "ESTABLISHED">("NEW");
  const [relationship, setRelationship] = useState<Relationship>("CLIENT");

  // SALE vs PROCUREMENT survey route (mirrors questions/labels)
  const surveyMode: "SALE" | "PROCUREMENT" =
    ["VENDOR", "SUPPLIER", "SUBCONTRACTOR", "PARTNER"].includes(relationship) ? "PROCUREMENT" : "SALE";

  // carry companyId from signup if present
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Lead
  const [lead, setLead] = useState({
    fullName: "",
    email: "",
    phone: "",
    product: "",
    intent: "Set up" as "Set up" | "Subscribe",
    companyName: "",
    plan: "Standard",
    roles: [] as Relationship[],
    source: "",
    surveySiteAddress: "",
    surveyPreferredWindow: "",
    surveyAccessNotes: "",
  });

  // Established selector fields
  const [existingQuery, setExistingQuery] = useState(""); // id or name
  const [existingPrimaryEmail, setExistingPrimaryEmail] = useState("");

  // Intake
  const sectorOptions = ["Waste","Construction","Hospitality","Retail","Transport","Cleaning","Other"] as const;

  const [intake, setIntake] = useState({
    sector: "",
    service: "",
    workKind: "",
    geography: "",
    siteAddress: "",
    orderType: "oneOff" as "oneOff" | "recurring" | "project" | "emergency",
    companyId: "",
  });

  const [predictions, setPredictions] = useState<PredictedDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<PredictedDoc[]>([]);

  // Acceptance
  const [accept, setAccept] = useState({
    quoteId: "",
    priceLocked: true,
    corAeConfirmed: true,
    acceptedByEmail: "",
    note: "",
  });

  // Pricelock Chain™
  const [selectedCurrency, setSelectedCurrency] = useState("AED");
  const [contractTotal, setContractTotal] = useState<string>("");
  const [pricelockWindowDays, setPricelockWindowDays] = useState<number>(7);
  const [contractSignerEmail, setContractSignerEmail] = useState("");
  const [contractSignerName, setContractSignerName] = useState("");

  // Booking
  const [booking, setBooking] = useState({
    poNumber: "",
    soNumber: "",
    bookingSheetUrl: "",
    confirmedByEmail: "",
  });

  // Docs
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [docInputs, setDocInputs] = useState<Record<string, { url: string; notes?: string; issuedAt?: string; expiresAt?: string }>>({});
  const [unmetMandatory, setUnmetMandatory] = useState<number>(0);

  const canGo = useMemo(() => !busy, [busy]);

  /* ───────── Prefill from QS / session ───────── */
  useEffect(() => {
    try {
      // derive companyId from the client URL; avoids next/navigation hook requiring Suspense
      if (typeof window !== "undefined") {
        const q = new URLSearchParams(window.location.search);
        const fromQS = q.get("companyId");
        if (fromQS) {
          setCompanyId(fromQS);
          setIntake((s) => ({ ...s, companyId: fromQS }));
          setMode("ESTABLISHED");
        }
      }
      const raw = sessionStorage.getItem("wizard:seed");
      if (!raw) return;
      sessionStorage.removeItem("wizard:seed");
      const seed = JSON.parse(raw);

      if (seed?.companyId) {
        setCompanyId(seed.companyId);
        setIntake((s) => ({ ...s, companyId: seed.companyId }));
        setMode("ESTABLISHED");
      }
      if (seed?.lead) {
        setStep("lead");
        setLead((v) => ({
          ...v,
          fullName: seed.lead.fullName || v.fullName,
          email: seed.lead.email || v.email,
          phone: seed.lead.phone || v.phone,
          product: seed.lead.product || v.product,
          intent: seed.lead.intent || v.intent,
          companyName: seed.lead.companyName || v.companyName,
          plan: seed.lead.plan || v.plan,
          roles: (seed.lead.roles as Relationship[]) || v.roles,
          source: seed.lead.source || v.source,
        }));
      }
      if (seed?.survey) {
        setIntake((s) => ({ ...s, siteAddress: seed.survey.siteAddress || s.siteAddress }));
        setLead((v) => ({
          ...v,
          surveySiteAddress: seed.survey.siteAddress || v.surveySiteAddress,
          surveyPreferredWindow: seed.survey.preferredWindow || v.surveyPreferredWindow,
          surveyAccessNotes: seed.survey.accessNotes || v.surveyAccessNotes,
        }));
      }
      setMsg("✨ Prefilled.");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────── Predict docs ───────── */
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!intake.sector || !intake.service) {
        setPredictions([]);
        setSelectedDocs([]);
        return;
      }
      try {
        const url = `/api/ship/business/oms/onboarding/wizard/docs-required?sector=${encodeURIComponent(
          intake.sector
        )}&serviceType=${encodeURIComponent(intake.service)}&orderType=${intake.orderType}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Prediction failed");
        if (ignore) return;
        const preds: PredictedDoc[] = data.predictions || [];
        setPredictions(preds);
        setSelectedDocs(preds);
      } catch (e: any) {
        if (!ignore) setMsg(`⚠️ Doc prediction: ${e?.message || "Error"}`);
      }
    })();
    return () => { ignore = true; };
  }, [intake.sector, intake.service, intake.orderType]);

  /* ───────── Load BDO requirements ───────── */
  useEffect(() => {
    if (!dealId) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/ship/business/oms/onboarding/wizard/docs-required/list?dealId=${encodeURIComponent(dealId)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load requirements");
        const reqs: Requirement[] = data.requirements || [];
        setRequirements(reqs);

        const init: Record<string, any> = {};
        for (const r of reqs) init[reqKey(r)] = { url: "", notes: "" };
        setDocInputs(init);
        setUnmetMandatory(reqs.filter((r) => r.mandatory).length);
      } catch (e: any) {
        setMsg(`⚠️ Could not load requirements: ${e?.message || "Error"}`);
      }
    })();
  }, [dealId]);

  /* ───────── Track docs completeness ───────── */
  useEffect(() => {
    if (!requirements.length) return;
    const unmet = requirements.filter((r) => r.mandatory && !docInputs[reqKey(r)]?.url?.trim()).length;
    setUnmetMandatory(unmet);
  }, [requirements, docInputs]);

  async function run(stepName: StepName, payload: any) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await postStep(stepName, payload);
      if ("error" in res) {
        const e = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setMsg(`❌ ${e}`);
        return;
      }
      setDealId(res.dealId);
      if (res.nextStep) {
        setStep(res.nextStep);
        setMsg("✅ Saved.");
      } else {
        setMsg("🎉 Done. Deal is ACTIVE.");
      }
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Network error"}`);
    } finally {
      setBusy(false);
    }
  }

  /* ─────────────────────── Render ─────────────────────── */
  const LegacyView = () => (
    <div className={`page ${inter.variable}`}>
      {/* Top bar */}
  <header className="top">
        <div className="top-left">
          <button
            className="circle"
            onClick={() => router.push("/ship/business/oms/onboarding/wizard/signup")}
            title="Signup"
          >←</button>
          <h1 className="title">Onboarding Wizard</h1>
        </div>
        <button
          className="circle"
          onClick={() => {
            if (!dealId) return;
            // cast to any to satisfy the router.push typing for dynamic route
            router.push(`/ship/business/oms/deals/${dealId}` as any);
          }}
          disabled={!dealId}
          title="Go to Deal"
        >→</button>
      </header>

      {/* Ethos intro */}
      <div className="mt-4">
        <EthosCard />
      </div>

      {/* Memory of corAe — quick reference panel */}
      <div role="region" aria-labelledby="memory-title" className="mb-4 rounded-md border p-3 bg-white/80 dark:bg-neutral-900/80">
        <h3 id="memory-title" className="text-sm font-semibold">Memory of corAe — Quick Reference</h3>
        <p className="text-xs mt-1">“We are corAe — the mother to the mother, the colleague to the worker, the silent partner to the owner.”</p>

        <div className="mt-2 text-xs">
          <strong>TOC</strong>
          <ul className="list-disc pl-5">
            <li><a href="apps/studio/docs/memory/BUSINESS.md#10-0-corAe-business-oms" className="underline">10.0 corAe Business OMS</a></li>
            <li><a href="apps/studio/docs/memory/BUSINESS.md#10-1-numerological-order" className="underline">10.1 Numerological Order</a></li>
            <li><a href="apps/studio/docs/memory/BUSINESS.md#10-3-obari-spine" className="underline">10.3 OBARI Spine</a></li>
          </ul>
        </div>

        <div className="mt-2">
          <a href="apps/studio/docs/memory/BUSINESS.md#10-index" className="text-xs font-medium underline">Read the Business Memory →</a>
        </div>
      </div>

      {/* Mode + Relationship */}
      <section className="panel compact">
        <div className="row wrap">
          <div className="tag">Mode</div>
          <Segment
            value={mode}
            onChange={setMode}
            options={[["NEW","New Lead"],["ESTABLISHED","Established"]]}
          />
          {mode === "ESTABLISHED" && (
            <div className="row flex1 gap">
              <input
                className="input flex1"
                placeholder="Account ID or Name"
                value={existingQuery}
                onChange={(e) => setExistingQuery(e.target.value)}
              />
              <button
                className="ghost"
                onClick={() => {
                  const val = existingQuery.trim();
                  if (!val) return;
                  setCompanyId(val);
                  setIntake((s) => ({ ...s, companyId: val }));
                  setMsg("🔗 Established account linked.");
                }}
              >Link</button>
            </div>
          )}
        </div>

        <div className="row wrap mt">
          <div className="tag">Relationship</div>
          <div className="chips">
            {RELS.map((r) => (
              <button key={r} className={`chip ${relationship === r ? "on" : ""}`} onClick={() => setRelationship(r)}>
                {pretty(r)}
              </button>
            ))}
          </div>
          <span className="badge">{surveyMode === "SALE" ? "Sales Route" : "Procurement Route"}</span>
        </div>
      </section>

      <StepsBar step={step} unmet={unmetMandatory} />
      {msg && <p className="note">{msg}</p>}

      {/* LEAD (NEW) */}
      {step === "lead" && mode === "NEW" && (
        <Panel title="Lead (First Contact)">
          <Two>
            <Field label="Full Name"><input className="input" value={lead.fullName} onChange={(e) => setLead({ ...lead, fullName: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} /></Field>
          </Two>

          <Two>
            <Field label="Phone"><input className="input" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} /></Field>
            <Field label="Product Interested In">
              <input className="input" value={lead.product} placeholder="e.g., Pest control | Deep clean | Fit-out" onChange={(e) => setLead({ ...lead, product: e.target.value })} />
            </Field>
          </Two>

          <Two>
            <Field label="Intent">
              <select className="input" value={lead.intent} onChange={(e) => setLead({ ...lead, intent: e.target.value as any })}>
                <option>Set up</option><option>Subscribe</option>
              </select>
            </Field>
            {lead.intent === "Set up" ? (
              <Field label="Company / Person Name"><input className="input" value={lead.companyName} onChange={(e) => setLead({ ...lead, companyName: e.target.value })} /></Field>
            ) : (
              <Field label="Plan">
                <select className="input" value={lead.plan} onChange={(e) => setLead({ ...lead, plan: e.target.value })}>
                  <option>Standard</option><option>Pro</option><option>Enterprise</option>
                </select>
              </Field>
            )}
          </Two>

          <Field label="How did you hear about us?">
            <select className="input" value={lead.source} onChange={(e) => setLead({ ...lead, source: e.target.value })}>
              <option value="">Select one</option>
              <option>Google Search</option><option>Social Media</option><option>Friend or Referral</option>
              <option>Existing Client</option><option>Event / Expo</option><option>Other</option>
            </select>
          </Field>

          <h3 className="subtle">Survey</h3>
          <Two>
            <Field label={surveyMode === "SALE" ? "Site Address" : "Delivery / Collection Site"}>
              <input className="input" value={lead.surveySiteAddress} onChange={(e) => setLead({ ...lead, surveySiteAddress: e.target.value })} />
            </Field>
            <Field label={surveyMode === "SALE" ? "Preferred Window" : "Proposed Delivery Window"}>
              <input className="input" value={lead.surveyPreferredWindow} placeholder={surveyMode === "SALE" ? "e.g., Tue AM next week" : "e.g., Thu 09:00–11:00"} onChange={(e) => setLead({ ...lead, surveyPreferredWindow: e.target.value })} />
            </Field>
          </Two>
          <Field label={surveyMode === "SALE" ? "Access / Notes" : "Offload / Access / Notes"}>
            <input className="input" value={lead.surveyAccessNotes} placeholder={surveyMode === "SALE" ? "Gate code, key-holder, PPE…" : "Dock, forklift, packaging…"} onChange={(e) => setLead({ ...lead, surveyAccessNotes: e.target.value })} />
          </Field>

          <div className="end">
            <button className="ghost" onClick={() => router.push("/ship/business/oms/onboarding/wizard/company")}>Company/Person setup</button>
            <button
              disabled={!canGo || !(lead.fullName && (lead.email || lead.phone) && lead.product)}
              className="primary"
              onClick={() => {
                setStep("btdo.intake");
                setMsg("Lead captured. Continue to BTDO Intake.");
                if (lead.surveySiteAddress) setIntake((s) => ({ ...s, siteAddress: lead.surveySiteAddress }));
                setLead((v) => ({ ...v, roles: [relationship] }));
              }}
            >Save Lead & Continue →</button>
          </div>
        </Panel>
      )}

      {step === "lead" && mode === "ESTABLISHED" && (
        <Panel title="Established Account">
          <Two>
            <Field label="Linked Account (ID or Name)">
              <input className="input" value={companyId || ""} placeholder="e.g., acc_123 or 'White Pallets LLC'"
                onChange={(e) => { setCompanyId(e.target.value); setIntake((s) => ({ ...s, companyId: e.target.value })); }} />
            </Field>
            <Field label="Primary Contact (Email, optional)">
              <input className="input" value={existingPrimaryEmail} onChange={(e) => setExistingPrimaryEmail(e.target.value)} placeholder="ops@company.com" />
            </Field>
          </Two>
          <div className="end">
            <button className="ghost" onClick={() => setMode("NEW")}>← Switch to New Lead</button>
            <button className="primary" disabled={!companyId} onClick={() => {
              setLead((v) => ({ ...v, roles: [relationship] }));
              setStep("btdo.intake");
              setMsg("🔗 Established account linked. Proceed to Intake.");
            }}>Continue to Intake →</button>
          </div>
        </Panel>
      )}

      {/* INTAKE */}
      {step === "btdo.intake" && (
        <Panel title={`BTDO Intake (${surveyMode === "SALE" ? "Sales" : "Procurement"} Survey)`}>
          <h3 className="subtle">Scope</h3>
          <Two>
            <Field label="Sector">
              <div className="chips">
                {sectorOptions.map((s) => (
                  <button key={s} className={`chip ${intake.sector === s ? "on" : ""}`} onClick={() => setIntake({ ...intake, sector: s, service: "" })}>{s}</button>
                ))}
              </div>
            </Field>
            <Field label="Order Type">
              <div className="chips">
                {(["oneOff","recurring","project","emergency"] as const).map((t) => (
                  <button key={t} className={`chip ${intake.orderType === t ? "on" : ""}`} onClick={() => setIntake({ ...intake, orderType: t })}>{labelOrderType(t)}</button>
                ))}
              </div>
            </Field>
          </Two>

          <Two>
            <Field label="Service"><ServiceMini sector={intake.sector} value={intake.service} onPick={(v) => setIntake({ ...intake, service: v })} /></Field>
            <Field label="Geography"><input className="input" value={intake.geography} onChange={(e) => setIntake({ ...intake, geography: e.target.value })} /></Field>
          </Two>

          <Two>
            <Field label="Work Kind"><input className="input" value={intake.workKind} placeholder="e.g., Collection, Fit-out, Cleaning, Install" onChange={(e) => setIntake({ ...intake, workKind: e.target.value })} /></Field>
            <Field label="Site Address"><input className="input" value={intake.siteAddress} onChange={(e) => setIntake({ ...intake, siteAddress: e.target.value })} /></Field>
          </Two>

          <h3 className="subtle">Required Documentation (predicted)</h3>
          <div className="chips-wrap">
            {predictions.length === 0 && <p className="muted">Select sector and service to see predicted docs.</p>}
            {selectedDocs.map((d, i) => <DocChip key={`${d.documentType}-${i}`} doc={d} onToggle={() => setSelectedDocs((arr) => hasDoc(arr, d) ? arr.filter((x) => !eqDoc(x, d)) : [...arr, d])} />)}
          </div>

          <div className="end">
            <button className="ghost" onClick={() => setStep("lead")}>← Back</button>
            <button
              disabled={!canGo}
              className="primary"
              onClick={async () => {
                // 1) Save intake
                await run("btdo.intake", {
                  sector: nullIfEmpty(intake.sector),
                  service: nullIfEmpty(intake.service),
                  workKind: nullIfEmpty(intake.workKind),
                  geography: nullIfEmpty(intake.geography),
                  siteAddress: nullIfEmpty(intake.siteAddress),
                  meta: {
                    companyId: companyId || intake.companyId || null,
                    lead: {
                      fullName: lead.fullName || (mode === "ESTABLISHED" ? "Primary Contact" : ""),
                      email: lead.email || (existingPrimaryEmail || null),
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
                  contacts:
                    mode === "ESTABLISHED"
                      ? (existingPrimaryEmail
                          ? [{ fullName: lead.fullName || "Primary Contact", email: existingPrimaryEmail, role: "Operations", primary: true }]
                          : [])
                      : [{
                          fullName: lead.fullName,
                          email: lead.email || null,
                          phone: lead.phone || null,
                          role: "Client",
                          primary: true,
                          linkRole: "client",
                        }],
                });

                // 2) Persist docs-required with mirroring in procurement
                const docsPayload = selectedDocs.map(d => ({
                  documentType: d.documentType,
                  category: d.category,
                  requiredFrom:
                    surveyMode === "PROCUREMENT"
                      ? (d.requiredFrom === "CLIENT" ? "SUPPLIER" : d.requiredFrom === "SUPPLIER" ? "CLIENT" : d.requiredFrom)
                      : d.requiredFrom,
                  mandatory: d.mandatory,
                }));
                if (docsPayload.length && dealId) {
                  await fetch("/api/ship/business/oms/onboarding/wizard/docs-required", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      dealId,
                      sector: intake.sector,
                      serviceType: intake.service,
                      orderType: intake.orderType,
                      requiredDocs: docsPayload,
                    }),
                  });
                }
                setStep("btdo.accept");
                setMsg(`✅ Intake & required docs saved (${surveyMode.toLowerCase()} route).`);
              }}
            >Save Intake & Continue →</button>
          </div>
        </Panel>
      )}

      {/* ACCEPT */}
      {step === "btdo.accept" && (
        <Panel title="Quote Acceptance (Pricelock + corAe Confirmed)">
          <Two>
            <Field label="Quote ID"><input className="input" value={accept.quoteId} onChange={(e) => setAccept({ ...accept, quoteId: e.target.value })} /></Field>
            <Field label="Accepted By (Email)"><input className="input" value={accept.acceptedByEmail} onChange={(e) => setAccept({ ...accept, acceptedByEmail: e.target.value })} /></Field>
          </Two>
          <Two>
            <Check label="Price Locked (Pricelock)" checked={accept.priceLocked} onChange={(v) => setAccept({ ...accept, priceLocked: v })} />
            <Check label="corAe Confirmed" checked={accept.corAeConfirmed} onChange={(v) => setAccept({ ...accept, corAeConfirmed: v })} />
          </Two>
          <Field label="Acceptance Note"><input className="input" value={accept.note} onChange={(e) => setAccept({ ...accept, note: e.target.value })} /></Field>

          <div className="end">
            <button className="ghost" onClick={() => setStep("btdo.intake")}>← Back</button>
            <button
              disabled={!canGo || !dealId}
              className="primary"
              onClick={() =>
                run("btdo.accept", {
                  dealId,
                  quoteId: accept.quoteId,
                  priceLocked: accept.priceLocked,
                  corAeConfirmed: accept.corAeConfirmed,
                  acceptedBy: accept.acceptedByEmail ? { email: accept.acceptedByEmail } : undefined,
                  note: nullIfEmpty(accept.note),
                })
              }
            >Save & Continue →</button>
          </div>
        </Panel>
      )}

      {/* PRICELOCK CHAIN (new gate replacing Contract) */}
      {step === "bdo.pricelock" && (
        <Panel title="corAe Pricelock Chain™">
          <Two>
            <Field label="Total">
              <input className="input" type="number" value={contractTotal} onChange={(e) => setContractTotal(e.target.value)} placeholder="e.g., 1250" />
            </Field>
            <Field label="Currency">
              <select className="input" value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                <option>AED</option><option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </Field>
          </Two>
          <Two>
            <Field label="Validity (days)">
              <input className="input" type="number" min={1} value={pricelockWindowDays} onChange={(e) => setPricelockWindowDays(Number(e.target.value || 1))} />
            </Field>
            <Field label="Signer (Email)">
              <input className="input" value={contractSignerEmail} onChange={(e) => setContractSignerEmail(e.target.value)} placeholder="ops@customer.com" />
            </Field>
          </Two>
          <Field label="Signer (Name)">
            <input className="input" value={contractSignerName} onChange={(e) => setContractSignerName(e.target.value)} placeholder="e.g., Jane Smith" />
          </Field>

          <div className="end">
            <button className="ghost" onClick={() => setStep("btdo.accept")}>← Back</button>
            <button
              disabled={!canGo || !dealId || !contractTotal}
              className="primary"
              onClick={async () => {
                const priceNumber = Number(contractTotal);
                if (!priceNumber || priceNumber <= 0) { setMsg("❌ Enter a valid total."); return; }

                // (optional) create PricelockChain before booking confirmation
                await fetch("/api/ship/business/oms/onboarding/wizard/pricelock", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    dealId,
                    price: priceNumber,
                    currency: selectedCurrency,
                    validFrom: new Date().toISOString(),
                    validUntil: addDays(new Date(), pricelockWindowDays).toISOString(),
                    confirmedBy: contractSignerName || contractSignerEmail || null,
                  }),
                });

                setMsg("🔒 Pricelock Chain created.");
                setStep("bdo.booking-sheet");
              }}
            >Create Pricelock & Continue →</button>
          </div>
        </Panel>
      )}

      {/* BOOKING SHEET */}
      {step === "bdo.booking-sheet" && (
        <Panel title="Email Booking Sheet (PO + SO)">
          <Two>
            <Field label="PO Number"><input className="input" value={booking.poNumber} onChange={(e) => setBooking({ ...booking, poNumber: e.target.value })} /></Field>
            <Field label="SO Number"><input className="input" value={booking.soNumber} onChange={(e) => setBooking({ ...booking, soNumber: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Booking Sheet URL"><input className="input" value={booking.bookingSheetUrl} onChange={(e) => setBooking({ ...booking, bookingSheetUrl: e.target.value })} /></Field>
            <Field label="Confirmed By (Email)"><input className="input" value={booking.confirmedByEmail} onChange={(e) => setBooking({ ...booking, confirmedByEmail: e.target.value })} /></Field>
          </Two>

          <div className="end">
            <button className="ghost" onClick={() => setStep("bdo.pricelock")}>← Back</button>
            <button
              disabled={!canGo || !dealId}
              className="primary"
              onClick={() =>
                run("bdo.booking-sheet", {
                  dealId,
                  poNumber: booking.poNumber,
                  soNumber: booking.soNumber,
                  bookingSheetUrl: booking.bookingSheetUrl,
                  confirmedBy: booking.confirmedByEmail ? { email: booking.confirmedByEmail } : undefined,
                })
              }
            >Save & Continue →</button>
          </div>
        </Panel>
      )}

      {/* DOCUMENTATION */}
      {step === "bdo.documentation" && (
        <Panel title="Documentation (Order)">
          {requirements.length === 0 && <p className="muted">No predefined requirements found. You can still add docs below (attach Contract PDF here if applicable).</p>}

          <div className="grid two">
            <DocColumn
              title="Commercial"
              items={requirements.filter((r) => r.category === "COMMERCIAL")}
              values={docInputs}
              onChange={(k, v) => setDocInputs((s) => ({ ...s, [k]: { ...s[k], ...v } }))}
            />
            <DocColumn
              title="Operational"
              items={requirements.filter((r) => r.category === "OPERATIONAL")}
              values={docInputs}
              onChange={(k, v) => setDocInputs((s) => ({ ...s, [k]: { ...s[k], ...v } }))}
            />
          </div>

          <div className="muted mt">Mandatory outstanding: <b>{unmetMandatory}</b></div>

          <div className="end">
            <button className="ghost" onClick={() => setStep("bdo.booking-sheet")}>← Back</button>
            <button
              disabled={!canGo || !dealId}
              className="primary"
              onClick={async () => {
                const { commercial, operational } = collectDocs(requirements, docInputs);
                if (!commercial.length && !operational.length) { setMsg("⚠️ Add at least one document URL before saving."); return; }
                const res = await fetch("/api/ship/business/oms/onboarding/wizard/documentation", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ dealId, commercial, operational }),
                });
                const data = await res.json();
                if (!res.ok || !data?.ok) { setMsg(`❌ Could not save docs: ${data?.error || "Error"}`); return; }
                setMsg("✅ Documentation saved.");
                setStep("bdo.activate");
              }}
            >Save Docs & Continue →</button>
          </div>
        </Panel>
      )}

      {/* ACTIVATE */}
      {step === "bdo.activate" && (
        <Panel title="Activate Deal">
          <p className="muted">All gates passed. Mandatory docs outstanding: <b>{unmetMandatory}</b>.</p>
          <div className="end">
            <button className="ghost" onClick={() => setStep("bdo.documentation")}>← Back</button>
            <button
              disabled={!canGo || !dealId || unmetMandatory > 0}
              className="primary"
              onClick={() => run("bdo.activate", { dealId })}
              title={unmetMandatory > 0 ? "Upload all mandatory documents first" : "Activate"}
            >Activate →</button>
          </div>
        </Panel>
      )}

      {/* Theme & Styles (single global block; no nested styled-jsx) */}
      <style jsx global>{`
        :root {
          --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%);
          --surface: rgba(16, 24, 40, .6);
          --card: rgba(16, 24, 40, .72);
          --card-2: rgba(16, 24, 40, .55);
          --ring: #0ea5e9;
          --ring-soft: rgba(14,165,233,.28);
          --fg: #e2e8f0;
          --fg-muted: #94a3b8;
          --border: rgba(148,163,184,.18);
          --white: #ffffff;
          --black: #000;
          --shadow-outer: 0 24px 60px rgba(2,6,23,.55);
          --shadow-inner: inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35);
          --pill: linear-gradient(180deg, #0e1626 0%, #0b1220 100%);
          --pill-on: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
        }
        html, body { background: var(--bg); color: var(--fg); }
        .page { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: var(--font-inter), Inter, ui-sans-serif; }
        .top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
        .top-left { display:flex; align-items:center; gap:10px; }
        .title { font-weight: 700; letter-spacing:.2px; font-size: 1.4rem; color: #e5f3ff; text-shadow: 0 2px 24px rgba(14,165,233,.25); }
        .circle { width:36px;height:36px;border-radius:9999px;border:1px solid var(--border); background: var(--pill); color:#dbeafe;
                  box-shadow: var(--shadow-inner), 0 6px 18px rgba(14,165,233,.15); }
        .circle:disabled { opacity:.4; }
        .panel { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 14px; box-shadow: var(--shadow-outer), var(--shadow-inner); }
        .panel.compact { background: var(--card-2); }
        .row { display:flex; align-items:center; gap:10px; }
        .wrap { flex-wrap: wrap; }
        .flex1 { flex: 1 1 320px; }
        .gap { gap: 8px; }
        .mt { margin-top: 6px; }
        .tag { font-size:.8rem; color: var(--fg-muted); padding: 4px 8px; border-radius: 9999px; border: 1px solid var(--border); background: rgba(255,255,255,.02); }
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { padding:.55rem .9rem; border-radius:9999px; border:1px solid var(--border); background: var(--pill); color:#cfe9ff;
                box-shadow: var(--shadow-inner), 0 8px 18px rgba(2,6,23,.35); font-weight:600; }
        .chip.on { background: var(--pill-on); color: white; border-color: #0ea5e9;
                   box-shadow: 0 12px 30px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.15); }
        .badge { font-size:.72rem; padding:.2rem .5rem; border-radius:.5rem; border:1px solid var(--border); background:#0b1323; color:#bfe7ff; }
        .input { width: 100%; border-radius: 12px; padding: .75rem .9rem; background: #0b1323; color: var(--fg); border: 1px solid var(--border);
                 box-shadow: inset 0 2px 6px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06); }
        .input::placeholder { color: #7aa6c3; }
        .primary { background: linear-gradient(180deg, #22d3ee 0%, #0ea5e9 55%, #0284c7 100%);
                   color:#00121c; font-weight: 800; padding: .75rem 1.15rem; border-radius: 12px; border: none;
                   box-shadow: 0 20px 50px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.35); }
        .primary:disabled { opacity:.55; box-shadow:none; }
        .ghost { background: #0a1222; color: #d1eaff; border: 1px solid var(--border); padding:.7rem 1.1rem; border-radius: 12px; box-shadow: var(--shadow-inner); }
        .note { color: var(--fg-muted); margin: 8px 2px; }
        .grid.two { display:grid; grid-template-columns: 1fr; gap:12px; }
        @media (min-width: 680px) { .grid.two { grid-template-columns: 1fr 1fr; } }
        .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top: 10px; }
        .muted { color: var(--fg-muted); }
        .subtle { color: #cdeaff; font-weight: 600; margin-top: 6px; }
        /* Steps bar */
        .steps { margin: 12px 0 10px; position: relative; }
        .steps-track { height: 3px; background: linear-gradient(90deg, rgba(14,165,233,.15), rgba(14,165,233,.45)); border-radius: 9999px; position: relative; box-shadow: 0 0 20px rgba(14,165,233,.25) inset; }
        .steps-pulse { position:absolute; top: -5px; width: 18px; height: 18px; border-radius:9999px;
          background: radial-gradient(circle at 40% 40%, #67e8f9, #22d3ee 40%, #0ea5e9 65%, rgba(2,8,23,0) 70%);
          box-shadow: 0 0 28px rgba(14,165,233,.8), 0 0 12px rgba(103,232,249,.7) inset;
          animation: pulse 1.8s ease-in-out infinite; transform: translateX(var(--pos, 0%)); }
        @keyframes pulse { 0%,100% { transform: translateX(var(--pos,0%)) scale(0.95); opacity: .95; } 50% { transform: translateX(var(--pos,0%)) scale(1.1); opacity: 1; } }
        .steps-labels { display:flex; justify-content:space-between; position: relative; margin-top: 8px; }
        .steps-label { font-size: .75rem; color: #a2c9e6; padding:.35rem .7rem; border-radius:9999px; border:1px solid var(--border);
                       background: var(--pill); box-shadow: var(--shadow-inner); }
        .steps-label.active { background: var(--pill-on); color: #00131f; border-color: #22d3ee;
                              box-shadow: 0 10px 24px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.2); }
        .steps-right { position:absolute; right:0; top:-28px; font-size:.75rem; color:#e0f2fe; }
        /* DocColumn */
        .col { display: grid; gap: 10px; }
        .req { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px; box-shadow: var(--shadow-inner); }
        .req-h { font-weight: 700; color: #e6f6ff; margin-bottom: 2px; }
        .small { font-size: .8rem; }
        .vspace > * + * { margin-top: 8px; }
        .warn { color: #fca5a5; font-size: .75rem; }
      `}</style>
    </div>
  );

  function collectDocs(
    reqs: Requirement[],
    vals: Record<string, { url: string; notes?: string; issuedAt?: string; expiresAt?: string }>
  ) {
    const commercial: Array<{ type: string; url: string; notes?: string; issuedAt?: string; expiresAt?: string }> = [];
    const operational: Array<{ type: string; url: string; notes?: string; issuedAt?: string; expiresAt?: string }> = [];
    for (const r of reqs) {
      const k = reqKey(r);
      const v = vals[k];
      if (!v?.url?.trim()) continue;
      const entry = { type: r.documentType, url: v.url.trim(), notes: v.notes, issuedAt: v.issuedAt, expiresAt: v.expiresAt };
      if (r.category === "COMMERCIAL") commercial.push(entry); else operational.push(entry);
    }
    return { commercial, operational };
  }

    return (
      <WizardShell
        title="Business Onboarding"
        steps={[
          { key: "maintenance", title: "Home Maintenance", View: MaintenancePage as any },
          { key: "legacy", title: "Onboarding", View: LegacyView },
        ]}
        context={{}}
      />
    );

  }
/* ───────────────────── UI Bits ───────────────────── */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel" role="region" aria-label={title}>
      <h2 className="subtle" style={{ marginBottom: 8 }}>{title}</h2>
      <div className="space">{children}</div>
    </section>
  );
}
function Two({ children }: { children: React.ReactNode }) { return <div className="grid two">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="row" style={{ gap: 8, fontSize: ".95rem" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
function StepsBar({ step, unmet }: { step: StepName; unmet: number }) {
  const order: StepName[] = ["lead","btdo.intake","btdo.accept","bdo.pricelock","bdo.booking-sheet","bdo.documentation","bdo.activate"];
  const idx = order.indexOf(step);
  const pos = (idx / (order.length - 1)) * 100;
  return (
    <div className="steps">
      <div className="steps-track" />
      <div className="steps-pulse" style={{ ["--pos" as any]: `${pos}%` }} />
      <div className="steps-right">{unmet} mandatory left</div>
      <div className="steps-labels">{order.map((s, i) => <span key={s} className={`steps-label ${i === idx ? "active" : ""}`}>{label(s)}</span>)}</div>
    </div>
  );
  function label(s: StepName) {
    switch (s) {
      case "lead": return "Lead";
      case "btdo.intake": return "Intake";
      case "btdo.accept": return "Accept";
      case "bdo.pricelock": return "Pricelock";
      case "bdo.booking-sheet": return "Booking";
      case "bdo.documentation": return "Docs";
      case "bdo.activate": return "Activate";
    }
  }
}
function Segment<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][]; }) {
  return (
    <div className="chips">
      {options.map(([val, label]) => (
        <button key={val} className={`chip ${value === val ? "on" : ""}`} onClick={() => onChange(val)}>{label}</button>
      ))}
    </div>
  );
}
function ServiceMini({ sector, value, onPick }: { sector: string; value: string; onPick: (v: string) => void; }) {
  const map: Record<string, string[]> = {
    Waste: ["General Waste","Food Waste"],
    Construction: ["Skip Hire","Material Supply"],
    Hospitality: ["Kitchen Deep Clean","Pest Control"],
    Retail: ["Stock Supply"],
    Transport: ["Courier"],
    Cleaning: ["General Cleaning"],
    Other: ["Custom"],
  };
  const list = map[sector] || [];
  if (!sector) return <input className="input" value={value} onChange={(e) => onPick(e.target.value)} placeholder="Pick a sector first" />;
  return (
    <div className="chips">
      {list.map((opt) => (
        <button key={opt} className={`chip ${value === opt ? "on" : ""}`} onClick={() => onPick(opt)}>{opt}</button>
      ))}
      {sector === "Other" && (
        <input className="input" value={value} onChange={(e) => onPick(e.target.value)} placeholder="Describe service" />
      )}
    </div>
  );
}
function DocChip({ doc, onToggle }: { doc: PredictedDoc; onToggle: () => void }) {
  return (
    <button className="chip on" onClick={onToggle} title={`${doc.category} • ${doc.requiredFrom}${doc.mandatory ? " • mandatory" : ""}`}>
      {doc.documentType}
    </button>
  );
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
      <div className="col">
        {items.map((r) => {
          const key = reqKey(r);
          const v = values[key] || { url: "" };
          const unmet = r.mandatory && !v.url?.trim();
          return (
            <div key={key} className="req">
              <div className="req-h">{r.documentType}</div>
              <div className="muted small">
                From: {r.requiredFrom} {r.mandatory ? "• Mandatory" : "• Optional"} {r.notes ? `• ${r.notes}` : ""}
              </div>
              <div className="vspace">
                <input className="input" placeholder="Document URL" value={v.url} onChange={(e) => onChange(key, { url: e.target.value })} />
                <input className="input" placeholder="Notes (optional)" value={v.notes || ""} onChange={(e) => onChange(key, { notes: e.target.value })} />
                <div className="grid two">
                  <input className="input" placeholder="Issued At (YYYY-MM-DD)" value={v.issuedAt || ""} onChange={(e) => onChange(key, { issuedAt: e.target.value })} />
                  <input className="input" placeholder="Expires At (YYYY-MM-DD)" value={v.expiresAt || ""} onChange={(e) => onChange(key, { expiresAt: e.target.value })} />
                </div>
                {unmet && <div className="warn">Required to activate.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}