"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { usePathname, useRouter, useSelectedLayoutSegments } from "next/navigation";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter" });

// Keep URL slugs light and distinct from API step names
const ORDER = [
  { slug: "lead",        label: "Lead" },
  { slug: "intake",      label: "Intake" },         // btdo.intake
  { slug: "accept",      label: "Accept" },         // btdo.accept
  { slug: "pricelock",   label: "Pricelock" },      // bdo.pricelock
  { slug: "booking",     label: "Booking" },        // bdo.booking-sheet
  { slug: "docs",        label: "Docs" },           // bdo.documentation
  { slug: "activate",    label: "Activate" },       // bdo.activate
] as const;

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // safe client-only param getter to avoid SSR/Prerender useSearchParams issues
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const segments = useSelectedLayoutSegments(); // [..., "lead" | "intake" | ...] inside (steps)

  // figure out which step we are on
  const currentSlug = useMemo(() => {
    // last segment in this route group should be the step
    const last = segments && segments.length > 0 ? segments[segments.length - 1] : undefined;
    // Fallback: try to infer from pathname
    const step = last || pathname?.split("/").filter(Boolean).at(-1) || "lead";
    return step as (typeof ORDER)[number]["slug"];
  }, [segments, pathname]);

  const idx = Math.max(0, ORDER.findIndex(s => s.slug === currentSlug));
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  // carry forward important params
  const carryParams = new URLSearchParams();
  const carryKeys = ["dealId", "companyId", "mode", "relationship"];
  carryKeys.forEach(k => {
    const v = getParam(k);
    if (v) carryParams.set(k, v);
  });
  const suffix = carryParams.toString() ? `?${carryParams.toString()}` : "";

  // progress %
  const progress = (idx / (ORDER.length - 1)) * 100;

  return (
    <div className={`wizard-shell ${inter.variable}`}>
      {/* Top bar */}
      <header className="top">
        <div className="left">
          <button
            className="circle"
            onClick={() => router.push(`/ship/business/oms/onboarding/wizard/signup${suffix}`)}
            title="Signup"
          >←</button>
          <h1 className="title">Onboarding Wizard</h1>
        </div>
        <div className="right">
          {prev ? (
            <Link className="circle" href={`/ship/business/oms/onboarding/wizard/${prev.slug}${suffix}`} title={`Back: ${prev.label}`}>←</Link>
          ) : (
            <button className="circle" disabled title="Start">←</button>
          )}
          {next ? (
            <Link className="circle" href={`/ship/business/oms/onboarding/wizard/${next.slug}${suffix}`} title={`Next: ${next.label}`}>→</Link>
          ) : (
            <button className="circle" disabled title="End">→</button>
          )}
        </div>
      </header>

      {/* Steps bar */}
      <nav className="steps">
        <div className="track">
          <div className="fill" style={{ width: `${progress}%` }} />
        </div>
        <ul className="labels" role="list">
          {ORDER.map((s, i) => {
            const active = i === idx;
            const done = i < idx;
            return (
              <li key={s.slug}>
                <Link
                  href={`/ship/business/oms/onboarding/wizard/${s.slug}${suffix}`}
                  className={`pill ${active ? "active" : ""} ${done ? "done" : ""}`}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Content */}
      <main className="panel" role="main">{children}</main>

      {/* Theme (global) */}
      <style jsx global>{`
        :root {
          --bg: radial-gradient(1200px 600px at 20% -10%, #0b1220 0%, #0a0f1a 40%, #070b14 100%);
          --surface: rgba(16, 24, 40, .6);
          --card: rgba(16, 24, 40, .72);
          --ring: #0ea5e9;
          --fg: #e2e8f0;
          --fg-muted: #94a3b8;
          --border: rgba(148,163,184,.18);
          --pill: linear-gradient(180deg, #0e1626 0%, #0b1220 100%);
          --pill-on: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
          --shadow-outer: 0 24px 60px rgba(2,6,23,.55);
          --shadow-inner: inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.35);
        }
        html, body { background: var(--bg); color: var(--fg); }
      `}</style>

      {/* Local styles for the shell */}
      <style jsx>{`
        .wizard-shell { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: var(--font-inter), Inter, ui-sans-serif; }
        .top { display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; }
        .left { display:flex; align-items:center; gap:10px; }
        .right { display:flex; align-items:center; gap:8px; }
        .title { font-weight: 700; letter-spacing:.2px; font-size: 1.4rem; color: #e5f3ff; text-shadow: 0 2px 24px rgba(14,165,233,.25); }
        .circle {
          width:36px; height:36px; border-radius:9999px; border:1px solid var(--border); background: var(--pill); color:#dbeafe;
          display:grid; place-items:center; box-shadow: var(--shadow-inner), 0 6px 18px rgba(14,165,233,.15);
        }
        .circle[disabled] { opacity:.4; }
        .steps { margin: 12px 0 14px; }
        .track { height: 3px; width:100%; background: rgba(14,165,233,.15); border-radius: 9999px; overflow: hidden; box-shadow: inset 0 0 20px rgba(14,165,233,.25); }
        .fill { height: 100%; background: linear-gradient(90deg, #22d3ee, #0ea5e9, #0284c7); box-shadow: 0 0 18px rgba(14,165,233,.45); }
        .labels { display:flex; gap:8px; flex-wrap: wrap; margin-top: 8px; padding: 0; list-style: none; }
        .pill {
          padding:.45rem .7rem; border-radius:9999px; border:1px solid var(--border);
          background: var(--pill); color:#cfe9ff; font-size:.78rem; box-shadow: var(--shadow-inner);
        }
        .pill.active {
          background: var(--pill-on); color: #00131f; border-color:#22d3ee;
          box-shadow: 0 10px 24px rgba(14,165,233,.35), inset 0 1px 0 rgba(255,255,255,.2);
        }
        .pill.done { opacity: .9; }
        .panel { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-outer), var(--shadow-inner); }
      `}</style>
    </div>
  );
}