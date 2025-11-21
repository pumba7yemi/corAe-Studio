"use client";

/**
 * corAe Company Wizard — Single-Page, Linear Steps (Build-as-final)
 * Steps:
 *  Welcome → Sign-in → Company Name → Email/Domain → Jurisdiction → Legal Type
 *  → Business Activity (UAE activities / UK SIC) → Owners → Tax → Banking → Summary → Success
 *
 * Key features:
 *  - Dark-neutral UI (no white glare)
 *  - Tailwind only
 *  - Save & Continue Later (localStorage draft) on EVERY step
 *  - Auto-resume: detects saved draft and resumes from exact step/state
 *  - Open-edit friendly: clear TODOs for server actions (swap mocks as needed)
 */

import React, { useEffect, useMemo, useState } from "react";

/* ───────────────────── Types ───────────────────── */
type SignInMethod = "GOOGLE" | "OTHER" | "NONE";
type WorkspaceType = "gmail" | "domain";
type Jurisdiction = "UAE" | "UK" | "PH" | "OTHER";
type LegalType = "LLC" | "SOLE" | "FZE" | "PARTNERSHIP" | "BRANCH";

type StepKey =
  | "WELCOME"
  | "SIGN_IN"
  | "COMPANY_NAME"
  | "EMAIL_DOMAIN"
  | "JURISDICTION"
  | "LEGAL_TYPE"
  | "BUSINESS_ACTIVITY"
  | "OWNERS"
  | "TAX"
  | "BANKING"
  | "SUMMARY"
  | "SUCCESS";

type ActivityCode = { code: string; label: string; source: "UAE" | "UK" | "GEN" };

interface Owner {
  id: string;
  fullName: string;
  email: string;
  pct: number; // 0–100
  idDocUrl: string;
}

interface WizardState {
  step: StepKey;

  // identity
  signInMethod: SignInMethod | null;
  email: string;
  emailVerified: boolean;

  // company name
  isCompanyEmail: boolean | null;
  hasCompanyName: boolean | null;
  companyName: string;
  companyNameAvailable: boolean | null;

  // email & domain
  workspaceType: WorkspaceType; // default gmail until domain verified
  hasDomain: boolean | null;
  domainName: string;
  domainVerified: boolean;
  corAeAliasEnabled: boolean;

  // formation
  jurisdiction: Jurisdiction | null;
  legalType: LegalType | null;

  // NEW: business activity
  businessDescription: string; // free text
  activityCodes: ActivityCode[]; // UAE activities or UK SIC codes

  // owners
  owners: Owner[];

  // tax
  expectTurnover: number | null;
  vatRequired: boolean | null;
  trn: string;
  corpTaxRegistered: boolean;

  // banking
  hasBank: boolean | null;
  bankChoice: string;
  iban: string;

  // meta
  savedAt?: string | null;
}

/* ───────────────────── Initial ───────────────────── */
const LOCAL_KEY = "corAeCompanyWizard";

const initialState: WizardState = {
  step: "WELCOME",

  signInMethod: null,
  email: "",
  emailVerified: false,

  isCompanyEmail: null,
  hasCompanyName: null,
  companyName: "",
  companyNameAvailable: null,

  workspaceType: "gmail",
  hasDomain: null,
  domainName: "",
  domainVerified: false,
  corAeAliasEnabled: true,

  jurisdiction: null,
  legalType: null,

  businessDescription: "",
  activityCodes: [],

  owners: [{ id: rid(), fullName: "", email: "", pct: 100, idDocUrl: "" }],

  expectTurnover: null,
  vatRequired: null,
  trn: "",
  corpTaxRegistered: false,

  hasBank: null,
  bankChoice: "",
  iban: "",

  savedAt: null,
};

