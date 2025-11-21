"use client";

import React, { useEffect, useState } from "react";

type Summary = {
  home: boolean;
  work: boolean;
  business: boolean;
  latestByDomain: Partial<Record<"home" | "work" | "business", string>>;
};

export default function AscendDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch("/api/ascend/alignment", { cache: "no-store" });
        const data = await res.json();
        if (on) setSummary(data.summary as Summary);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, []);

  if (loading) {
    return <div className="rounded-xl border p-4 text-sm">Loading Ascend…</div>;
  }

  if (!summary) {
    return <div className="rounded-xl border p-4 text-sm">No alignment data available.</div>;
  }

  const allAligned = summary.home && summary.work && summary.business;

  return (
    <section className="w-full max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Ascend</h1>
        <p className="text-sm opacity-75">
          {allAligned
            ? "Alignment confirmed. Proceed with today’s WorkFocus™."
            : "Alignment pending. Complete your Social Contract in all domains."}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatusCard label="Home" ok={summary.home} when={summary.latestByDomain.home} href="/ship/home/social-contract" />
        <StatusCard label="Work" ok={summary.work} when={summary.latestByDomain.work} href="/ship/work/social-contract" />
        <StatusCard label="Business" ok={summary.business} when={summary.latestByDomain.business} href="/ship/business/social-contract" />
      </div>

      <nav className="flex flex-wrap gap-2">
        <a className="px-3 py-2 rounded-lg border" href="/ship/work/focus">Open WorkFocus™</a>
        <a className="px-3 py-2 rounded-lg border" href="/ship/work/pulse">View Pulse</a>
        <a className="px-3 py-2 rounded-lg border" href="/ship/work">Open Work</a>
      </nav>
    </section>
  );
}

function StatusCard({ label, ok, when, href }: { label: string; ok: boolean; when?: string; href: string }) {
  return (
    <a className="rounded-xl border p-4 focus:outline-none focus:ring" href={href}>
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-lg font-semibold mt-1">
        {ok ? "Aligned ✓" : "Pending •"}
      </div>
      {when && (
        <div className="text-xs opacity-60 mt-1">
          Last audit: {new Date(when).toLocaleDateString()}
        </div>
      )}
      <div className="text-xs underline mt-2 block">Review / update</div>
    </a>
  );
}
