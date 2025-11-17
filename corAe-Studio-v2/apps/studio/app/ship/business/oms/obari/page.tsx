"use client";

/**
 * OBARI — Order (Engine View)
 * - Wraps the dynamic Orders engine in the OBARI flow frame.
 * - Back: Booking · Next: Active
 *
 * NOTE:
 *  - No external aliases besides "@/components/obari/EventsStore" and ArrowNav.
 *  - Self-contained state via localStorage keys:
 *      - "corae.orders.page.v1" (engine store)
 *      - "corae.stock" (demo stock)
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav";
import { useEvents, makeEvent } from "@/components/obari/EventsStore";

/* ---------------- types ---------------- */
type ObariStage = "OPEN" | "BUILD" | "APPROVE" | "RUN" | "INSPECT";
type Gate = "start" | "stop";
type Script = {
  id: string;
  name: string;
  vendor: string;
  sku: string;
  cycleDays: number; // usually 28
  startDate: string; // ISO
  reorderPoint: number;
  orderQty: number;
  guards: Array<{ gate: Gate; rule: string }>;
};

type Cycle = {
  day: number;
  stage: ObariStage;
  nextGate: Gate | null;
  orderId: string;
  log: string[];
};

type Store = {
  script: Script | null;
  cycles: Cycle[];
  activeOrder?: string | null;
  virtualToday: string;
};

/* --------------- utils --------------- */
const LS_KEY = "corae.orders.page.v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const fmt = (d: string | number | Date) =>
  new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function uid(prefix = "w") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function save(store: Store) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}
function load(): Store | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Store) : null;
  } catch {
    return null;
  }
}

/* --------------- “CAIA” parser --------------- */
function parseScript(raw: string): Script {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const dict = Object.fromEntries(
    lines.map((l) => {
      const i = l.indexOf(":");
      const k = l.slice(0, i).trim();
      const v = l.slice(i + 1).trim();
      return [k, v];
    })
  );

  const guards: Script["guards"] = [];
  if (dict["guard.start"]) guards.push({ gate: "start", rule: dict["guard.start"] });
  if (dict["guard.stop"]) guards.push({ gate: "stop", rule: dict["guard.stop"] });

  return {
    id: dict["id"] ?? uid("wf"),
    name: dict["name"] ?? "Order Flow",
    vendor: dict["vendor"] ?? "Demo Partner",
    sku: dict["sku"] ?? "SKU-001",
    cycleDays: Number(dict["cycleDays"] ?? 28),
    startDate: new Date(dict["startDate"] ?? Date.now()).toISOString(),
    reorderPoint: Number(dict["reorderPoint"] ?? 60),
    orderQty: Number(dict["orderQty"] ?? 120),
    guards,
  };
}

/* --------------- engine helpers --------------- */
function computeStage(day: number, cycleDays: number): ObariStage {
  const q = cycleDays / 4;
  if (day < Math.ceil(q * 1)) return "OPEN";
  if (day < Math.ceil(q * 2)) return "BUILD";
  if (day < Math.ceil(q * 3)) return "APPROVE";
  if (day < Math.ceil(q * 4) - 2) return "RUN";
  return "INSPECT";
}

function evaluateGate(g: Gate, ctx: { stock: number; priceOK: boolean }): boolean {
  if (g === "start") return ctx.stock < 1 || ctx.priceOK; // demo rule
  return ctx.stock > 1 || !ctx.priceOK; // demo rule
}

function seedStore(): Store {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return {
    script: null,
    cycles: [],
    activeOrder: null,
    virtualToday: start.toISOString(),
  };
}

