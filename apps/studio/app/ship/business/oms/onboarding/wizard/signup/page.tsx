"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getParam } from "@/app/lib/nav/qs";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter" });

type SaveRes = { ok?: true; companyId?: string; error?: string };

async function postCompany(payload: {
  legalName: string;
  jurisdiction: string;
  activities?: string[];
  tenant?: { slug: string; brandName: string; domain?: string; theme?: Record<string, unknown> };
  meta?: Record<string, unknown>;
}): Promise<SaveRes> {
  const res = await fetch("/api/company/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

type LeadPayload = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  productInterestedIn: string | null;
  source: string | null;                              // how heard
  intent: "Set up" | "Subscribe";
  roles: Array<"CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER">;
  meta?: Record<string, any>;
};

export default function SignupPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"BUSINESS" | "PERSONAL">("BUSINESS");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [startWizardNow, setStartWizardNow] = useState(true); // lazy by default

  // White-label (optional)
  const [tenant, setTenant] = useState({ slug: "", brandName: "", domain: "" });

  // Lead prefill
  const [lead, setLead] = useState<LeadPayload | null>(null);

  // lead prefill comes from URL via getParam (shared helper)

  // ───────── BUSINESS (GS sheet-style) ─────────
  const [biz, setBiz] = useState({
    legalName: "",
    tradingName: "",
    jurisdiction: "UK",
    activities: [] as string[],

    registrationNo: "",
    vatNo: "",
    billingAddress: "",
    accountsEmail: "",

    bankName: "",
    bankBeneficiary: "",
    bankIban: "",
    bankSwift: "",
    ledgerCode: "",

    licenseUrl: "",
    insuranceUrl: "",

    director1Name: "",
    director1IdUrl: "",
    director2Name: "",
    director2IdUrl: "",

    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",

    // Marketing + intents + survey
    howHeard: "",
    productInterestedIn: "",
    surveySiteAddress: "",
    surveyPreferredWindow: "",
    surveyNotes: "",
  });

  // ───────── PERSONAL / SUBSCRIBE ─────────
  const [per, setPer] = useState({
    fullName: "",
    email: "",
    phone: "",
    jurisdiction: "UK",
    address: "",
    plan: "Standard" as "Standard" | "Pro" | "Enterprise",

    bankIban: "",
    bankBeneficiary: "",
    idDocUrl: "",
    notes: "",

    // Marketing + intents + survey
    howHeard: "",
    productInterestedIn: "",
    surveySiteAddress: "",
    surveyPreferredWindow: "",
    surveyNotes: "",
  });

  const canSave = useMemo(() => {
    if (busy) return false;
    if (tab === "BUSINESS") return Boolean(biz.legalName && biz.jurisdiction);
    return Boolean(per.fullName && per.jurisdiction);
  }, [busy, tab, biz.legalName, biz.jurisdiction, per.fullName, per.jurisdiction]);

  /** ───────────────────── Prefill from leadId ───────────────────── */
  useEffect(() => {
  const leadId = getParam("leadId");
    if (!leadId) return;
    (async () => {
      try {
        const res = await fetch(`/api/ship/business/oms/onboarding/leads/${encodeURIComponent(leadId)}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to fetch lead");

        const L: LeadPayload = data.lead;
        setLead(L);

        // Intent decides tab + basic mapping
        if (L.intent === "Subscribe") {
          setTab("PERSONAL");
          setPer((p) => ({
            ...p,
            fullName: L.fullName || p.fullName,
            email: L.email || p.email,
            phone: L.phone || p.phone,
            productInterestedIn: L.productInterestedIn || p.productInterestedIn,
            howHeard: L.source || p.howHeard,
            // optional survey prefill from meta if you had it
            surveySiteAddress: L.meta?.survey?.siteAddress || p.surveySiteAddress,
            surveyPreferredWindow: L.meta?.survey?.preferredWindow || p.surveyPreferredWindow,
            surveyNotes: L.meta?.survey?.accessNotes || p.surveyNotes,
          }));
        } else {
          setTab("BUSINESS");
          setBiz((b) => ({
            ...b,
            legalName: L.meta?.companyName || L.fullName || b.legalName,
            primaryContactName: L.fullName || b.primaryContactName,
            primaryContactEmail: L.email || b.primaryContactEmail,
            primaryContactPhone: L.phone || b.primaryContactPhone,
            productInterestedIn: L.productInterestedIn || b.productInterestedIn,
            howHeard: L.source || b.howHeard,
            surveySiteAddress: L.meta?.survey?.siteAddress || b.surveySiteAddress,
            surveyPreferredWindow: L.meta?.survey?.preferredWindow || b.surveyPreferredWindow,
            surveyNotes: L.meta?.survey?.accessNotes || b.surveyNotes,
          }));
        }

        setMsg("✨ Prefilled from lead.");
      } catch (e: any) {
        setMsg(`⚠️ Could not prefill lead: ${e?.message || "Error"}`);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      if (tab === "BUSINESS") {
        const payload = {
          legalName: biz.legalName.trim(),
          jurisdiction: biz.jurisdiction.trim(),
          activities: biz.activities,
          tenant: tenant.slug && tenant.brandName ? {
            slug: tenant.slug.trim(),
            brandName: tenant.brandName.trim(),
            domain: tenant.domain || undefined,
          } : undefined,
          meta: {
            accountType: "BUSINESS",
            tradingName: nullIfEmpty(biz.tradingName),
            registrationNo: nullIfEmpty(biz.registrationNo),
            vatNo: nullIfEmpty(biz.vatNo),
            billingAddress: nullIfEmpty(biz.billingAddress),
            accountsEmail: nullIfEmpty(biz.accountsEmail),
            bank: {
              name: nullIfEmpty(biz.bankName),
              beneficiary: nullIfEmpty(biz.bankBeneficiary),
              iban: nullIfEmpty(biz.bankIban),
              swift: nullIfEmpty(biz.bankSwift),
              ledgerCode: nullIfEmpty(biz.ledgerCode),
            },
            compliance: {
              licenseUrl: nullIfEmpty(biz.licenseUrl),
              insuranceUrl: nullIfEmpty(biz.insuranceUrl),
            },
            directors: [
              { name: nullIfEmpty(biz.director1Name), idUrl: nullIfEmpty(biz.director1IdUrl) },
              { name: nullIfEmpty(biz.director2Name), idUrl: nullIfEmpty(biz.director2IdUrl) },
            ].filter(d => d.name || d.idUrl),
            primaryContact: {
              name: nullIfEmpty(biz.primaryContactName),
              email: nullIfEmpty(biz.primaryContactEmail),
              phone: nullIfEmpty(biz.primaryContactPhone),
            },
            marketing: { howHeard: nullIfEmpty(biz.howHeard) },
            // keep lead linkage (optional) for analytics
            leadId: lead?.id ?? null,
          },
        };
        const res = await postCompany(payload);
        if (!res.ok || !res.companyId) throw new Error(res.error || "Failed to save business account");

        if (startWizardNow) {
          seedWizard({
            companyId: res.companyId,
            lead: {
              fullName: biz.primaryContactName || biz.legalName,
              email: biz.primaryContactEmail || null,
              phone: biz.primaryContactPhone || null,
              product: biz.productInterestedIn || "General Service",
              intent: "Set up",
              companyName: biz.legalName,
              roles: (lead?.roles?.length ? lead?.roles : ["CLIENT"]) as any,
              source: biz.howHeard || null,
            },
            survey: {
              siteAddress: biz.surveySiteAddress || null,
              preferredWindow: biz.surveyPreferredWindow || null,
              accessNotes: biz.surveyNotes || null,
            },
          });
        }

        setMsg("✅ Business account created.");
        router.push(`/ship/business/oms/onboarding/wizard?companyId=${res.companyId}`);
        return;
      } else {
        const payload = {
          legalName: per.fullName.trim(), // mapped
          jurisdiction: per.jurisdiction.trim(),
          activities: [],
          tenant: tenant.slug && tenant.brandName ? {
            slug: tenant.slug.trim(),
            brandName: tenant.brandName.trim(),
            domain: tenant.domain || undefined,
          } : undefined,
          meta: {
            accountType: "PERSONAL_SUBSCRIBE",
            contact: {
              email: nullIfEmpty(per.email),
              phone: nullIfEmpty(per.phone),
              address: nullIfEmpty(per.address),
            },
            subscribe: {
              plan: per.plan,
              notes: nullIfEmpty(per.notes),
            },
            bank: {
              beneficiary: nullIfEmpty(per.bankBeneficiary),
              iban: nullIfEmpty(per.bankIban),
            },
            idDocUrl: nullIfEmpty(per.idDocUrl),
            marketing: { howHeard: nullIfEmpty(per.howHeard) },
            leadId: lead?.id ?? null,
          },
        };
        const res = await postCompany(payload);
        if (!res.ok || !res.companyId) throw new Error(res.error || "Failed to save personal account");

        if (startWizardNow) {
          seedWizard({
            companyId: res.companyId,
            lead: {
              fullName: per.fullName,
              email: per.email || null,
              phone: per.phone || null,
              product: per.productInterestedIn || "Subscription",
              intent: "Subscribe",
              plan: per.plan,
              roles: (lead?.roles?.length ? lead?.roles : ["CLIENT"]) as any,
              source: per.howHeard || null,
            },
            survey: {
              siteAddress: per.surveySiteAddress || null,
              preferredWindow: per.surveyPreferredWindow || null,
              accessNotes: per.surveyNotes || null,
            },
          });
        }

        setMsg("✅ Personal/Subscribe account created.");
        router.push(`/ship/business/oms/onboarding/wizard?companyId=${res.companyId}`);
        return;
      }
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`signup-root ${inter.variable} mx-auto max-w-3xl p-6 space-y-6`}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <span className="text-xs px-2 py-1 rounded bg-neutral-100 border">White-label ready</span>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={startWizardNow} onChange={(e) => setStartWizardNow(e.target.checked)} />
          Start wizard after signup
        </label>
      </header>

      {msg && <p className="text-sm">{msg}</p>}

      {/* Tenant (optional) */}
      <Card title="White-label (optional)">
        <Two>
          <Field label="Tenant Slug"><input className="inp" value={tenant.slug} onChange={(e) => setTenant({ ...tenant, slug: e.target.value })} placeholder="e.g., choice-plus" /></Field>
          <Field label="Brand Name"><input className="inp" value={tenant.brandName} onChange={(e) => setTenant({ ...tenant, brandName: e.target.value })} placeholder="Choice Plus" /></Field>
        </Two>
        <Field label="Domain (optional)"><input className="inp" value={tenant.domain} onChange={(e) => setTenant({ ...tenant, domain: e.target.value })} placeholder="brand.example.com" /></Field>
      </Card>

      {/* Tabs */}
      <nav className="tabs">
        <button className={`tab ${tab === "BUSINESS" ? "on" : ""}`} onClick={() => setTab("BUSINESS")}>Business</button>
        <button className={`tab ${tab === "PERSONAL" ? "on" : ""}`} onClick={() => setTab("PERSONAL")}>Personal / Subscribe</button>
      </nav>

      {tab === "BUSINESS" ? (
        <Card title="Business Account">
          <Two>
            <Field label="Legal Name"><input className="inp" value={biz.legalName} onChange={(e) => setBiz({ ...biz, legalName: e.target.value })} /></Field>
            <Field label="Trading Name (optional)"><input className="inp" value={biz.tradingName} onChange={(e) => setBiz({ ...biz, tradingName: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Jurisdiction"><input className="inp" value={biz.jurisdiction} onChange={(e) => setBiz({ ...biz, jurisdiction: e.target.value })} /></Field>
            <Field label="Activities (comma-separated)">
              <input className="inp" value={biz.activities.join(", ")} onChange={(e) => setBiz({ ...biz, activities: splitList(e.target.value) })} placeholder="Hotels, Restaurants, Retail" />
            </Field>
          </Two>
          <Two>
            <Field label="Registration No"><input className="inp" value={biz.registrationNo} onChange={(e) => setBiz({ ...biz, registrationNo: e.target.value })} /></Field>
            <Field label="VAT No"><input className="inp" value={biz.vatNo} onChange={(e) => setBiz({ ...biz, vatNo: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Billing Address"><input className="inp" value={biz.billingAddress} onChange={(e) => setBiz({ ...biz, billingAddress: e.target.value })} /></Field>
            <Field label="Accounts Email"><input className="inp" value={biz.accountsEmail} onChange={(e) => setBiz({ ...biz, accountsEmail: e.target.value })} /></Field>
          </Two>

          <h3 className="text-sm font-medium mt-2">Bank & Ledger</h3>
          <Two>
            <Field label="Bank Name"><input className="inp" value={biz.bankName} onChange={(e) => setBiz({ ...biz, bankName: e.target.value })} /></Field>
            <Field label="Beneficiary"><input className="inp" value={biz.bankBeneficiary} onChange={(e) => setBiz({ ...biz, bankBeneficiary: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="IBAN"><input className="inp" value={biz.bankIban} onChange={(e) => setBiz({ ...biz, bankIban: e.target.value })} /></Field>
            <Field label="SWIFT/BIC"><input className="inp" value={biz.bankSwift} onChange={(e) => setBiz({ ...biz, bankSwift: e.target.value })} /></Field>
          </Two>
          <Field label="Ledger Code"><input className="inp" value={biz.ledgerCode} onChange={(e) => setBiz({ ...biz, ledgerCode: e.target.value })} /></Field>

          <h3 className="text-sm font-medium mt-2">Compliance & Directors</h3>
          <Two>
            <Field label="Trade License (URL)"><input className="inp" value={biz.licenseUrl} onChange={(e) => setBiz({ ...biz, licenseUrl: e.target.value })} /></Field>
            <Field label="Insurance (URL)"><input className="inp" value={biz.insuranceUrl} onChange={(e) => setBiz({ ...biz, insuranceUrl: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Director 1 Name"><input className="inp" value={biz.director1Name} onChange={(e) => setBiz({ ...biz, director1Name: e.target.value })} /></Field>
            <Field label="Director 1 ID (URL)"><input className="inp" value={biz.director1IdUrl} onChange={(e) => setBiz({ ...biz, director1IdUrl: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Director 2 Name"><input className="inp" value={biz.director2Name} onChange={(e) => setBiz({ ...biz, director2Name: e.target.value })} /></Field>
            <Field label="Director 2 ID (URL)"><input className="inp" value={biz.director2IdUrl} onChange={(e) => setBiz({ ...biz, director2IdUrl: e.target.value })} /></Field>
          </Two>

          <h3 className="text-sm font-medium mt-2">Primary Contact</h3>
          <Two>
            <Field label="Name"><input className="inp" value={biz.primaryContactName} onChange={(e) => setBiz({ ...biz, primaryContactName: e.target.value })} /></Field>
            <Field label="Email"><input className="inp" value={biz.primaryContactEmail} onChange={(e) => setBiz({ ...biz, primaryContactEmail: e.target.value })} /></Field>
          </Two>
          <Field label="Phone"><input className="inp" value={biz.primaryContactPhone} onChange={(e) => setBiz({ ...biz, primaryContactPhone: e.target.value })} /></Field>

          <h3 className="text-sm font-medium mt-2">Marketing</h3>
          <Two>
            <Field label="How did you hear about us?">
              <select className="inp" value={biz.howHeard} onChange={(e) => setBiz({ ...biz, howHeard: e.target.value })}>
                <option value="">Select one</option>
                <option>Google Search</option>
                <option>Social Media</option>
                <option>Friend or Referral</option>
                <option>Existing Client</option>
                <option>Event / Expo</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Product Interested In">
              <input className="inp" value={biz.productInterestedIn} onChange={(e) => setBiz({ ...biz, productInterestedIn: e.target.value })} placeholder="Pest control | Deep clean | Fit-out" />
            </Field>
          </Two>

          <h3 className="text-sm font-medium mt-2">Survey (optional)</h3>
          <Two>
            <Field label="Preferred Window"><input className="inp" value={biz.surveyPreferredWindow} onChange={(e) => setBiz({ ...biz, surveyPreferredWindow: e.target.value })} /></Field>
            <Field label="Site Address"><input className="inp" value={biz.surveySiteAddress} onChange={(e) => setBiz({ ...biz, surveySiteAddress: e.target.value })} /></Field>
          </Two>
          <Field label="Notes"><input className="inp" value={biz.surveyNotes} onChange={(e) => setBiz({ ...biz, surveyNotes: e.target.value })} /></Field>

          <div className="flex justify-between items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={startWizardNow} onChange={(e) => setStartWizardNow(e.target.checked)} />
              Start wizard after signup
            </label>
            <button className="btn" disabled={!canSave} onClick={save}>Create Business Account →</button>
          </div>
        </Card>
      ) : (
        <Card title="Personal / Subscribe Account">
          <Two>
            <Field label="Full Name"><input className="inp" value={per.fullName} onChange={(e) => setPer({ ...per, fullName: e.target.value })} /></Field>
            <Field label="Jurisdiction"><input className="inp" value={per.jurisdiction} onChange={(e) => setPer({ ...per, jurisdiction: e.target.value })} /></Field>
          </Two>
          <Two>
            <Field label="Email"><input className="inp" value={per.email} onChange={(e) => setPer({ ...per, email: e.target.value })} /></Field>
            <Field label="Phone"><input className="inp" value={per.phone} onChange={(e) => setPer({ ...per, phone: e.target.value })} /></Field>
          </Two>
          <Field label="Address"><input className="inp" value={per.address} onChange={(e) => setPer({ ...per, address: e.target.value })} /></Field>

          <Two>
            <Field label="Plan">
              <select className="inp" value={per.plan} onChange={(e) => setPer({ ...per, plan: e.target.value as any })}>
                <option>Standard</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </Field>
            <Field label="Notes (optional)"><input className="inp" value={per.notes} onChange={(e) => setPer({ ...per, notes: e.target.value })} /></Field>
          </Two>

          <h3 className="text-sm font-medium mt-2">Settlement (optional)</h3>
          <Two>
            <Field label="Beneficiary"><input className="inp" value={per.bankBeneficiary} onChange={(e) => setPer({ ...per, bankBeneficiary: e.target.value })} /></Field>
            <Field label="IBAN"><input className="inp" value={per.bankIban} onChange={(e) => setPer({ ...per, bankIban: e.target.value })} /></Field>
          </Two>
          <Field label="ID Doc (URL)"><input className="inp" value={per.idDocUrl} onChange={(e) => setPer({ ...per, idDocUrl: e.target.value })} /></Field>

          <h3 className="text-sm font-medium mt-2">Marketing</h3>
          <Two>
            <Field label="How did you hear about us?">
              <select className="inp" value={per.howHeard} onChange={(e) => setPer({ ...per, howHeard: e.target.value })}>
                <option value="">Select one</option>
                <option>Google Search</option>
                <option>Social Media</option>
                <option>Friend or Referral</option>
                <option>Existing Client</option>
                <option>Event / Expo</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Product Interested In">
              <input className="inp" value={per.productInterestedIn} onChange={(e) => setPer({ ...per, productInterestedIn: e.target.value })} placeholder="Subscription type" />
            </Field>
          </Two>

          <h3 className="text-sm font-medium mt-2">Survey (optional)</h3>
          <Two>
            <Field label="Preferred Window"><input className="inp" value={per.surveyPreferredWindow} onChange={(e) => setPer({ ...per, surveyPreferredWindow: e.target.value })} /></Field>
            <Field label="Site Address"><input className="inp" value={per.surveySiteAddress} onChange={(e) => setPer({ ...per, surveySiteAddress: e.target.value })} /></Field>
          </Two>
          <Field label="Notes"><input className="inp" value={per.surveyNotes} onChange={(e) => setPer({ ...per, surveyNotes: e.target.value })} /></Field>

          <div className="flex justify-between items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={startWizardNow} onChange={(e) => setStartWizardNow(e.target.checked)} />
              Start wizard after signup
            </label>
            <button className="btn" disabled={!canSave} onClick={save}>Create Personal Account →</button>
          </div>
        </Card>
      )}

      <Card title="White-label (optional)">
        <p className="text-sm opacity-70">Provide tenant info to create/use a branded tenant on save.</p>
        <Two>
          <Field label="Tenant Slug"><input className="inp" value={tenant.slug} onChange={(e) => setTenant({ ...tenant, slug: e.target.value })} placeholder="choice-plus" /></Field>
          <Field label="Brand Name"><input className="inp" value={tenant.brandName} onChange={(e) => setTenant({ ...tenant, brandName: e.target.value })} placeholder="Choice Plus" /></Field>
        </Two>
        <Field label="Domain (optional)"><input className="inp" value={tenant.domain} onChange={(e) => setTenant({ ...tenant, domain: e.target.value })} placeholder="brand.example.com" /></Field>
      </Card>

      <style jsx global>{`
        .signup-root, .signup-root * {
          font-family: var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji" !important;
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
        }
        .inp { width:100%; border:1px solid #e5e7eb; border-radius:.75rem; padding:.6rem .8rem; }
        .lbl { display:block; font-size:.8rem; opacity:.7; margin-bottom:.25rem; }
        .btn { background:#111; color:white; padding:.6rem 1.1rem; border-radius:.75rem; font-weight:500; }
        .btn:disabled { opacity:.5; }
        .btnGhost { background:#f4f4f5; padding:.6rem 1rem; border-radius:.75rem; }
        .tabs { display:flex; gap:.5rem; }
        .tab { padding:.5rem .9rem; border-radius:.75rem; border:1px solid #e5e7eb; }
        .tab.on { background:#111; color:#fff; border-color:#111; }
      `}</style>
    </div>
  );

  function seedWizard(seed: {
    companyId: string;
    lead: {
      fullName: string;
      email: string | null;
      phone: string | null;
      product: string;
      intent: "Set up" | "Subscribe";
      companyName?: string | null;
      plan?: "Standard" | "Pro" | "Enterprise";
      roles?: Array<"CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER">;
      source?: string | null;
    };
    survey?: { siteAddress: string | null; preferredWindow: string | null; accessNotes: string | null };
  }) {
    try {
      sessionStorage.setItem("wizard:seed", JSON.stringify(seed));
    } catch {}
  }
}

/** UI bits */
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-3">{props.title}</h2>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}
function Two(props: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{props.children}</div>;
}
function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lbl">{props.label}</label>
      {props.children}
    </div>
  );
}

/** helpers */
function splitList(s: string) {
  return s.split(",").map(x => x.trim()).filter(Boolean);
}
function nullIfEmpty<T extends string | undefined | null>(v: T): T | null {
  // @ts-ignore
  return v && (v as any).trim?.().length ? v : null;
}