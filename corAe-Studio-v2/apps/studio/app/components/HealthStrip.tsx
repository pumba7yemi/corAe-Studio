"use client";

import { useEffect, useState } from "react";

type Health = {
  ship?: "ok" | "down" | "unknown";
  morningExec?: "pass" | "fail" | "unknown";
  updates?: { available?: boolean; level?: string } | null;
  ts?: string;
};

export default function HealthStrip() {
  const [data, setData] = useState<Health | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        const j = (await r.json()) as Health;
        if (alive) setData(j);
      } catch {
        if (alive) setData(null);
      }
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const pill = (label: string, state?: string) => {
    const ok = state === "ok" || state === "pass";
    const bad = state === "down" || state === "fail";
    const cls = ok
      ? "bg-emerald-100 text-emerald-800"
      : bad
      ? "bg-rose-100 text-rose-800"
      : "bg-amber-100 text-amber-800";
    return (
      <span className={`rounded px-2 py-0.5 text-xs ${cls}`} key={label}>
        {label}
      </span>
    );
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-white/80 px-3 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-sm">
        <span className="font-semibold">CAIA active • Pulse Synced</span>
        <div className="mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
        {pill("Ship " + (data?.ship ?? "unknown"), data?.ship)}
        {pill("Exec " + (data?.morningExec ?? "unknown"), data?.morningExec)}
        {pill(
          data?.updates?.available ? "Updates available" : "Updates none",
          data?.updates?.available ? "down" : "pass"
        )}
        <div className="ml-auto text-xs text-neutral-500">
          {data?.ts ? new Date(data.ts).toLocaleTimeString() : "…"}
        </div>
      </div>
    </div>
  );
}
