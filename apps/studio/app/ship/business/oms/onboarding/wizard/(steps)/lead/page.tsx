"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Minimal client-side query-string helper used by this page.
 * Returns the query value or the provided fallback; returns fallback during SSR.
 */
function getParam(key: string, fallback = ""): string | null {
  if (typeof window === "undefined") return fallback;
  try {
    const p = new URLSearchParams(window.location.search);
    const v = p.get(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

type Relationship = "CLIENT" | "VENDOR" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
const RELS: Relationship[] = ["CLIENT", "VENDOR", "SUPPLIER", "SUBCONTRACTOR", "PARTNER"];

export default function LeadStep() {
  const router = useRouter();
  // carry from URL if present (avoid useSearchParams which causes CSR-bailouts when used in server contexts)
  const [mode, setMode] = useState<"NEW" | "ESTABLISHED">("NEW");
  const [relationship, setRelationship] = useState<Relationship>("CLIENT");
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const m = getParam("mode", "") as any;
    if (m) setMode((m as any) || "NEW");
    const rel = (getParam("relationship", "") as Relationship) || null;
    if (rel) setRelationship(rel);
    const cid = getParam("companyId", "");
    if (cid) setCompanyId(cid || null);
  }, []);

  // NEW lead fields
  const [lead, setLead] = useState({
    fullName: "",
    email: "",
    phone: "",
    product: "",
    intent: "Set up" as "Set up" | "Subscribe",
    companyName: "",
    plan: "Standard",
    source: "",
    surveySiteAddress: "",
    surveyPreferredWindow: "",
    surveyAccessNotes: "",
  });

  // ESTABLISHED quick-pick helpers
  const [existingQuery, setExistingQuery] = useState("");
  const [existingPrimaryEmail, setExistingPrimaryEmail] = useState("");

  // load from any prior seed
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wizard:seed");
      if (!raw) return;
      const seed = JSON.parse(raw);
      if (seed?.companyId) {
        setCompanyId(seed.companyId);
        setMode("ESTABLISHED");
      }
      if (seed?.lead) {
        setLead((v) => ({
          ...v,
          fullName: seed.lead.fullName || v.fullName,
          email: seed.lead.email || v.email,
          phone: seed.lead.phone || v.phone,
          product: seed.lead.product || v.product,
          intent: seed.lead.intent || v.intent,
          companyName: seed.lead.companyName || v.companyName,
          plan: seed.lead.plan || v.plan,
          source: seed.lead.source || v.source,
        }));
      }
      if (seed?.survey) {
        setLead((v) => ({
          ...v,
          surveySiteAddress: seed.survey.siteAddress || v.surveySiteAddress,
          surveyPreferredWindow: seed.survey.preferredWindow || v.surveyPreferredWindow,
          surveyAccessNotes: seed.survey.accessNotes || v.surveyAccessNotes,
        }));
      }
    } catch {}
  }, []);

  // SALE vs PROCUREMENT wording
  const surveyMode: "SALE" | "PROCUREMENT" = ["VENDOR", "SUPPLIER", "SUBCONTRACTOR", "PARTNER"].includes(relationship)
    ? "PROCUREMENT"
    : "SALE";

  const nextHref = useMemo(() => {
    const p = new URLSearchParams();
    if (companyId) p.set("companyId", companyId);
    p.set("mode", mode);
    p.set("relationship", relationship);
    return `/ship/business/oms/onboarding/wizard/intake?${p.toString()}`;
  }, [companyId, mode, relationship]);

  function saveSeedAndGo() {
    const seed = {
      companyId,
      lead: {
        fullName: lead.fullName,
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
    };
    sessionStorage.setItem("wizard:seed", JSON.stringify(seed));
    router.push(nextHref);
  }

  const canContinueNew =
    !!lead.fullName && !!lead.product && (!!lead.email || !!lead.phone);

  return (
    <div className="lead-step">
      {/* Mode + Relationship */}
      <section className="panel compact">
        <div className="row wrap">
          <div className="tag">Mode</div>
          <div className="chips">
            <button
              className={`chip ${mode === "NEW" ? "on" : ""}`}
              onClick={() => setMode("NEW")}
            >
              New Lead
            </button>
            <button
              className={`chip ${mode === "ESTABLISHED" ? "on" : ""}`}
              onClick={() => setMode("ESTABLISHED")}
            >
              Established
            </button>
          </div>

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
                  const v = existingQuery.trim();
                  if (!v) return;
                  setCompanyId(v);
                }}
              >
                Link
              </button>
            </div>
          )}
        </div>

        <div className="row wrap mt">
          <div className="tag">Relationship</div>
          <div className="chips">
            {RELS.map((r) => (
              <button
                key={r}
                className={`chip ${relationship === r ? "on" : ""}`}
                onClick={() => setRelationship(r)}
              >
                {pretty(r)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* NEW Lead form */}
      {mode === "NEW" && (
        <section className="panel">
          <h2 className="subtle">Lead (First Contact)</h2>

          <Two>
            <Field label="Full Name">
              <input
                className="input"
                value={lead.fullName}
                onChange={(e) => setLead({ ...lead, fullName: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
              />
            </Field>
          </Two>

          <Two>
            <Field label="Phone">
              <input
                className="input"
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              />
            </Field>
            <Field label="Product Interested In">
              <input
                className="input"
                value={lead.product}
                placeholder="e.g., Pest control | Deep clean | Fit-out"
                onChange={(e) => setLead({ ...lead, product: e.target.value })}
              />
            </Field>
          </Two>

          <Two>
            <Field label="Intent">
              <select
                className="input"
                value={lead.intent}
                onChange={(e) => setLead({ ...lead, intent: e.target.value as any })}
              >
                <option>Set up</option>
                <option>Subscribe</option>
              </select>
            </Field>

            {lead.intent === "Set up" ? (
              <Field label="Company / Person Name">
                <input
                  className="input"
                  value={lead.companyName}
                  onChange={(e) => setLead({ ...lead, companyName: e.target.value })}
                />
              </Field>
            ) : (
              <Field label="Plan">
                <select
                  className="input"
                  value={lead.plan}
                  onChange={(e) => setLead({ ...lead, plan: e.target.value })}
                >
                  <option>Standard</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
              </Field>
            )}
          </Two>

          <Field label="How did you hear about us?">
            <select
              className="input"
              value={lead.source}
              onChange={(e) => setLead({ ...lead, source: e.target.value })}
            >
              <option value="">Select one</option>
              <option>Google Search</option>
              <option>Social Media</option>
              <option>Friend or Referral</option>
              <option>Existing Client</option>
              <option>Event / Expo</option>
              <option>Other</option>
            </select>
          </Field>

          <h3 className="subtle" style={{ marginTop: 8 }}>Survey</h3>
          <Two>
            <Field label={surveyMode === "SALE" ? "Site Address" : "Delivery / Collection Site"}>
              <input
                className="input"
                value={lead.surveySiteAddress}
                onChange={(e) => setLead({ ...lead, surveySiteAddress: e.target.value })}
              />
            </Field>
            <Field label={surveyMode === "SALE" ? "Preferred Window" : "Proposed Delivery Window"}>
              <input
                className="input"
                value={lead.surveyPreferredWindow}
                placeholder={surveyMode === "SALE" ? "e.g., Tue AM next week" : "e.g., Thu 09:00–11:00"}
                onChange={(e) => setLead({ ...lead, surveyPreferredWindow: e.target.value })}
              />
            </Field>
          </Two>
          <Field label={surveyMode === "SALE" ? "Access / Notes" : "Offload / Access / Notes"}>
            <input
              className="input"
              value={lead.surveyAccessNotes}
              placeholder={surveyMode === "SALE" ? "Gate code, key-holder, PPE…" : "Dock, forklift, packaging, pallets…"}
              onChange={(e) => setLead({ ...lead, surveyAccessNotes: e.target.value })}
            />
          </Field>

          <div className="end">
            <button
              className="ghost"
              onClick={() => router.push("/ship/business/oms/onboarding/wizard/company")}
            >
              Company/Person setup
            </button>
            <button
              className="primary"
              disabled={!canContinueNew}
              onClick={saveSeedAndGo}
            >
              Save Lead & Continue →
            </button>
          </div>
        </section>
      )}

      {/* ESTABLISHED mini */}
      {mode === "ESTABLISHED" && (
        <section className="panel">
          <h2 className="subtle">Established Account</h2>
          <Two>
            <Field label="Linked Account (ID or Name)">
              <input
                className="input"
                value={companyId || ""}
                placeholder="e.g., acc_123 or 'White Pallets LLC'"
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </Field>
            <Field label="Primary Contact (Email, optional)">
              <input
                className="input"
                value={existingPrimaryEmail}
                onChange={(e) => setExistingPrimaryEmail(e.target.value)}
                placeholder="ops@company.com"
              />
            </Field>
          </Two>
          <div className="end">
            <button className="ghost" onClick={() => setMode("NEW")}>← Switch to New Lead</button>
            <button
              className="primary"
              disabled={!companyId}
              onClick={() => {
                // store minimal seed and go
                const seed = {
                  companyId,
                  lead: {
                    fullName: "Primary Contact",
                    email: existingPrimaryEmail || null,
                    phone: null,
                    product: null,
                    intent: "Set up",
                    companyName: null,
                    plan: null,
                    roles: [relationship],
                    source: null,
                  },
                  survey: {
                    siteAddress: null,
                    preferredWindow: null,
                    accessNotes: null,
                  },
                  established: true,
                  establishedRole: relationship,
                  surveyMode,
                };
                sessionStorage.setItem("wizard:seed", JSON.stringify(seed));
                router.push(nextHref);
              }}
            >
              Continue to Intake →
            </button>
          </div>
        </section>
      )}

      {/* Small page-local styles (shell provides theme) */}
      <style jsx>{`
        .panel { background: rgba(16,24,40,.72); border:1px solid rgba(148,163,184,.18); border-radius:16px; padding:16px; box-shadow: 0 24px 60px rgba(2,6,23,.55), inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35); }
        .panel.compact { background: rgba(16,24,40,.55); }
        .row { display:flex; align-items:center; gap:10px; }
        .wrap { flex-wrap: wrap; }
        .flex1 { flex: 1 1 320px; }
        .gap { gap: 8px; }
        .mt { margin-top: 6px; }

        .tag { font-size:.8rem; color:#94a3b8; padding:4px 8px; border-radius:9999px; border:1px solid rgba(148,163,184,.18); background: rgba(255,255,255,.02); }

        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { padding:.55rem .9rem; border-radius:9999px; border:1px solid rgba(148,163,184,.18); background: linear-gradient(180deg, #0e1626 0%, #0b1220 100%); color:#cfe9ff; font-weight:600;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.06), inset 0 -1px 0 rgba(0,0,0,.35); }
        .chip.on { background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%); color:white; border-color:#0ea5e9; box-shadow: 0 12px 30px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.15); }

        .input {
          width:100%; border-radius:12px; padding:.75rem .9rem; background:#0b1323; color:#e2e8f0; border:1px solid rgba(148,163,184,.18);
          box-shadow: inset 0 2px 6px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .input::placeholder { color:#7aa6c3; }

        .primary {
          background: linear-gradient(180deg, #22d3ee 0%, #0ea5e9 55%, #0284c7 100%);
          color:#00121c; font-weight:800; padding:.75rem 1.15rem; border-radius:12px; border:none;
          box-shadow: 0 20px 50px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.35);
        }
        .primary:disabled { opacity:.55; box-shadow:none; }
        .ghost {
          background:#0a1222; color:#d1eaff; border:1px solid rgba(148,163,184,.18); padding:.7rem 1.1rem; border-radius:12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35);
        }

        .subtle { color:#cdeaff; font-weight:600; }
        .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:10px; }
      `}</style>
    </div>
  );
}

/* Small UI helpers */
function Two({ children }: { children: React.ReactNode }) {
  return (
    <div className="two">
      {children}
      <style jsx>{`
        .two { display:grid; grid-template-columns: 1fr; gap:12px; }
        @media (min-width: 680px) { .two { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="lbl">{label}</div>
      {children}
      <style jsx>{`
        .lbl { color:#94a3b8; font-size:.85rem; margin-bottom:4px; }
      `}</style>
    </div>
  );
}

function pretty(r: Relationship) {
  return r === "SUPPLIER" ? "Supplier"
       : r === "SUBCONTRACTOR" ? "Subcontractor"
       : r === "PARTNER" ? "Partner"
       : r === "VENDOR" ? "Vendor"
       : "Client";
}