/* ───────────────────── Helpers (mock/open-edit) ───────────────────── */
function rid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}
function mockVerifyEmail(email: string): Promise<boolean> {
  const ok = /.+@.+\..+/.test(email);
  return new Promise((r) => setTimeout(() => r(ok), 250));
}
function mockCheckCompanyNameAvailability(name: string): Promise<boolean> {
  return new Promise((r) => setTimeout(() => r(name.trim().length >= 3), 300));
}
function mockCheckDNS(domain: string): Promise<{ mx: boolean; spf: boolean; dkim: boolean; dmarc: boolean }> {
  const ok = !!domain && domain.includes(".");
  return new Promise((r) =>
    setTimeout(() => r({ mx: ok, spf: ok, dkim: ok, dmarc: ok }), 400)
  );
}
function sumPct(list: Owner[]) {
  return list.reduce((a, o) => a + (Number.isFinite(o.pct) ? o.pct : 0), 0);
}
function ibanLooksValid(s: string) {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s.trim().toUpperCase());
}
function decideVatRequired(j: Jurisdiction | null, est: number | null): boolean | null {
  if (!j || est == null) return null;
  const thresholds: Record<Jurisdiction, number> = {
    UAE: 375000, // AED (UAE VAT threshold)
    UK: 90000,   // GBP (approx; update via pack)
    PH: 3000000, // PHP (approx; update via pack)
    OTHER: 0,
  };
  if (j === "OTHER") return est > 0 ? true : null;
  return est >= thresholds[j];
}

/* ─── Activity datasets (tiny mock; swap with server search later) ─── */
// UAE examples (DED/Freezone style)
const UAE_ACTIVITIES: ActivityCode[] = [
  { code: "47110", label: "Retail sale in non-specialized stores with food, beverages or tobacco predominating", source: "UAE" },
  { code: "62010", label: "Computer programming activities", source: "UAE" },
  { code: "73100", label: "Advertising agencies", source: "UAE" },
];
// UK SIC examples (Companies House)
const UK_SIC: ActivityCode[] = [
  { code: "62012", label: "Business and domestic software development", source: "UK" },
  { code: "70229", label: "Management consultancy activities (other than financial)", source: "UK" },
  { code: "47190", label: "Other retail sale in non-specialised stores", source: "UK" },
];
// Generic fallback list
const GENERIC_ACTIVITIES: ActivityCode[] = [
  { code: "GEN01", label: "Professional services", source: "GEN" },
  { code: "GEN02", label: "Retail / E-commerce", source: "GEN" },
  { code: "GEN03", label: "Manufacturing / Production", source: "GEN" },
];

function searchActivities(jurisdiction: Jurisdiction | null, q: string): ActivityCode[] {
  const pool =
    jurisdiction === "UAE" ? UAE_ACTIVITIES :
    jurisdiction === "UK"  ? UK_SIC :
    GENERIC_ACTIVITIES;
  const s = q.trim().toLowerCase();
  if (!s) return pool.slice(0, 6);
  return pool.filter(
    a => a.code.toLowerCase().includes(s) || a.label.toLowerCase().includes(s)
  ).slice(0, 12);
}

/* ───────────────────── Persist (Save/Resume via localStorage) ───────────────────── */
// In production, replace with server actions:
//  - saveDraft(payload: WizardState) -> Promise<void>
//  - loadDraft() -> Promise<WizardState|null>
//  - finalize(payload) -> Promise<void>
function saveDraftLocal(state: WizardState) {
  const payload = { ...state, savedAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return payload.savedAt!;
}
function loadDraftLocal(): WizardState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}
function clearDraftLocal() {
  localStorage.removeItem(LOCAL_KEY);
}

