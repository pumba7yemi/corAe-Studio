// apps/studio/app/ship/registry/page.tsx
"use client";

import { useEffect } from "react";
import {
  useShips,
  useActiveShip,
  useActiveScope,
  bindToastsSetter,
  toastsAtom,
  pushToast,
} from "@/app/lib/ship/store";
import { useAtom } from "jotai";

export default function ShipRegistryPage() {
  const [ships, setShips] = useShips();
  const [activeShipId, setActiveShipId] = useActiveShip();
  const [scope, setScope] = useActiveScope();
  const [toasts, setToasts] = useAtom(toastsAtom);

  useEffect(() => {
    bindToastsSetter(setToasts);
  }, [setToasts]);

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Ship Registry</h1>
          <div className="flex items-center gap-3">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            >
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
              <option value="BUSINESS">Business</option>
            </select>
            <button
              onClick={() => pushToast("Ship registry loaded", scope)}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm"
            >
              Test Toast
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ships.map((s) => {
            const isActive = s.id === activeShipId;
            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 ${
                  isActive ? "border-indigo-500 bg-indigo-950/20" : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{s.name}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {s.kind} • {s.env} • {s.version}
                    </div>
                  </div>
                  <div className="text-xs">
                    {s.status === "ready" && <span className="text-green-400">● Ready</span>}
                    {s.status === "outdated" && <span className="text-yellow-400">● Outdated</span>}
                    {s.status === "failed" && <span className="text-red-400">● Failed</span>}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveShipId(s.id)}
                    className={`rounded-lg px-3 py-2 text-sm border ${
                      isActive
                        ? "bg-indigo-600 border-indigo-500 hover:bg-indigo-500"
                        : "bg-zinc-950 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    {isActive ? "Active" : "Set Active"}
                  </button>
                  <button
                    onClick={() =>
                      pushToast(
                        `Rebuild requested for ${s.name} (${s.version})`,
                        scope
                      )
                    }
                    className="rounded-lg px-3 py-2 text-sm border bg-zinc-950 border-zinc-800 hover:bg-zinc-800"
                  >
                    Queue Rebuild
                  </button>
                </div>

                <div className="mt-3 text-xs text-zinc-500">
                  Last build: {s.lastBuildId ?? "—"} · {s.lastBuildAt ?? "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">Recent</h2>
          <div className="space-y-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm"
              >
                <div>{t.text}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {new Date(t.ts).toLocaleString()} · {t.scope}
                </div>
              </div>
            ))}
            {!toasts.length && (
              <div className="text-xs text-zinc-500">No recent events.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}