"use client";

/**
 * OMS â€” Office Management System (150% logic)
 * - Hydration-safe stream, deterministic UTC timestamps
 * - Live tile for SLA & Escalation (new)
 * - Onboarding shortcuts retained at bottom
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Tick = {
  id: string;
  ts: string;
  scope: "Ops" | "Finance" | "HR" | "Compliance" | "OBARI" | "Mgmt";
  text: string;
  href?: string;
};

type TileCfg = { href: string; title: string; desc: string; cta?: string };

/* ----------------------------- Section Tiles ----------------------------- */
const TILES: TileCfg[] = [
  { href: "reserve", title: "Reserveâ„¢", desc: "Bookings, inventory, and live marketplace flows", cta: "Open Reserveâ„¢" },
  { href: "obari", title: "OBARI", desc: "Order â†’ Booking â†’ Active â†’ Reporting â†’ Invoice", cta: "Open OBARI" },
  { href: "sla-escalation", title: "SLA & Escalation", desc: "Set live thresholds & notifications", cta: "Manage SLA" },
  { href: "operations", title: "Operations", desc: "Workflows, SOPs, daily checklists", cta: "Open Operations" },
  { href: "finance", title: "Finance", desc: "POS, AR/AP, Vendors, Purchase Orders, GRVs", cta: "Open Finance" },
  { href: "management", title: "Management", desc: "CAIA assistant, scheduling, HR, compliance", cta: "Open Management" },
];

/* ----------------------------- Workflow Stream ----------------------------- */
function fmtUTC(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
    d.getUTCHours()
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

function useWorkflowTicks() {
  const seed: Tick[] = useMemo(() => {
    const now = new Date().toISOString();
    return [
      { id: "t1", ts: now, scope: "OBARI", text: "3 new Orders awaiting Pricelock check", href: "/business/oms/obari/orders" },
      { id: "t2", ts: now, scope: "Finance", text: "PO draft pending approval", href: "/business/oms/finance/purchase-orders" },
      { id: "t3", ts: now, scope: "Ops", text: "SOP: Freezer temp check overdue by 30m", href: "/business/oms/operations/sop" },
      { id: "t4", ts: now, scope: "Mgmt", text: "CAIA: 2 follow-ups due today", href: "/business/oms/management/caia/diary" },
      { id: "t5", ts: now, scope: "HR", text: "Rota change: Friday coverage updated", href: "/business/oms/management/hr" },
      { id: "t6", ts: now, scope: "Compliance", text: "Health cards expiring soon: 2 staff", href: "/business/oms/management/compliance" },
    ];
  }, []);
  const [ticks] = useState(seed);
  return { ticks };
}

/* ----------------------------- Components ----------------------------- */
function ScopeBadge({ scope }: { scope: Tick["scope"] }) {
  const tone =
    scope === "OBARI"
      ? "text-indigo-300 border-indigo-700/60 bg-indigo-950/30"
      : scope === "Finance"
      ? "text-emerald-300 border-emerald-700/60 bg-emerald-950/30"
      : scope === "Ops"
      ? "text-sky-300 border-sky-700/60 bg-sky-950/30"
      : scope === "HR"
      ? "text-rose-300 border-rose-700/60 bg-rose-950/30"
      : scope === "Compliance"
      ? "text-amber-300 border-amber-700/60 bg-amber-950/30"
      : "text-zinc-300 border-zinc-700/60 bg-zinc-900/50";
  return <span className={`text-[10px] rounded-full px-2 py-1 border ${tone}`}>{scope}</span>;
}

function TickRow({ tick, big = false }: { tick: Tick; big?: boolean }) {
  const content = (
    <div className="flex items-start gap-3">
      <ScopeBadge scope={tick.scope} />
      <div className="flex-1">
        <div className={`font-medium ${big ? "text-base" : "text-sm"}`}>{tick.text}</div>
        <div className="text-[11px] text-zinc-400" suppressHydrationWarning>
          {fmtUTC(tick.ts)}
        </div>
      </div>
    </div>
  );
  return tick.href ? (
    // tick.href is a string path; cast to any to satisfy Next's Link typing
    <Link href={tick.href as unknown as any} className="block hover:opacity-90">
      {content}
    </Link>
  ) : (
    content
  );
}

function WorkflowTicker({ ticks }: { ticks: Tick[] }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ticks.length), 4000);
    return () => clearInterval(t);
  }, [ticks.length]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="font-semibold">Workflows Stream</div>
        <div className="text-xs text-zinc-400">Auto-rotate â€¢ scrollable</div>
      </div>

      <div className="px-4 py-3">{ticks.length > 0 && <TickRow tick={ticks[index]} big />}</div>

      <div ref={ref} className="max-h-56 overflow-auto border-t border-zinc-800">
        {ticks.map((t, i) => (
          <div key={t.id} className={`px-4 py-2 ${i === index ? "bg-zinc-900/40" : ""}`}>
            <TickRow tick={t} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800">
        <button
          onClick={() => setIndex((i) => (i - 1 + ticks.length) % ticks.length)}
          className="rounded-xl px-3 py-2 text-sm border border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
        >
          â€¹ Prev
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % ticks.length)}
          className="rounded-xl px-3 py-2 text-sm border border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
        >
          Next â€º
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Page ------------------------------- */
export default function OMSHome() {
  const { ticks } = useWorkflowTicks();

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-32">
        <header className="space-y-1 mb-6">
          <h1 className="text-3xl font-semibold">OMS â€” Office Management System</h1>
          <p className="text-sm text-zinc-400">
            Workflows for management & finance + Reserveâ„¢ + electronic OBARI hub.
          </p>
        </header>

        {/* Top Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <WorkflowTicker ticks={ticks} />

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 font-semibold">Work</div>
            <div className="p-4 space-y-3">
              <Link href={{ pathname: "/business/oms/operations/workflows" }} className="block rounded-xl p-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                3cDTD Tasks â€¢ Checklists
                <div className="text-xs text-zinc-400">Daily priorities, escalations, completion tracking</div>
              </Link>
              <Link href="/business/oms/obari/active" className="block rounded-xl p-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                Active Jobs
                <div className="text-xs text-zinc-400">Execution view with notes and handover</div>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 font-semibold">Senior Management</div>
            <div className="p-4 space-y-3">
              <Link href="/business/oms/management/caia" className="block rounded-xl p-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                CAIA â€” Executive Assistant
                <div className="text-xs text-zinc-400">Inbox, diary, follow-ups (CIMS-ready)</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom Tiles */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {TILES.map((t) => (
            <div
              key={t.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 transition"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="text-sm text-zinc-400">{t.desc}</p>
              </div>
              <div className="mt-3">
                <Link
                  href={`/business/oms/${t.href}` as unknown as any}
                  className="inline-block rounded-xl px-3 py-2 border border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-sm"
                >
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Onboarding Shortcuts */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/business/oms/onboarding/start-company"
            className="inline-block rounded-xl px-4 py-2 border border-emerald-700 bg-emerald-950/30 hover:bg-emerald-900/30 text-sm"
          >
            Start Business â†’
          </Link>
          <Link
            href="/business/oms/onboarding/flows"
            className="inline-block rounded-xl px-4 py-2 border border-indigo-700 bg-indigo-950/40 hover:bg-indigo-900/40 text-sm"
          >
            Edit Onboarding â†’
          </Link>
          <Link
            href="/business/oms/onboarding"
            className="inline-block rounded-xl px-4 py-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 text-sm"
          >
            OMS Onboarding â†’
          </Link>
        </div>
      </div>
    </div>
  );
}
