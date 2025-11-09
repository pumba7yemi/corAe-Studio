// apps/ship/app/business/oms/commercial/marketing/appraisals/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type DocKey = "dtd" | "pulse" | "obari";

const DOCS: Record<DocKey, { label: string; href: string; desc: string }> = {
  dtd:   { label: "3³DTD — One-Pager (PDF)", href: "/api/export/marketing/dtd",   desc: "28-day cadence overview" },
  pulse: { label: "Pulse — One-Pager (PDF)", href: "/api/export/marketing/pulse", desc: "Signals, merges, reporting" },
  obari: { label: "OBARI™ — One-Pager (PDF)", href: "/api/export/marketing/obari", desc: "Booking • Active • Reporting • Invoice" },
};

export default function MarketingAppraisals() {
  const [pick, setPick] = useState<DocKey>("dtd");
  const current = useMemo(() => DOCS[pick], [pick]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Business / OMS / Commercial / Marketing / <span className="text-sky-300">Appraisals</span>
        </h1>
        <p className="text-sm text-slate-400">Download brand-ready one-pagers.</p>
      </header>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Template</label>
            <select
              className="w-full sm:w-80 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              value={pick}
              onChange={(e) => setPick(e.target.value as DocKey)}
            >
              {Object.entries(DOCS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="mt-2 text-xs text-slate-500">{current.desc}</div>
          </div>

          <Link
            href={current.href}
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm"
          >
            ⬇️ Download PDF
          </Link>
        </div>

        <div className="text-xs text-slate-500">
          More:{" "}
          <span className="inline-flex items-center gap-2">
            <Link href="/ship/business/oms/commercial/marketing" className="underline hover:text-sky-300">Marketing Home</Link>
            •
            <Link href="/ship/business/oms/commercial" className="underline hover:text-sky-300">Commercial</Link>
          </span>
        </div>
      </section>
    </div>
  );
}