/* ───────────────────── UI atoms ───────────────────── */
function Shell({ children, headerRight }: { children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-3 pt-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Company Wizard</h1>
          <p className="text-xs text-zinc-400">One linear flow — no fragmentation.</p>
        </div>
        {headerRight}
      </header>
      <main className="mx-auto max-w-3xl px-3 pb-24 pt-6">{children}</main>
    </div>
  );
}
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-zinc-400">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;
}
function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = {
    primary: `${base} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,
    secondary: `${base} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,
    ghost: `${base} text-zinc-300 hover:bg-zinc-800/70`,
    danger: `${base} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`,
  } as const;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={styles[variant]}>
      {children}
    </button>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${props.className ?? ""}`}
    />
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-zinc-200">{children}</label>;
}
function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${ok ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
      {label}
    </span>
  );
}
function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-200">✕</button>
      )}
    </span>
  );
}
function SaveBar({
  onSave,
  savedAt,
  saving,
}: {
  onSave: () => void;
  savedAt: string | null | undefined;
  saving: boolean;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs backdrop-blur">
      <Button variant="secondary" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save & Continue Later"}
      </Button>
      <span className="text-zinc-400">{savedAt ? `Last saved ${timeAgo(savedAt)}` : "Not saved yet"}</span>
    </div>
  );
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ───────────────────── Steps ───────────────────── */
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <Card title="Welcome" hint="We’ll go from identity → name → email/domain → formation → banking in one flow.">
      <p className="text-sm text-zinc-300">No forms, no stress — tap answers, we handle the rest.</p>
      <Button onClick={onNext}>Start</Button>
    </Card>
  );
}

function SignIn({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [localEmail, setLocalEmail] = useState(state.email);
  const [verifying, setVerifying] = useState(false);

  async function verify() {
    setVerifying(true);
    const ok = await mockVerifyEmail(localEmail);
    setState({ email: localEmail, emailVerified: ok });
    setVerifying(false);
    if (ok) onNext();
  }

  return (
    <Card title="How did you sign in today?" hint="We’ll verify your contact channel first.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant={state.signInMethod === "GOOGLE" ? "primary" : "secondary"} onClick={() => setState({ signInMethod: "GOOGLE" })}>Google / Gmail</Button>
        <Button variant={state.signInMethod === "OTHER" ? "primary" : "secondary"} onClick={() => setState({ signInMethod: "OTHER" })}>Other email</Button>
        <Button variant={state.signInMethod === "NONE" ? "primary" : "secondary"} onClick={() => setState({ signInMethod: "NONE" })}>I don’t have one</Button>
      </div>

      {(state.signInMethod === "GOOGLE" || state.signInMethod === "OTHER") && (
        <div className="space-y-3">
          <Input placeholder="you@gmail.com" value={localEmail} onChange={(e) => setLocalEmail(e.target.value)} />
          <Row>
            {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
            <Button onClick={verify} disabled={verifying || !localEmail}>Verify</Button>
            {state.emailVerified && <Badge ok label="Verified" />}
          </Row>
        </div>
      )}

      {state.signInMethod === "NONE" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">We recommend creating a Gmail now as your backup suite (Mail, Drive, Docs, Meet).</p>
          <Row>
            {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
            <Button onClick={() => window.open("https://accounts.google.com/SignUp", "_blank")}>Create Gmail</Button>
          </Row>
        </div>
      )}
    </Card>
  );
}

function CompanyName({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [checking, setChecking] = useState(false);

  async function checkName() {
    setChecking(true);
    const ok = await mockCheckCompanyNameAvailability(state.companyName);
    setState({ companyNameAvailable: ok });
    setChecking(false);
    if (ok || state.hasCompanyName === false) onNext();
  }

  return (
    <Card title="Is this your company email?" hint="If not, confirm (or pick) your company name first.">
      <div className="flex gap-3">
        <Button variant={state.isCompanyEmail === true ? "primary" : "secondary"} onClick={() => setState({ isCompanyEmail: true, hasCompanyName: true })}>Yes — it’s my company email</Button>
        <Button variant={state.isCompanyEmail === false ? "primary" : "secondary"} onClick={() => setState({ isCompanyEmail: false })}>No — it’s personal</Button>
      </div>

      {state.isCompanyEmail === false && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Do you already have a company name?</p>
          <div className="flex gap-3">
            <Button variant={state.hasCompanyName ? "primary" : "secondary"} onClick={() => setState({ hasCompanyName: true })}>Yes</Button>
            <Button variant={state.hasCompanyName === false ? "primary" : "secondary"} onClick={() => setState({ hasCompanyName: false, companyName: "" })}>No</Button>
          </div>

          <div className="space-y-2">
            <Label>Company name</Label>
            <Input
              placeholder="e.g., Choice Plus Trading LLC"
              value={state.companyName}
              onChange={(e) => setState({ companyName: e.target.value })}
              disabled={state.hasCompanyName === false}
            />
            {state.companyNameAvailable !== null && (
              <Badge ok={!!state.companyNameAvailable} label={state.companyNameAvailable ? "Looks available" : "Might be taken"} />
            )}
          </div>

          <Row>
            <Button variant="ghost" onClick={onBack}>Back</Button>
            <Button onClick={checkName} disabled={checking || (!!state.hasCompanyName && state.companyName.trim().length < 3)}>
              {checking ? "Checking…" : state.hasCompanyName ? "Check & Continue" : "Continue with Gmail backup"}
            </Button>
          </Row>

          {state.hasCompanyName === false && (
            <p className="text-xs text-zinc-500">We’ll use Gmail as your backup until your name is certified. You can set the domain later.</p>
          )}
        </div>
      )}

      {state.isCompanyEmail === true && (
        <Row>
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button onClick={onNext}>Continue</Button>
        </Row>
      )}
    </Card>
  );
}

function EmailDomain({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [dnsChecking, setDnsChecking] = useState(false);
  const [dns, setDns] = useState<{ mx: boolean; spf: boolean; dkim: boolean; dmarc: boolean } | null>(null);

  async function runDNSCheck() {
    setDnsChecking(true);
    const res = await mockCheckDNS(state.domainName);
    setDns(res);
    setDnsChecking(false);
    const ok = res.mx && res.spf && res.dkim && res.dmarc;
    setState({ domainVerified: ok });
  }

  const showDomainPath = state.hasDomain === true;

  return (
    <Card title="Email & Domain" hint="Gmail is our go-to. Add a domain now or later.">
      <div className="flex gap-3">
        <Button variant={state.hasDomain ? "primary" : "secondary"} onClick={() => setState({ hasDomain: true, workspaceType: "domain" })}>I already have a domain</Button>
        <Button variant={state.hasDomain === false ? "primary" : "secondary"} onClick={() => setState({ hasDomain: false, workspaceType: "gmail", domainName: "", domainVerified: false })}>Use Gmail for now</Button>
      </div>

      {showDomainPath && (
        <div className="space-y-3">
          <div>
            <Label>Your domain</Label>
            <Input placeholder="company.com" value={state.domainName} onChange={(e) => setState({ domainName: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={runDNSCheck} disabled={!state.domainName || dnsChecking}>
              {dnsChecking ? "Checking…" : "Check DNS (MX/SPF/DKIM/DMARC)"}
            </Button>
            {dns && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge ok={dns.mx} label="MX" />
                <Badge ok={dns.spf} label="SPF" />
                <Badge ok={dns.dkim} label="DKIM" />
                <Badge ok={dns.dmarc} label="DMARC" />
              </div>
            )}
          </div>
          {state.domainVerified && <p className="text-sm text-emerald-300">Domain verified — Workspace can be attached.</p>}
        </div>
      )}

      {!showDomainPath && (
        <div className="space-y-2 text-sm text-zinc-400">
          <p>We’ll start with Gmail (Mail, Drive, Docs, Meet). You can add a domain after your company name is certified.</p>
          <div className="flex items-center gap-2 text-xs">
            <Badge ok label="Gmail ready" />
            {state.corAeAliasEnabled && <Badge ok label="corAe alias ON" />}
          </div>
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={showDomainPath ? !state.domainVerified : !state.emailVerified}>Continue</Button>
      </Row>
    </Card>
  );
}

function JurisdictionStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options: { key: Jurisdiction; label: string }[] = [
    { key: "UAE", label: "United Arab Emirates" },
    { key: "UK", label: "United Kingdom" },
    { key: "PH", label: "Philippines" },
    { key: "OTHER", label: "Other" },
  ];
  return (
    <Card title="Where will the company be registered?" hint="This sets the legal forms, VAT logic, and documents.">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <Button key={o.key} variant={state.jurisdiction === o.key ? "primary" : "secondary"} onClick={() => setState({ jurisdiction: o.key })}>
            {o.label}
          </Button>
        ))}
      </div>
      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!state.jurisdiction}>Continue</Button>
      </Row>
    </Card>
  );
}

function LegalTypeStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const byJ: Partial<Record<Jurisdiction, { key: LegalType; label: string; hint?: string }[]>> = {
    UAE: [
      { key: "LLC", label: "LLC (Mainland/Freezone)", hint: "Standard limited liability company" },
      { key: "FZE", label: "FZE (Free Zone Establishment)", hint: "Single shareholder" },
      { key: "SOLE", label: "Sole Proprietorship" },
      { key: "BRANCH", label: "Branch" },
    ],
    UK: [
      { key: "LLC", label: "Ltd (Private Limited Company)" },
      { key: "SOLE", label: "Sole Trader" },
      { key: "PARTNERSHIP", label: "Partnership" },
      { key: "BRANCH", label: "Branch" },
    ],
    PH: [
      { key: "LLC", label: "Corporation (Stock/OPC)" },
      { key: "SOLE", label: "Sole Proprietor (DTI)" },
      { key: "PARTNERSHIP", label: "Partnership" },
      { key: "BRANCH", label: "Branch" },
    ],
    OTHER: [
      { key: "LLC", label: "LLC / Limited" },
      { key: "SOLE", label: "Sole Proprietor" },
      { key: "PARTNERSHIP", label: "Partnership" },
      { key: "BRANCH", label: "Branch" },
    ],
  };
  const list = byJ[state.jurisdiction ?? "OTHER"] ?? byJ["OTHER"]!;
  return (
    <Card title="Choose your legal type" hint="This determines liability, paperwork, and shareholder rules.">
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((o) => (
          <button
            key={o.key}
            onClick={() => setState({ legalType: o.key })}
            className={`rounded-xl border px-4 py-3 text-left transition ${state.legalType === o.key ? "border-zinc-200 bg-zinc-100 text-zinc-950" : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}
          >
            <div className="text-sm font-semibold">{o.label}</div>
            {o.hint && <div className="text-xs text-zinc-400">{o.hint}</div>}
          </button>
        ))}
      </div>
      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!state.legalType}>Continue</Button>
      </Row>
    </Card>
  );
}

function BusinessActivityStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const results = searchActivities(state.jurisdiction, q);

  function add(activity: ActivityCode) {
    const exists = state.activityCodes.some(a => a.code === activity.code && a.source === activity.source);
    if (!exists) setState({ activityCodes: [...state.activityCodes, activity] });
  }
  function remove(code: string) {
    setState({ activityCodes: state.activityCodes.filter(a => a.code !== code) });
  }

  const canContinue = state.businessDescription.trim().length >= 10 && state.activityCodes.length > 0;

  return (
    <Card
      title="What does the business do?"
      hint={state.jurisdiction === "UAE"
        ? "Describe your activity and pick UAE business activities (DED/Freezone)."
        : state.jurisdiction === "UK"
        ? "Describe your activity and pick UK SIC codes."
        : "Describe your activity and pick a general category."}
    >
      <div className="space-y-3">
        <div>
          <Label>Describe the business (plain English)</Label>
          <Input
            placeholder="e.g., We build and sell custom e-commerce websites for retailers in the UAE."
            value={state.businessDescription}
            onChange={(e) => setState({ businessDescription: e.target.value })}
          />
          <p className="mt-1 text-xs text-zinc-500">At least 10 characters. This seeds corAe modules (Sales, Projects, Finance).</p>
        </div>

        <div className="space-y-2">
          <Label>
            {state.jurisdiction === "UAE" ? "Search UAE activities" :
             state.jurisdiction === "UK"  ? "Search UK SIC codes" :
             "Search activity categories"}
          </Label>
          <Input placeholder="Type keywords or a code…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="grid gap-2 sm:grid-cols-2">
            {results.map((a) => (
              <button
                key={`${a.source}-${a.code}`}
                onClick={() => add(a)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-left hover:bg-zinc-900"
              >
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-xs text-zinc-400">{a.source} • {a.code}</div>
              </button>
            ))}
          </div>
        </div>

        {state.activityCodes.length > 0 && (
          <div className="space-y-2">
            <Label>Selected activities</Label>
            <div className="flex flex-wrap gap-2">
              {state.activityCodes.map(a => (
                <Chip key={`${a.source}-${a.code}`} onRemove={() => remove(a.code)}>
                  {a.label} <span className="text-zinc-400">• {a.code}</span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        <Row>
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button onClick={onNext} disabled={!canContinue}>Continue</Button>
        </Row>
      </div>
    </Card>
  );
}

function OwnersStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const owners = state.owners;
  const total = sumPct(owners);
  const pctOk = Math.round(total) === 100;

  function update(id: string, patch: Partial<Owner>) {
    setState({ owners: owners.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  }
  function addOwner() {
    const rem = Math.max(0, 100 - sumPct(owners));
    setState({ owners: [...owners, { id: rid(), fullName: "", email: "", pct: rem || 0, idDocUrl: "" }] });
  }
  function removeOwner(id: string) {
    if (owners.length === 1) return;
    setState({ owners: owners.filter((o) => o.id !== id) });
  }

  return (
    <Card title="Owners & Shares" hint="Add shareholders. Shares must total 100%.">
      <div className="space-y-4">
        {owners.map((o, idx) => (
          <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-3 text-xs text-zinc-400">Owner {idx + 1}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Full name</Label>
                <Input value={o.fullName} onChange={(e) => update(o.id, { fullName: e.target.value })} placeholder="e.g., Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={o.email} onChange={(e) => update(o.id, { email: e.target.value })} type="email" placeholder="name@company.com" />
              </div>
              <div>
                <Label>Share %</Label>
                <Input value={String(o.pct)} onChange={(e) => update(o.id, { pct: Number(e.target.value) })} type="number" min={0} max={100} />
              </div>
              <div>
                <Label>ID / Passport (URL or ref)</Label>
                <Input value={o.idDocUrl} onChange={(e) => update(o.id, { idDocUrl: e.target.value })} placeholder="https://… or upload ref" />
              </div>
            </div>
            <div className="mt-3">
              <Button variant="danger" onClick={() => removeOwner(o.id)} disabled={owners.length === 1}>Remove</Button>
            </div>
          </div>
        ))}
        <Row>
          <Button variant="secondary" onClick={addOwner}>+ Add owner</Button>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Total</span>
            <span className="font-semibold">{total}%</span>
            <Badge ok={pctOk} label={pctOk ? "100% OK" : "Must total 100%"} />
          </div>
        </Row>
      </div>

      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!pctOk || owners.some((o) => !o.fullName || !o.email)}>Continue</Button>
      </Row>
    </Card>
  );
}

function TaxStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const inferredVat = useMemo(
    () => decideVatRequired(state.jurisdiction, state.expectTurnover),
    [state.jurisdiction, state.expectTurnover]
  );

  return (
    <Card title="Tax & Registration" hint="VAT can take weeks — save anytime and return.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Estimated annual turnover</Label>
          <Input
            placeholder="e.g., 500000"
            type="number"
            min={0}
            value={state.expectTurnover ?? ""}
            onChange={(e) => setState({ expectTurnover: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-end">
          <Badge ok={inferredVat === true} label={inferredVat ? "VAT likely required" : "VAT not required yet"} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>VAT / Tax Registration Number (if already registered)</Label>
          <Input placeholder="TRN / UTR" value={state.trn} onChange={(e) => setState({ trn: e.target.value })} />
        </div>
        <div className="flex items-end gap-3">
          <Button variant="secondary" onClick={() => setState({ trn: state.trn || "PENDING-TRN", vatRequired: inferredVat ?? null })}>Start VAT Registration</Button>
          <Button variant="secondary" onClick={() => setState({ corpTaxRegistered: true })}>Register Corporate Tax</Button>
        </div>
      </div>

      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={inferredVat === null && !state.corpTaxRegistered && !state.trn}>Continue</Button>
      </Row>
    </Card>
  );
}

function BankingStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card title="Bank Account" hint="Open a new account or connect an existing one.">
      <div className="flex gap-3">
        <Button variant={state.hasBank === true ? "primary" : "secondary"} onClick={() => setState({ hasBank: true })}>I already have a business account</Button>
        <Button variant={state.hasBank === false ? "primary" : "secondary"} onClick={() => setState({ hasBank: false })}>Open a new account</Button>
      </div>

      {state.hasBank === true && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Bank name</Label>
            <Input placeholder="e.g., Wio, Mashreq, ENBD, Monzo" value={state.bankChoice} onChange={(e) => setState({ bankChoice: e.target.value })} />
          </div>
          <div>
            <Label>IBAN</Label>
            <Input placeholder="AE12 3456 7890 1234 5678 901" value={state.iban} onChange={(e) => setState({ iban: e.target.value })} />
            {state.iban && <div className="mt-2"><Badge ok={ibanLooksValid(state.iban)} label={ibanLooksValid(state.iban) ? "IBAN format OK" : "Check IBAN"} /></div>}
          </div>
        </div>
      )}

      {state.hasBank === false && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Choose a partner to start an application (we’ll prefill from this wizard):</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setState({ bankChoice: "Wio Business" })}>Apply with Wio Business</Button>
            <Button variant="secondary" onClick={() => setState({ bankChoice: "Mashreq NeoBiz" })}>Apply with Mashreq NeoBiz</Button>
            <Button variant="secondary" onClick={() => setState({ bankChoice: "Emirates NBD" })}>Apply with Emirates NBD</Button>
            <Button variant="secondary" onClick={() => setState({ bankChoice: "Other" })}>Other</Button>
          </div>
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button
          onClick={onNext}
          disabled={
            state.hasBank == null ||
            (state.hasBank === true && (!state.bankChoice || !ibanLooksValid(state.iban)))
          }
        >
          Continue
        </Button>
      </Row>
    </Card>
  );
}

function Summary({
  state,
  onBack,
  onFinish,
}: {
  state: WizardState;
  onBack: () => void;
  onFinish: () => void;
}) {
  const ownersOk = Math.round(sumPct(state.owners)) === 100 && !state.owners.some((o) => !o.fullName || !o.email);
  const bankingOk = state.hasBank !== null && (state.hasBank === false || (state.bankChoice && ibanLooksValid(state.iban)));
  const allOk =
    !!state.emailVerified &&
    (state.isCompanyEmail || state.hasCompanyName !== null) &&
    (!!state.jurisdiction && !!state.legalType) &&
    state.activityCodes.length > 0 &&
    state.businessDescription.trim().length >= 10 &&
    ownersOk &&
    (state.trn || state.corpTaxRegistered || state.expectTurnover !== null) &&
    bankingOk;

  return (
    <Card title="Review & Confirm" hint="If everything looks good, we’ll activate your company inside corAe.">
      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm">
        <SummaryRow label="Email" value={state.email || "—"} ok={state.emailVerified} />
        <SummaryRow label="Company name" value={state.companyName || (state.hasCompanyName === false ? "(Gmail backup)" : "—")} ok={!!state.companyName || state.hasCompanyName === false} />
        <SummaryRow label="Workspace" value={state.workspaceType === "gmail" ? "Gmail (backup-ready)" : `Domain: ${state.domainName || ""}`} ok={state.workspaceType === "gmail" || state.domainVerified} />
        <SummaryRow label="Jurisdiction" value={state.jurisdiction ?? "—"} ok={!!state.jurisdiction} />
        <SummaryRow label="Legal Type" value={state.legalType ?? "—"} ok={!!state.legalType} />
        <SummaryRow
          label={state.jurisdiction === "UK" ? "SIC Codes" : state.jurisdiction === "UAE" ? "UAE Activities" : "Activities"}
          value={state.activityCodes.length ? state.activityCodes.map(a => `${a.code}`).join(", ") : "—"}
          ok={state.activityCodes.length > 0}
        />
        <SummaryRow label="Owners" value={`${state.owners.length} owner(s), total ${sumPct(state.owners)}%`} ok={Math.round(sumPct(state.owners)) === 100} />
        <SummaryRow label="Tax" value={state.trn ? `TRN/UTR: ${state.trn}` : state.corpTaxRegistered ? "Corporate Tax registered" : "Pending"} ok={!!state.trn || state.corpTaxRegistered || state.expectTurnover !== null} />
  <SummaryRow label="Banking" value={state.hasBank ? `${state.bankChoice} • ${state.iban || "(IBAN pending)"}` : state.hasBank === false ? "Applying" : "—"} ok={!!bankingOk} />
      </div>
      <Row>
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onFinish} disabled={!allOk}>Confirm & Activate</Button>
      </Row>
    </Card>
  );
}
function SummaryRow({ label, value, ok }: { label: string; value: React.ReactNode; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-100">{value}</span>
        <Badge ok={ok} label={ok ? "OK" : "Check"} />
      </div>
    </div>
  );
}

function Success({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <Card title="All set 🎉" hint="Your company is initialized in corAe.">
      <p className="text-sm text-zinc-300">Next up: OBARI™, FileLogic™, HR™, and CIMS™ bootstrapping.</p>
      <Button onClick={onOpenDashboard}>Open Dashboard</Button>
    </Card>
  );
}

/* ───────────────────── Page (single state machine + Save/Resume) ───────────────────── */
export default function CompanyWizardPage() {
  const [s, setS] = useState<WizardState>(initialState);
  const [saving, setSaving] = useState(false);
  const [resumeFound, setResumeFound] = useState<WizardState | null>(null);

  // detect existing draft
  useEffect(() => {
    const draft = loadDraftLocal();
    if (draft) setResumeFound(draft);
  }, []);

  function patch(p: Partial<WizardState>) {
    setS((x) => ({ ...x, ...p }));
  }
  function go(next: StepKey) {
    setS((x) => ({ ...x, step: next }));
  }

  function handleSave() {
    setSaving(true);
    const savedAt = saveDraftLocal(s);
    setS((x) => ({ ...x, savedAt }));
    setTimeout(() => setSaving(false), 400);
  }
  function handleResume() {
    if (!resumeFound) return;
    setS(resumeFound);
    setResumeFound(null);
  }
  function discardResume() {
    clearDraftLocal();
    setResumeFound(null);
  }

  const headerRight = (
    <div className="flex items-center gap-2 text-xs">
      <Badge ok={s.emailVerified} label="Email" />
      <Badge ok={s.workspaceType === "gmail" || s.domainVerified} label="Workspace" />
      <Badge ok={!!s.jurisdiction} label="Jurisdiction" />
      <Badge ok={!!s.legalType} label="Legal" />
      <Badge ok={s.activityCodes.length > 0} label="Activity" />
      <Badge ok={Math.round(sumPct(s.owners)) === 100} label="Owners" />
      <Badge ok={!!s.trn || s.corpTaxRegistered || s.expectTurnover !== null} label="Tax" />
      <Badge ok={s.hasBank !== null && (s.hasBank === false || (!!s.bankChoice && ibanLooksValid(s.iban)))} label="Bank" />
    </div>
  );

  function finish() {
    // TODO: persist + bootstrap corAe modules (OBARI/FileLogic/HR/CIMS), then route to dashboard
    // In OSS mode, just clear draft and show success.
    clearDraftLocal();
    go("SUCCESS");
  }

  return (
    <Shell headerRight={headerRight}>
      {/* Resume banner */}
      {resumeFound && (
        <div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-900/20 p-4 text-sm text-amber-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>Draft found (saved {resumeFound.savedAt ? timeAgo(resumeFound.savedAt) : "previously"}). Resume where you left off?</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleResume}>Resume draft</Button>
              <Button variant="ghost" onClick={discardResume}>Discard</Button>
            </div>
          </div>
        </div>
      )}

      {s.step === "WELCOME" && <Welcome onNext={() => go("SIGN_IN")} />}

      {s.step === "SIGN_IN" && (
        <SignIn state={s} setState={patch} onNext={() => go("COMPANY_NAME")} />
      )}

      {s.step === "COMPANY_NAME" && (
        <CompanyName state={s} setState={patch} onNext={() => go("EMAIL_DOMAIN")} onBack={() => go("SIGN_IN")} />
      )}

      {s.step === "EMAIL_DOMAIN" && (
        <EmailDomain state={s} setState={patch} onNext={() => go("JURISDICTION")} onBack={() => go("COMPANY_NAME")} />
      )}

      {s.step === "JURISDICTION" && (
        <JurisdictionStep state={s} setState={patch} onNext={() => go("LEGAL_TYPE")} onBack={() => go("EMAIL_DOMAIN")} />
      )}

      {s.step === "LEGAL_TYPE" && (
        <LegalTypeStep state={s} setState={patch} onNext={() => go("BUSINESS_ACTIVITY")} onBack={() => go("JURISDICTION")} />
      )}

      {s.step === "BUSINESS_ACTIVITY" && (
        <BusinessActivityStep state={s} setState={patch} onNext={() => go("OWNERS")} onBack={() => go("LEGAL_TYPE")} />
      )}

      {s.step === "OWNERS" && (
        <OwnersStep state={s} setState={patch} onNext={() => go("TAX")} onBack={() => go("BUSINESS_ACTIVITY")} />
      )}

      {s.step === "TAX" && (
        <TaxStep state={s} setState={patch} onNext={() => go("BANKING")} onBack={() => go("OWNERS")} />
      )}

      {s.step === "BANKING" && (
        <BankingStep state={s} setState={patch} onNext={() => go("SUMMARY")} onBack={() => go("TAX")} />
      )}

      {s.step === "SUMMARY" && (
        <Summary state={s} onBack={() => go("BANKING")} onFinish={finish} />
      )}

      {s.step === "SUCCESS" && <Success onOpenDashboard={() => alert("➡️ Redirect to /dashboard (TODO).")} />}

      {/* Save & Continue Later (persistent across steps) */}
      {s.step !== "SUCCESS" && <SaveBar onSave={handleSave} savedAt={s.savedAt} saving={saving} />}
    </Shell>
  );
}