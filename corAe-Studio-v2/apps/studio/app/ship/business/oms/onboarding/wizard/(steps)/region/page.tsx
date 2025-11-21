"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getParam } from "@/app/lib/nav/qs";

/**
 * Region step (must be first)
 * - Guesses region from browser (locale + timezone)
 * - User can confirm/override
 * - Persists to sessionStorage ("wizard:region")
 * - Continues to /lead with ?region=CODE
 */

type RegionCode = "UK" | "EU" | "US" | "UAE" | "SA" | "IN" | "OTHER";

const REGIONS: Array<{
  code: RegionCode;
  name: string;
  currency: string;
  taxLabel: string;     // what we call tax/VAT in this region
  notes: string;        // short compliance hint shown on screen
}> = [
  { code: "UK",   name: "United Kingdom",     currency: "GBP", taxLabel: "VAT",       notes: "Companies House â€¢ VAT (GB) â€¢ Postcode format" },
  { code: "EU",   name: "European Union",     currency: "EUR", taxLabel: "VAT",       notes: "EU VAT (country-specific) â€¢ EORI (where applicable)" },
  { code: "US",   name: "United States",      currency: "USD", taxLabel: "Sales Tax", notes: "State Sales Tax â€¢ EIN" },
  { code: "UAE",  name: "United Arab Emirates", currency: "AED", taxLabel: "VAT",     notes: "TRN â€¢ Ejari/Trade Licence attachments" },
  { code: "SA",   name: "Saudi Arabia",       currency: "SAR", taxLabel: "VAT",       notes: "ZATCA â€¢ CR Number" },
  { code: "IN",   name: "India",              currency: "INR", taxLabel: "GST",       notes: "GSTIN â€¢ PAN" },
  { code: "OTHER",name: "Other / Not Listed", currency: "USD", taxLabel: "Tax",       notes: "Generic profile; weâ€™ll capture details in intake" },
];

