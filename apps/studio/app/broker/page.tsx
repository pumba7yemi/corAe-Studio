"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useEventsSafe as useEvents, makeEvent } from "@/components/obari/EventsStore";

/** Broker-the-Deal → produces BDOs (scheduled & ad-hoc) and lights up OMS */

type BTDO = {
  id: string;
  name: string;
  vendor: string;
  counterparty?: string;
  sku: string;
  qty: number;
  price?: number;
  marginPct?: number;
  commissionPct?: number;
  deliveryWindow?: string;
  terms?: string;
  reorderPoint?: number;
  guardStart?: string;
  guardStop?: string;
  schedule?: { days: number[] }; // 1..28
  note?: string;
};

type BDO = {
  id: string;
  templateId: string;
  workflowId: string;
  vendor: string;
  counterparty?: string;
  sku: string;
  qty: number;
  price?: number;
  marginPct?: number;
  commissionPct?: number;
  deliveryWindow?: string;
  terms?: string;
  dealType: "scheduled" | "ad-hoc";
  days: number[];
  active: boolean;
  note?: string;
  updatedAt: string;
};

const LS_TPL = "corae.btdo.v2";
const LS_BDO = "corae.bdo.v2";
const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const money = (n?: number) => (n ?? 0).toFixed(2);

function load<T>(k: string, fb: T): T {
  try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function save<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function BrokerPage() {
  const { publish } = useEvents();

  // one draft BTDO drives both outputs
  const [draft, setDraft] = useState<BTDO>(() => ({
    id: uid("tpl"),
    name: "Brokered Deal",
    vendor: "Demo Partner",
    counterparty: "Green Solutions",
    sku: "SKU-PEPSI-500",
    qty: 120,
    price: 3.25,
    marginPct: 8,
    commissionPct: 2,
    deliveryWindow: "Mon/Wed AM",
    terms: "NET 14 • FOB",
    reorderPoint: 60,
    guardStart: "withinCeiling && budgetOk",
    guardStop: "overCeiling || riskAlert",
    schedule: { days: [1, 8, 15, 22] },
    note: "Standing weekly brokered deal",
  }));

  // keep BDO/BTDO stores in sync with the rest of the app
  const [templates, setTemplates] = useState<BTDO[]>(() => load<BTDO[]>(LS_TPL, []));
  const [bdos, setBdos] = useState<BDO[]>(() => load<BDO[]>(LS_BDO, []));
  useEffect(() => save(LS_TPL, templates), [templates]);
  useEffect(() => save(LS_BDO, bdos), [bdos]);

  function upsertTemplate(t: BTDO) {
    setTemplates((p) => {
      const i = p.findIndex(x => x.id === t.id);
      const n = [...p]; i === -1 ? n.unshift(t) : (n[i] = t);
      return n;
    });
  }

  function stageBDO(type: "scheduled" | "ad-hoc"): BDO {
    const b: BDO = {
      id: uid("bdo"),
      templateId: draft.id,
      workflowId: uid("wf"),
      vendor: draft.vendor,
      counterparty: draft.counterparty,
      sku: draft.sku,
      qty: draft.qty,
      price: draft.price,
      marginPct: draft.marginPct,
      commissionPct: draft.commissionPct,
      deliveryWindow: draft.deliveryWindow,
      terms: draft.terms,
      dealType: type,
      days: type === "scheduled" ? (draft.schedule?.days ?? []) : [],
      active: type === "scheduled",
      note: draft.note,
      updatedAt: new Date().toISOString(),
    };
    setBdos((p) => [b, ...p]);
    return b;
  }

  /* ---- OMS emitters (same contract as OMS/EventsStore) ---- */
  const placed = (b: BDO, at = new Date(), note?: string) =>
    publish(makeEvent({
      id: b.id, workflowId: b.workflowId, stage: "ORDERS", status: "placed",
      vendor: b.vendor, sku: b.sku, qty: b.qty,
      note: note ?? `€${money(b.price)} • Margin ${b.marginPct ?? 0}% • Comm ${b.commissionPct ?? 0}%`,
      at: at.toISOString()
    }));
  const booking = (b: BDO, at = new Date(), note = "Broker confirmed") =>
    publish(makeEvent({ id: b.id, workflowId: b.workflowId, stage: "BOOKING", status: "confirmed", note, at: at.toISOString() }));
  const active  = (b: BDO, at = new Date(), note = "Deal running") =>
    publish(makeEvent({ id: b.id, workflowId: b.workflowId, stage: "ACTIVE", status: "running", note, at: at.toISOString() }));
  const report  = (b: BDO, at = new Date(), note = "Closing report") =>
    publish(makeEvent({ id: b.id, workflowId: b.workflowId, stage: "REPORTING", status: "closing", note, at: at.toISOString() }));
  const invoice = (b: BDO, at = new Date(), note = "Invoice issued") =>
    publish(makeEvent({ id: b.id, workflowId: b.workflowId, stage: "INVOICING", status: "invoiced", note, at: at.toISOString() }));

  /* ---- Actions ---- */
  function saveDeal() {
    upsertTemplate(draft); // keeps BTDO library
  }

  function createScheduled() {
    saveDeal();
    const b = stageBDO("scheduled");
    // Seed the 28-day placements + confirmations (engine or OMS can move it forward later)
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    (draft.schedule?.days ?? []).forEach(d => {
      const when = new Date(y, m, d);
      placed(b, when, "Standing placement");
      booking(b, when, "Standing confirmation");
    });
  }

  function createAdhocNow() {
    saveDeal();
    const b = stageBDO("ad-hoc");
    // Happy-path so the shopfloor sees it immediately
    placed(b);
    booking(b);
    active(b);
    report(b);
    invoice(b);
  }

  /* ---- UI ---- */
  return (
    <div className="min-h-[80vh] px-6 py-8">
      <header className="mb-4 flex items-center gap-3">
        <div className="h-7 w-7 rounded-xl bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 to-slate-600 text-white grid place-items-center shadow-sm">
          <span className="text-xs font-semibold tracking-tight">cA</span>
        </div>
        <h1 className="text-[28px] leading-8 font-semibold tracking-tight">Broker the Deal → Orders</h1>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50" onClick={saveDeal}>💾 Save Deal</button>
          <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50" onClick={createScheduled}>📅 Create Scheduled (28-day)</button>
          <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50" onClick={createAdhocNow}>⚡ Create Ad-hoc Now</button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold mb-2">Deal Parameters</h3>
        <form className="grid md:grid-cols-2 gap-3" onSubmit={(e) => e.preventDefault()}>
          <Field label="Deal Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="Counterparty (Buyer)" value={draft.counterparty ?? ""} onChange={(v) => setDraft({ ...draft, counterparty: v })} />
          <Field label="Vendor (Supplier)" value={draft.vendor} onChange={(v) => setDraft({ ...draft, vendor: v })} />
          <Field label="SKU" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} />
          <Field label="Qty" type="number" value={String(draft.qty)} onChange={(v) => setDraft({ ...draft, qty: Number(v) || 0 })} />
          <Field label="Price" type="number" step="0.01" value={String(draft.price ?? 0)} onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })} />
          <Field label="Margin %" type="number" value={String(draft.marginPct ?? 0)} onChange={(v) => setDraft({ ...draft, marginPct: Number(v) || 0 })} />
          <Field label="Commission %" type="number" value={String(draft.commissionPct ?? 0)} onChange={(v) => setDraft({ ...draft, commissionPct: Number(v) || 0 })} />
          <Field label="Delivery Window" value={draft.deliveryWindow ?? ""} onChange={(v) => setDraft({ ...draft, deliveryWindow: v })} />
          <Field label="Terms" value={draft.terms ?? ""} onChange={(v) => setDraft({ ...draft, terms: v })} />
          <Field label="Guard • start" value={draft.guardStart ?? ""} onChange={(v) => setDraft({ ...draft, guardStart: v })} />
          <Field label="Guard • stop" value={draft.guardStop ?? ""} onChange={(v) => setDraft({ ...draft, guardStop: v })} />
          <DaysPicker value={draft.schedule?.days ?? []} onChange={(days) => setDraft({ ...draft, schedule: { days } })} />
          <div className="md:col-span-2">
            <Field label="Note" value={draft.note ?? ""} onChange={(v) => setDraft({ ...draft, note: v })} />
          </div>
        </form>
      </section>
    </div>
  );
}

/* ---- primitives ---- */
function Field({
  label, value, onChange, type = "text", step,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; }) {
  return (
    <label className="grid gap-1">
      <span className="text-slate-600">{label}</span>
      <input className="border rounded-lg px-3 py-2 w-full" type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function DaysPicker({ value, onChange }: { value: number[]; onChange: (days: number[]) => void; }) {
  const set = useMemo(() => new Set(value), [value]);
  function toggle(d: number) {
    const n = new Set(set); n.has(d) ? n.delete(d) : n.add(d);
    onChange(Array.from(n).sort((a, b) => a - b));
  }
  return (
    <div className="grid gap-1">
      <span className="text-slate-600 text-sm">Schedule — 28-day (optional)</span>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <button key={d} onClick={(e) => { e.preventDefault(); toggle(d); }}
            className={["text-xs rounded-md border px-2 py-1", set.has(d) ? "bg-slate-900 text-white" : "hover:bg-slate-100"].join(" ")}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
