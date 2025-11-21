"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import CaiaDailyPulse from '../components/CaiaDailyPulse';
import SilBadge from '../components/SilBadge';
import { GreenConfidenceMeter } from '../components/GreenConfidenceMeter';
import SystemBuilderBadge from '../components/SystemBuilderBadge';

const doors = [
  { href: "/home", label: "Home", subtitle: "Start and end your day" },
  { href: "/work", label: "Work", subtitle: "Your Work OS focus" },
  { href: "/business", label: "Business", subtitle: "Owner mode" }
];

export default function Page() {
  const [health, setHealth] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/caia/health');
        if (!mounted) return;
        if (!res.ok) {
          setHealth({ status: 'CHECKING' });
          return;
        }
        const json = await res.json();
        // keep full health payload (includes sil probe info)
        setHealth(json);
      } catch (e) {
        if (mounted) setHealth({ status: 'CHECKING' });
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="w-full max-w-4xl px-6 py-10 space-y-8">
      <CaiaDailyPulse />
      {health && (
        <div className="mb-4">
          <div className="inline-flex items-center gap-3">
            <div>
              {health.status === 'GREEN' && (
                <div className="inline-block px-3 py-1 rounded bg-emerald-600 text-white">CAIA • GREEN MODE<br/><span className="text-xs">All systems passing 150-logic checks.</span></div>
              )}
              {health.status === 'AMBER' && (
                <div className="inline-block px-3 py-1 rounded bg-yellow-600 text-black">CAIA • ATTENTION<br/><span className="text-xs">Review logs and Cassandra notes.</span></div>
              )}
              {health.status === 'RED' && (
                <div className="inline-block px-3 py-1 rounded bg-red-600 text-white">CAIA • PAUSED<br/><span className="text-xs">Something failed. Check nightly sweep + health.</span></div>
              )}
              {health.status === 'CHECKING' && (
                <div className="inline-block px-3 py-1 rounded bg-slate-700 text-slate-200">CAIA • CHECKING…</div>
              )}
            </div>
            <div>
              <SilBadge domain={health?.sil?.silDomain} certainty={health?.sil?.silCertainty} />
            </div>
          </div>
        </div>
      )}
      {/* Green Confidence Meter + SIL grouping */}
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4">
          <SilBadge domain={health?.sil?.silDomain} certainty={health?.sil?.silCertainty} />
          <GreenConfidenceMeter health={health} />
          <div className="pt-2">
            <SystemBuilderBadge system={health?.systemBuilderLife ?? health?.systemBuilder ?? null} />
          </div>
        </div>
      </section>
      {/* State bar */}
      {health && (
        <div className="w-full mb-4">
          <div className="flex gap-3 items-center">
            <div className="text-xs text-slate-300">CAIA Health:</div>
            <div className="text-sm font-semibold">{health.status}</div>
            <div className="text-xs text-slate-400">Mood: {health?.mood ?? 'N/A'}</div>
            <div className="text-xs text-slate-400">Last sweep: {new Date((health?.lastNightly?.lastStart) || health?.generatedAt || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      )}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Life OS Corridor
        </h1>
        <p className="text-sm text-slate-300">
          Choose where you are — Home, Work, or Business.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {doors.map((d) => (
          <Link
            key={d.href}
            href={d.href as any}
            className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 transition hover:border-sky-400 hover:bg-slate-900"
          >
            <div className="text-lg font-medium">{d.label}</div>
            <div className="mt-1 text-xs text-slate-300">{d.subtitle}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}