function guessRegion(): RegionCode {
  // Best-effort guess based on language + IANA timezone
  try {
    const lang = (navigator.language || "").toLowerCase(); // e.g. "en-GB"
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; // e.g. "Europe/London"

    if (/ae|dubai|abudhabi/i.test(tz) || /-ae$/.test(lang)) return "UAE";
    if (/riyadh|jeddah|arabia/i.test(tz) || /-sa$/.test(lang)) return "SA";
    if (/kolkata|delhi|mumbai|calcutta|india/i.test(tz) || /-in$/.test(lang)) return "IN";

    if (/london|dublin|lisbon|europe\/london/i.test(tz) || /-gb$/.test(lang)) return "UK";
    if (/new_york|chicago|denver|los_angeles|phoenix|america\//i.test(tz) || /-us$/.test(lang)) return "US";

    // Broad EU check
    if (/europe\//i.test(tz) || /(de|fr|es|it|nl|se|dk|fi|pt|pl|ro|cz|at|be|ie|gr|hu|sk|bg|hr|lt|lv|ee)\b/.test(lang))
      return "EU";
  } catch {}
  return "OTHER";
}

export default function RegionStepPage() {
  const router = useRouter();



  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // seed: url > session > guess â€” read params in effect to avoid SSR read
  const [region, setRegion] = useState<RegionCode>(guessRegion());

  useEffect(() => {
    try {
      const seeded = (getParam("region", "")?.toUpperCase() as RegionCode) || null;
      const fromSession = typeof window !== "undefined" ? (sessionStorage.getItem("wizard:region") as RegionCode | null) : null;
      setRegion(seeded || fromSession || guessRegion());
    } catch {}
  }, []);

  // Persist selection
  useEffect(() => {
    try {
      if (region) sessionStorage.setItem("wizard:region", region);
    } catch {}
  }, [region]);

  const info = useMemo(() => REGIONS.find(r => r.code === region)!, [region]);

  async function goNext() {
    setBusy(true);
    try {
      // Stash a small seed for later steps; the rest is captured in Intake
      const seed = {
        region,
        currency: info.currency,
        taxLabel: info.taxLabel,
        ts: Date.now(),
      };
      sessionStorage.setItem("wizard:seed:region", JSON.stringify(seed));

      // Continue to LEAD with query param (so pages can key behaviour)
      router.push(`/business/oms/onboarding/wizard/(steps)/lead?region=${encodeURIComponent(region)}`);
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Could not continue"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="top">
        <h1 className="title">Choose Region</h1>
      </header>

      {msg && <p className="note">{msg}</p>}

      <section className="panel compact">
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="tag">Detected</div>
          <span className="badge">{humanGuess(region)}</span>
          <span className="muted">Change if not correct.</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="subtle" style={{ marginBottom: 8 }}>Where will this account operate primarily?</h2>
        <div className="chips" style={{ marginBottom: 10 }}>
          {REGIONS.map(r => (
            <button
              key={r.code}
              className={`chip ${r.code === region ? "on" : ""}`}
              onClick={() => setRegion(r.code)}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="grid two" style={{ marginTop: 8 }}>
          <Field label="Currency (auto)">
            <input className="input" value={info.currency} readOnly />
          </Field>
          <Field label="Tax Label">
            <input className="input" value={info.taxLabel} readOnly />
          </Field>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          {info.notes}
        </p>
      </section>

      <div className="end">
        <button className="ghost" onClick={() => (router as any).back?.()}>â† Back</button>
        <button className="primary" disabled={busy} onClick={goNext}>
          Continue â†’
        </button>
      </div>

      <style jsx global>{`
        .page { max-width: 1100px; margin: 0 auto; padding: 24px; }
        .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .title { font-weight: 700; font-size: 1.35rem; letter-spacing: .2px; }
        .panel { background: var(--panel, rgba(16,24,40,.72)); border: 1px solid var(--border, rgba(148,163,184,.18));
                 border-radius: 16px; padding: 14px; box-shadow: var(--shadow, 0 24px 60px rgba(2,6,23,.55)); margin-bottom: 12px; }
        .panel.compact { background: var(--panel-2, rgba(16,24,40,.55)); }
        .row { display:flex; align-items:center; gap: 8px; }
        .wrap { flex-wrap: wrap; }
        .tag { font-size:.8rem; color: var(--fg-muted, #94a3b8); padding:4px 8px; border:1px solid var(--border); border-radius:9999px; }
        .badge { font-size:.75rem; padding:.25rem .55rem; border:1px solid var(--border); border-radius: .6rem; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { padding:.55rem .9rem; border-radius:9999px; border:1px solid var(--border); background: var(--pill, #0b1220);
                color:#cfe9ff; box-shadow: inset 0 1px 0 rgba(255,255,255,.06); font-weight:600; }
        .chip.on { background: var(--pill-on, linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)); color: #fff; border-color: #0ea5e9; }
        .grid.two { display:grid; grid-template-columns: 1fr; gap:12px; }
        @media (min-width: 680px) { .grid.two { grid-template-columns: 1fr 1fr; } }
        .input { width:100%; border-radius:12px; padding:.75rem .9rem; background:#0b1323; color:#e2e8f0; border:1px solid var(--border); }
        .muted { color: var(--fg-muted, #94a3b8); }
        .ghost { background:#0a1222; color:#d1eaff; border:1px solid var(--border); padding:.7rem 1.1rem; border-radius:12px; }
        .primary { background: linear-gradient(180deg, #22d3ee 0%, #0ea5e9 55%, #0284c7 100%); color:#00121c; font-weight:800;
                   padding:.75rem 1.15rem; border-radius:12px; border:none; }
        .end { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top: 10px; }
        .note { color: var(--fg-muted, #94a3b8); margin: 8px 2px; }
        .subtle { color: #cdeaff; font-weight: 600; margin-top: 6px; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function humanGuess(code: RegionCode) {
  const r = REGIONS.find((x) => x.code === code);
  return r ? `${r.name} (${code})` : "Unknown";
}
