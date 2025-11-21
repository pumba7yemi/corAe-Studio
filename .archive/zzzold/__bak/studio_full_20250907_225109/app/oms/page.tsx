// apps/studio/app/oms/page.tsx
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

type StageKey = "orders" | "booking" | "active" | "reporting" | "invoicing";
const OBARI_STAGES: { key: StageKey; label: string; hint: string }[] = [
  { key: "orders",    label: "Order",     hint: "Accepted quotes / POs" },
  { key: "booking",   label: "Booking",   hint: "Scheduled, vendor/date lock" },
  { key: "active",    label: "Active",    hint: "In progress / on site" },
  { key: "reporting", label: "Reporting", hint: "Work reports, confirmations" },
  { key: "invoicing", label: "Invoicing", hint: "Bills raised / AP/AR" },
];

function pjoin(parts: string) {
  return path.join(process.cwd(), ...parts.split("/"));
}

function ensure(dir: string) {
  const p = pjoin(dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  return p;
}

function count(dir: string) {
  const p = ensure(dir);
  return fs.readdirSync(p).filter((f) => f.endsWith(".json")).length;
}

function listRecent(dir: string, limit = 5) {
  const p = ensure(dir);
  const files = fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, m: fs.statSync(path.join(p, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)
    .slice(0, limit)
    .map((x) => x.f);
  return files;
}

export default function OMSPage() {
  // OBARI is managed by OMS; stages live under data/oms/obari/*
  const obari = OBARI_STAGES.map((s) => {
    const dir = `data/oms/obari/${s.key}`;
    return {
      ...s,
      count: count(dir),
      recent: listRecent(dir, 3),
    };
  });

  // Operations & Finance live under OMS too
  const opsDir = "data/oms/operations";     // e.g., ops jobs / dispatch / confirmations
  const finDir = "data/oms/finance";        // e.g., AP/AR docs, reconciliations
  const opsCount = count(opsDir);
  const finCount = count(finDir);
  const opsRecent = listRecent(opsDir, 5);
  const finRecent = listRecent(finDir, 5);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">OMS — OBARI + Operations + Finance</h1>
        <p className="text-sm text-gray-600">
          OMS manages OBARI. OBARI manages the weekly pipeline (Order → Booking → Active → Reporting → Invoicing).
          Operations & Finance run hand-in-hand under OMS. corAe Comms™ consumes snippets/feeds from here.
        </p>
      </header>

      {/* OBARI stages */}
      <section className="space-y-3">
        <div className="text-sm font-medium">OBARI Stages (Source-of-Truth)</div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {obari.map((s) => (
            <div key={s.key} className="border rounded-xl bg-white p-4">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-semibold">{s.count}</div>
              <div className="mt-2 text-[11px] text-gray-500">{s.hint}</div>
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-700">Recent</div>
                {s.recent.length === 0 ? (
                  <div className="text-xs text-gray-400">None</div>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {s.recent.map((name) => (
                      <li key={name} className="text-xs text-gray-700 truncate">
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operations & Finance panels */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Operations</div>
              <div className="text-xs text-gray-500">
                Dispatch, confirmations, site reports (feeds Reporting/Active).
              </div>
            </div>
            <div className="text-xl font-semibold">{opsCount}</div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700">Recent</div>
            {opsRecent.length === 0 ? (
              <div className="text-xs text-gray-400">None</div>
            ) : (
              <ul className="mt-1 space-y-1">
                {opsRecent.map((name) => (
                  <li key={name} className="text-xs text-gray-700 truncate">
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Finance</div>
              <div className="text-xs text-gray-500">
                AP/AR, reconciliations, invoicing confirmations (feeds Invoicing).
              </div>
            </div>
            <div className="text-xl font-semibold">{finCount}</div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700">Recent</div>
            {finRecent.length === 0 ? (
              <div className="text-xs text-gray-400">None</div>
            ) : (
              <ul className="mt-1 space-y-1">
                {finRecent.map((name) => (
                  <li key={name} className="text-xs text-gray-700 truncate">
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Cross-link back to Comms */}
      <section className="border rounded-xl bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">corAe Comms™ Feed</div>
            <p className="text-xs text-gray-500">
              Drafts & messages generated from OMS events (Booking confirmations, Reporting summaries, Invoicing notices).
            </p>
          </div>
          <a href="/comms" className="text-xs underline hover:text-black">
            Open corAe Comms™
          </a>
        </div>
      </section>
    </div>
  );
}