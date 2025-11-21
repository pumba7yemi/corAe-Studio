import React from "react";
import { getMockPulseSnapshot } from "@corae/pulse-core-v2";
import { PulseTile } from "./PulseTile";
import { PulseTimeline } from "./PulseTimeline";

export async function PulseShell() {
  const snapshot = getMockPulseSnapshot();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-wide text-slate-400 uppercase">corAe • Business OS</div>
            <h1 className="text-2xl font-semibold">corAe Pulse™</h1>
            <div className="text-xs text-slate-500 mt-1">
              {snapshot.businessTitle} • As of {new Date(snapshot.asOf).toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-400">CAIA • LIVE</div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {snapshot.metrics.map((m) => (
            <PulseTile key={m.id} metric={m} />
          ))}
        </section>

        <PulseTimeline items={snapshot.timeline} />
      </div>
    </div>
  );
}

export default PulseShell;