/* --------------- page --------------- */
export default function ObariOrderPage() {
  const { publish } = useEvents();
  const [store, setStore] = useState<Store>(() => load() ?? seedStore());
  const [rawScript, setRawScript] = useState<string>(() =>
    [
      `# corAe Order Script`,
      `id: ${uid("wf")}`,
      `name: Weekly Vendor Auto-Replenish`,
      `vendor: Demo Partner`,
      `sku: SKU-PEPSI-500`,
      `cycleDays: 28`,
      `startDate: ${new Date().toISOString()}`,
      `reorderPoint: 60`,
      `orderQty: 120`,
      `guard.start: withinCeiling && budgetOk`,
      `guard.stop: overCeiling || riskAlert`,
    ].join("\n")
  );

  const [running, setRunning] = useState(false);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const paceMs = 800;

  function start() {
    if (!store.script) return;
    if (tickRef.current) clearInterval(tickRef.current as any);
    setRunning(true);
    tickRef.current = setInterval(() => advanceOneDay(), paceMs) as any;
  }
  function stop() {
    setRunning(false);
    if (tickRef.current) clearInterval(tickRef.current as any);
    tickRef.current = null;
  }

  function advanceOneDay() {
    setStore((prev) => {
      if (!prev.script) return prev;
      const today = new Date(prev.virtualToday).getTime() + DAY_MS;
      const cycleDays = prev.script.cycleDays;
      const baseDayIndex = Math.floor(
        (today - new Date(prev.script.startDate).getTime()) / DAY_MS
      );
      const dayInCycle = ((baseDayIndex % cycleDays) + cycleDays) % cycleDays;

      const stage = computeStage(dayInCycle, cycleDays);
      const nextGate: Gate | null =
        stage === "OPEN" ? "start" : stage === "INSPECT" ? "stop" : null;

      // demo stock movement
      let stockShift = 0;
      if (stage === "RUN") stockShift = -12;
      if (nextGate === "stop") stockShift = +prev.script.orderQty;

      const logEntry =
        `${fmt(today)} • Day ${String(dayInCycle + 1).padStart(2, "0")}/${cycleDays} • ${stage}` +
        (nextGate ? ` • gate:${nextGate}` : "");

      const cycles = [...prev.cycles];
      let current = cycles[cycles.length - 1];
      const prevStage = current?.stage;

      if (!current || dayInCycle === 0) {
        current = {
          day: dayInCycle,
          stage,
          nextGate,
          orderId: uid("ord"),
          log: [logEntry],
        };
        cycles.push(current);
      } else {
        current.day = dayInCycle;
        current.stage = stage;
        current.nextGate = nextGate;
        current.log.push(logEntry);
      }

      let activeOrder = prev.activeOrder ?? null;
      let stock = Number(localStorage.getItem("corae.stock") ?? "250");
      stock = Math.max(0, stock + stockShift);

      /* START gate -> emit ORDERS + BOOKING */
      if (nextGate === "start") {
        const canStart = evaluateGate("start", { stock, priceOK: true });
        if (canStart && !activeOrder) {
          activeOrder = current.orderId;
          current.log.push(
            `→ START ok • order ${activeOrder} placed (${prev.script.orderQty})`
          );

          publish(
            makeEvent({
              id: activeOrder,
              workflowId: prev.script.id,
              stage: "ORDERS",
              status: "placed",
              vendor: prev.script.vendor,
              sku: prev.script.sku,
              qty: prev.script.orderQty,
              note: "Order placed",
            })
          );
          publish(
            makeEvent({
              id: activeOrder,
              workflowId: prev.script.id,
              stage: "BOOKING",
              status: "confirmed",
              note: "Vendor confirmed",
            })
          );
        } else {
          current.log.push(`→ START blocked • conditions not met`);
        }
      }

      /* Entering RUN -> emit ACTIVE */
      if (stage === "RUN" && prevStage !== "RUN" && activeOrder) {
        publish(
          makeEvent({
            id: activeOrder,
            workflowId: prev.script.id,
            stage: "ACTIVE",
            status: "running",
            note: "Order executing",
          })
        );
      }

      /* STOP gate -> emit REPORTING + INVOICING */
      if (nextGate === "stop") {
        const canStop = evaluateGate("stop", { stock, priceOK: true });
        if (canStop && activeOrder) {
          current.log.push(
            `→ STOP ok • order ${activeOrder} received (+${prev.script.orderQty})`
          );

          publish(
            makeEvent({
              id: activeOrder,
              workflowId: prev.script.id,
              stage: "REPORTING",
              status: "closing",
              note: "Compiling report",
            })
          );
          publish(
            makeEvent({
              id: activeOrder,
              workflowId: prev.script.id,
              stage: "INVOICING",
              status: "invoiced",
              note: "Invoice issued",
            })
          );

          activeOrder = null;
        } else {
          current.log.push(`→ STOP skipped • no active order`);
        }
      }

      localStorage.setItem("corae.stock", String(stock));
      const next: Store = {
        ...prev,
        cycles,
        activeOrder,
        virtualToday: new Date(today).toISOString(),
      };
      save(next);
      return next;
    });
  }

  function activateFromScript() {
    const sc = parseScript(rawScript);
    const start = new Date(sc.startDate);
    start.setHours(0, 0, 0, 0);
    const fresh: Store = {
      script: sc,
      cycles: [],
      activeOrder: null,
      virtualToday: start.toISOString(),
    };
    save(fresh);
    setStore(fresh);
  }

  useEffect(() => {
    return () => stop();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Order</h1>
        <p className="muted">Dynamic engine that advances a 28-day cycle and emits lifecycle events.</p>
      </header>

      {/* Form + Script */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold mb-2">Order Form</h3>
          <Wizard raw={rawScript} onChange={setRawScript} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold mb-2">Order Script (CAIA-readable)</h3>
          <textarea
            className="w-full h-[260px] text-sm font-mono border rounded-lg p-3"
            value={rawScript}
            onChange={(e) => setRawScript(e.target.value)}
          />
          <div className="text-xs text-slate-500 mt-2">
            CAIA parses this into a plan. The engine advances daily and emits lifecycle
            events.
          </div>
        </div>
      </section>

      {/* Live */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-semibold">Live</h3>
          {store.script && (
            <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-50">
              {store.script.name} • {store.script.vendor} • {store.script.sku}
            </span>
          )}
          <span className="text-xs text-slate-500 ml-auto">
            {store.virtualToday ? fmt(store.virtualToday) : ""}
          </span>
        </div>

        {store.script ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Status</div>
              <div className="mt-1 text-[15px]">
                {store.cycles.length
                  ? `${store.cycles[store.cycles.length - 1].stage} • Day ${
                      store.cycles[store.cycles.length - 1].day + 1
                    }/${store.script.cycleDays}`
                  : "Pending"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Active order: {store.activeOrder ? store.activeOrder : "—"}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Gates</div>
              <ul className="mt-2 text-sm">
                {store.script.guards.map((g, i) => (
                  <li key={i} className="py-1">
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-50 mr-2">
                      {g.gate.toUpperCase()}
                    </span>
                    {g.rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Schedule</div>
              <div className="text-sm mt-1">Start: {fmt(store.script.startDate)}</div>
              <div className="text-sm">Cycle: {store.script.cycleDays} days</div>
              <div className="text-sm">Reorder Pt: {store.script.reorderPoint}</div>
              <div className="text-sm">Order Qty: {store.script.orderQty}</div>
            </div>

            <div className="md:col-span-3 rounded-xl border p-3">
              <div className="text-sm font-medium mb-1">Event Log</div>
              <div className="h-[240px] overflow-auto text-sm bg-slate-50 rounded-lg p-3">
                {store.cycles.flatMap((c, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="text-xs text-slate-500">Order {c.orderId}</div>
                    <ul className="list-disc ml-5">
                      {c.log.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!store.cycles.length && (
                  <div className="text-slate-500">
                    No activity yet. Click ▶️ Start Loop.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Activate a script to begin.</div>
        )}
      </section>

      <section className="flex items-center justify-between">
        <div className="row gap-2">
          <button
            className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
            onClick={activateFromScript}
          >
            📜 Activate Script
          </button>
          {!running ? (
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
              onClick={start}
              disabled={!store.script}
            >
              ▶️ Start Loop
            </button>
          ) : (
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
              onClick={stop}
            >
              ⏸️ Pause
            </button>
          )}
        </div>

        <ArrowNav
          backHref="/ship/business"
          nextHref="/ship/business/oms/obari/thedeal/bdo/bdo-ready"
          nextLabel="To BDO-Ready"
        >
          Order Hub
        </ArrowNav>
      </section>
    </main>
  );
}

/* --------------- “Order Form” (was Wizard) --------------- */
function Wizard({
  raw,
  onChange,
}: {
  raw: string;
  onChange: (s: string) => void;
}) {
  const s = useMemo(() => parseScript(raw), [raw]);
  function patch(partial: Partial<Script>) {
    const next = { ...s, ...partial };
    const body = [
      `# corAe Order Script`,
      `id: ${next.id}`,
      `name: ${next.name}`,
      `vendor: ${next.vendor}`,
      `sku: ${next.sku}`,
      `cycleDays: ${next.cycleDays}`,
      `startDate: ${next.startDate}`,
      `reorderPoint: ${next.reorderPoint}`,
      `orderQty: ${next.orderQty}`,
      `guard.start: ${
        next.guards.find((g) => g.gate === "start")?.rule ??
        "withinCeiling && budgetOk"
      }`,
      `guard.stop: ${
        next.guards.find((g) => g.gate === "stop")?.rule ??
        "overCeiling || riskAlert"
      }`,
    ].join("\n");
    onChange(body);
  }

  return (
    <form className="grid gap-2 text-sm" onSubmit={(e) => e.preventDefault()}>
      <Field label="Name" value={s.name} onChange={(v) => patch({ name: v })} />
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Vendor"
          value={s.vendor}
          onChange={(v) => patch({ vendor: v })}
        />
        <Field label="SKU" value={s.sku} onChange={(v) => patch({ sku: v })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Cycle Days"
          type="number"
          value={String(s.cycleDays)}
          onChange={(v) => patch({ cycleDays: Number(v) || 28 })}
        />
        <Field
          label="Start Date"
          type="date"
          value={s.startDate.slice(0, 10)}
          onChange={(v) => patch({ startDate: new Date(v).toISOString() })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Reorder Point"
          type="number"
          value={String(s.reorderPoint)}
          onChange={(v) => patch({ reorderPoint: Number(v) || 60 })}
        />
        <Field
          label="Order Qty"
          type="number"
          value={String(s.orderQty)}
          onChange={(v) => patch({ orderQty: Number(v) || 120 })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Guard • start"
          value={
            s.guards.find((g) => g.gate === "start")?.rule ??
            "withinCeiling && budgetOk"
          }
          onChange={(v) =>
            patch({
              guards: [
                { gate: "start", rule: v },
                {
                  gate: "stop",
                  rule:
                    s.guards.find((g) => g.gate === "stop")?.rule ??
                    "overCeiling || riskAlert",
                },
              ],
            })
          }
        />
        <Field
          label="Guard • stop"
          value={
            s.guards.find((g) => g.gate === "stop")?.rule ??
            "overCeiling || riskAlert"
          }
          onChange={(v) =>
            patch({
              guards: [
                {
                  gate: "start",
                  rule:
                    s.guards.find((g) => g.gate === "start")?.rule ??
                    "withinCeiling && budgetOk",
                },
                { gate: "stop", rule: v },
              ],
            })
          }
        />
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-slate-600">{label}</span>
      <input
        className="border rounded-lg px-3 py-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}