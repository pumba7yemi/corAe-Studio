"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, DollarSign, PackageSearch, ClipboardList,
  ShieldCheck, Bell, AlertTriangle, Send, ChevronLeft, ChevronRight
} from "lucide-react";

/* ───────────────────────────────
   Small helpers shared with DTD
─────────────────────────────── */
type StripCell = { iso: string; label: string; week: "W1" | "W2" | "W3" | "W4" };

function span28(anchorISO: string): StripCell[] {
  const anchor = new Date(anchorISO);
  const cells: StripCell[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(anchor.getTime() + i * 86400000);
    const day = d.getDate().toString().padStart(2, "0");
    const wk = i <= 6 ? "W1" : i <= 13 ? "W2" : i <= 20 ? "W3" : "W4";
    cells.push({
      iso: d.toISOString().slice(0, 10),
      label: `${d.toLocaleDateString(undefined, { weekday: "short" })} ${day}`,
      week: wk,
    });
  }
  return cells;
}

/* ───────────────────────────────
   Pulse page (DTD styling)
─────────────────────────────── */
export default function PulsePage() {
  const [anchorISO, setAnchorISO] = useState(() => {
    const s = new Date(); s.setHours(0, 0, 0, 0); return s.toISOString();
  });
  const strip = useMemo(() => span28(anchorISO), [anchorISO]);

  // demo/live bits (safe fallbacks)
  const [pnl, setPnl] = useState<{ revenue?: number; gross?: number; net?: number } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/finance/pnl").then(r => r.ok ? r.json() : null).catch(() => null);
        setPnl(r?.pnl ?? null);
      } catch {}
    })();
  }, []);
  const niceDate = useMemo(() => new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  }), []);

  const kpis = [
    { icon: <DollarSign className="w-4 h-4" />, label: "Sales Today (AED)", value: pnl?.revenue != null ? Intl.NumberFormat().format(pnl.revenue) : "128,450", delta: "+6.2%" },
    { icon: <DollarSign className="w-4 h-4" />, label: "Cash Position (AED)", value: pnl?.net ?? "—", delta: pnl?.net != null ? (pnl.net < 0 ? `–${Intl.NumberFormat().format(Math.abs(pnl.net))} need` : "+OK") : "–6,200 need" },
    { icon: <ClipboardList className="w-4 h-4" />, label: "POs Due Today", value: "2", delta: "" },
    { icon: <PackageSearch className="w-4 h-4" />, label: "Stock Alerts", value: "3", delta: "" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "Compliance Due", value: "1", delta: "" },
  ];

  const commsInbox = [
    { id: "i1", from: "PepsiCo", channel: "WhatsApp", subject: "Price confirm for Sat", time: "09:12" },
    { id: "i2", from: "Iffco (Igloo)", channel: "Email", subject: "Stock availability", time: "09:05" },
    { id: "i3", from: "Bismillah", channel: "CIMS", subject: "ETA update", time: "08:58" },
  ];
  const commsSignals = [
    { id: "s1", level: "critical" as const, text: "PepsiCo +4% variance (Pricelock breach)", time: "09:10" },
    { id: "s2", level: "warn" as const,     text: "Chiller temp check due by 10:00",        time: "08:40" },
  ];
  const focusTop3 = [
    { id: "f1", text: "Send vendor messages with Pricelock clause" },
    { id: "f2", text: "Finalise BDOs; confirm delivery slots" },
    { id: "f3", text: "Assign expiry sweep to floor team" },
  ];

  return (
    <div className="space-y-6">
      {/* Header (identical style to DTD) */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              corAe&nbsp;Pulse<span className="text-xs align-super">™</span>
            </span>
          </h1>
        </div>

        {/* mini-nav controls like DTD strip */}
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-3 py-2 rounded-md border border-slate-600 hover:bg-slate-800"
            onClick={() => setAnchorISO(new Date(new Date(anchorISO).getTime() - 28 * 86400000).toISOString())}
            title="Prev 28"
          >
            <ChevronLeft className="inline-block w-4 h-4 -mt-0.5" /> Prev
          </button>
          <button
            className="text-xs px-3 py-2 rounded-md border border-slate-600 hover:bg-slate-800"
            onClick={() => { const s=new Date(); s.setHours(0,0,0,0); setAnchorISO(s.toISOString()); }}
            title="Today"
          >
            Today
          </button>
          <button
            className="text-xs px-3 py-2 rounded-md border border-slate-600 hover:bg-slate-800"
            onClick={() => setAnchorISO(new Date(new Date(anchorISO).getTime() + 28 * 86400000).toISOString())}
            title="Next 28"
          >
            Next <ChevronRight className="inline-block w-4 h-4 -mt-0.5" />
          </button>
          <span className="ml-2 text-xs text-slate-400 hidden sm:inline">{niceDate}</span>
        </div>
      </header>

      {/* KPI / CAIA brief (DTD card look) */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
        <div className="flex flex-col gap-3">
          <div className="text-sm md:text-base">
            <strong>CAIA:</strong>{" "}
            {pnl
              ? `Revenue AED ${Intl.NumberFormat().format(pnl.revenue!)}; Gross AED ${Intl.NumberFormat().format(pnl.gross!)}; Net AED ${Intl.NumberFormat().format(pnl.net!)}.`
              : `Today cash tight by AED 6.2k; PepsiCo PO due; 2 expiry alerts.`}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">{k.icon}{k.label}</div>
                <div className="text-lg font-semibold">{k.value}</div>
                {k.delta && <div className="text-xs text-slate-500">{k.delta}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 28-day strip (same component/skin as DTD) */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm text-slate-300">28-Day Cadence</div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px] grid grid-cols-28 gap-1 px-3 pb-3">
            {strip.map((c, i) => (
              <div key={c.iso} className="rounded-md border border-slate-700/60 bg-slate-800/60 p-2 text-[10px]" title={c.iso}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-[9px] px-1 rounded bg-slate-700">{c.week}</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-700 overflow-hidden">
                  <div className="h-2 bg-emerald-500" style={{ width: `${(i % 5) * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two columns like your Pulse content but in DTD cards */}
      <section className="grid lg:grid-cols-3 gap-3">
        {/* Left / Actions */}
        <div className="lg:col-span-2 space-y-3">
          {/* Top 3 focus */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40">
            <div className="px-4 py-2 border-b border-slate-700 font-semibold">3³DTD — Work Focus (Top 3)</div>
            <div className="p-3 space-y-2">
              {focusTop3.map((f) => (
                <label key={f.id} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span className="text-sm">{f.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* End-of-stand-up */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40">
            <div className="px-4 py-2 border-b border-slate-700 font-semibold">End of Stand-Up (30 seconds)</div>
            <div className="p-3 grid sm:grid-cols-3 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" /> Vendor msgs sent?</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> POs funded?</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Expiries assigned?</label>
              <div className="sm:col-span-3">
                <button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-sm mt-1">
                  <Send className="inline-block w-4 h-4 mr-2 -mt-0.5" />
                  Publish WhatsApp Updates
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Comms */}
        <div className="space-y-3">
          {/* ALL COMMS */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40">
            <div className="px-4 py-2 border-b border-slate-700 font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" /> ALL COMMS
            </div>
            <div className="p-3 space-y-2">
              {commsInbox.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-2">
                  <div className="text-sm"><strong>{m.from}</strong> · {m.channel} — {m.subject}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded px-2 py-0.5 bg-slate-700">{m.time}</span>
                    <button className="text-xs rounded-md border border-slate-600 px-2 py-1 hover:bg-slate-800">Reply</button>
                    <button className="text-xs rounded-md border border-slate-600 px-2 py-1 hover:bg-slate-800">Done</button>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-700 my-2" />
              {commsSignals.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl border p-2 ${
                    s.level === "critical" ? "border-rose-300 bg-rose-900/20" : "border-amber-300 bg-amber-900/10"
                  }`}
                >
                  <div className="text-sm flex items-center gap-2">
                    {s.level === "critical" ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    {s.text}
                  </div>
                  <span className="text-xs rounded px-2 py-0.5 bg-slate-700">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}