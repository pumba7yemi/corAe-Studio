"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Use shared UI components where possible. Keep tiny local adapters to
// remain compatible with the existing page API (variant values etc.).
import { Card as SharedCard, Button as SharedButton } from "@/lib/ui/components";
import ArrowNav from "@/components/navigation/ArrowNav";

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  // Shared Card accepts className and renders children — keep usage similar
  <SharedCard className={className ?? ""} {...(props as any)}>{children}</SharedCard>
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={["p-4 space-y-4", className ?? ""].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
);

// Local adapter to map existing variant values (default|outline) to the
// shared Button's variant scheme (primary|secondary|ghost).
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "primary" }
> = ({ variant = "default", className, children, ...props }) => {
  const mapped = variant === "outline" ? "secondary" : "primary";
  return (
    <SharedButton variant={(mapped as any)} className={className ?? ""} {...(props as any)}>
      {children}
    </SharedButton>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={["w-full border rounded-lg p-2 bg-slate-950", className ?? ""].filter(Boolean).join(" ")} {...props} />
);

const Separator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={["my-3 border-slate-700 h-px w-full", className ?? ""].filter(Boolean).join(" ")} role="separator" {...props} />
);

// CAIA/OBARI bridge (adjust path to your package if needed)
import {
  initialState as makeInitial,
  persistDraft,
  submitFirstTrade,
} from "@corae/workfocus-core/wizard/first-trade.flow";

type FirstTradeState = ReturnType<typeof makeInitial>;
type StepId = "party" | "schedule" | "transport" | "lines" | "notes" | "review";

const moneyToMajor = (v: number | string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const moneyToMinor = (v: number | string) => Math.round(moneyToMajor(v) * 100);

export default function FirstTradeWizardPage() {
  const router = useRouter();
  const [state, setState] = useState<FirstTradeState>(() => makeInitial());
  const [step, setStep] = useState<StepId>("party");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // autosave draft
  useEffect(() => {
    persistDraft(state);
  }, [state]);

  // computed validation
  const okParty =
    ((state as any).counterparty?.name?.trim()?.length ?? 0) > 0 &&
    ((state as any).companyMode === "procurement" ||
      (state as any).companyMode === "sales");

  const okLines =
    Array.isArray((state as any).lines) &&
    (state as any).lines.length > 0 &&
    (state as any).lines.every(
      (l: any) =>
        String(l.sku || "").trim().length > 0 &&
        Number(l.qty || 0) > 0 &&
        Number(moneyToMinor(l.unitPriceMajor ?? l.unitPrice ?? 0)) >= 0
    );

  const okSchedule =
    !!(state as any).schedule?.kind &&
    ((state as any).schedule.kind === "ad_hoc" || !!(state as any).schedule?.rule);

  const okTransport =
    (state as any).transport?.mode === "vendor" ||
    (state as any).transport?.mode === "third_party" ||
    (state as any).transport?.mode === "client";

  const canSubmit = okParty && okLines && okSchedule && okTransport;

  // simple step flow
  const order: StepId[] = ["party", "schedule", "transport", "lines", "notes", "review"];
  const go = (dir: 1 | -1) => {
    const i = order.indexOf(step);
    const n = Math.min(order.length - 1, Math.max(0, i + dir));
    setStep(order[n]);
  };

  async function onSubmit() {
    if (!canSubmit) {
      setMsg("Please complete required steps (Party, Schedule, Transport, Lines).");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const snapshot = await submitFirstTrade(state);
      setMsg(
        `✅ Staged successfully • ${
          (snapshot as any).direction === "inbound"
            ? (snapshot as any).order_numbers.po_no
            : (snapshot as any).order_numbers.so_no
        }`
      );
      // Optionally navigate:
      // router.push("/ship/business/oms/obari/thedeal/bdo/bdo-ready");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed to stage order"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">First Trade — Wizard</h1>
        <p className="text-slate-400">
          CAIA-guided setup that seeds OBARI Staging and kicks off your Brokered-Deal Order.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Stepper header */}
          <div className="flex flex-wrap items-center gap-2">
            {order.map((id) => (
              <button
                key={id}
                className={[
                  "px-3 py-1.5 rounded-full border",
                  step === id ? "bg-slate-800 border-sky-600 text-sky-200" : "bg-slate-900 border-slate-700",
                ].join(" ")}
                onClick={() => setStep(id)}
              >
                {labelFor(id)}
              </button>
            ))}
          </div>

          <Separator />

          {/* Step bodies */}
          {step === "party" && <PartyStep state={state} onChange={setState} />}
          {step === "schedule" && <ScheduleStep state={state} onChange={setState} />}
          {step === "transport" && <TransportStep state={state} onChange={setState} />}
          {step === "lines" && <LinesStep state={state} onChange={setState} />}
          {step === "notes" && <NotesStep state={state} onChange={setState} />}
          {step === "review" && <ReviewStep state={state} />}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">{msg ? msg : "Draft autosaves locally."}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => go(-1)} disabled={step === order[0]}>
                ← Back
              </Button>
              {step !== "review" ? (
                <Button onClick={() => go(1)}>Next →</Button>
              ) : (
                <Button onClick={onSubmit} disabled={!canSubmit || busy}>
                  {busy ? "Submitting…" : "Submit to OBARI"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms"
        nextHref="/ship/business/oms/obari/thedeal/bdo/bdo-ready"
        nextLabel="BDO Ready"
      >
        Wizard
      </ArrowNav>
    </main>
  );
}

function labelFor(id: StepId) {
  switch (id) {
    case "party":
      return "Party";
    case "schedule":
      return "Schedule";
    case "transport":
      return "Transport";
    case "lines":
      return "Lines";
    case "notes":
      return "Notes";
    case "review":
      return "Review";
  }
}

function PartyStep({ state, onChange }: { state: any; onChange: (s: any) => void }) {
  const cp = state.counterparty || { name: "" };
  return (
    <div className="space-y-2">
      <label className="block text-sm">Counterparty name</label>
      <Input
        value={cp.name ?? ""}
        onChange={(e) => onChange({ ...state, counterparty: { ...cp, name: e.target.value } })}
        placeholder="Acme Trading Co"
      />

      <label className="block text-sm">Company mode</label>
      <div className="flex gap-2">
        <Button
          variant={state.companyMode === "procurement" ? undefined : "outline"}
          onClick={() => onChange({ ...state, companyMode: "procurement" })}
        >
          Procurement
        </Button>
        <Button
          variant={state.companyMode === "sales" ? undefined : "outline"}
          onClick={() => onChange({ ...state, companyMode: "sales" })}
        >
          Sales
        </Button>
      </div>
    </div>
  );
}

function ScheduleStep({ state, onChange }: { state: any; onChange: (s: any) => void }) {
  const schedule = state.schedule || { kind: "ad_hoc", rule: "" };
  return (
    <div className="space-y-2">
      <label className="block text-sm">Schedule kind</label>
      <div className="flex gap-2">
        <Button variant={schedule.kind === "ad_hoc" ? undefined : "outline"} onClick={() => onChange({ ...state, schedule: { ...schedule, kind: "ad_hoc" } })}>
          Ad-hoc
        </Button>
        <Button variant={schedule.kind === "rule" ? undefined : "outline"} onClick={() => onChange({ ...state, schedule: { ...schedule, kind: "rule" } })}>
          Rule
        </Button>
      </div>
      {schedule.kind === "rule" && (
        <div>
          <label className="block text-sm">Rule</label>
          <Input value={schedule.rule ?? ""} onChange={(e) => onChange({ ...state, schedule: { ...schedule, rule: e.target.value } })} />
        </div>
      )}
    </div>
  );
}

function TransportStep({ state, onChange }: { state: any; onChange: (s: any) => void }) {
  const t = state.transport || { mode: "vendor" };
  return (
    <div className="space-y-2">
      <label className="block text-sm">Transport mode</label>
      <div className="flex gap-2">
        {[
          ["vendor", "Vendor"],
          ["third_party", "Third Party"],
          ["client", "Client"],
        ].map(([val, label]) => (
          <Button key={String(val)} variant={t.mode === val ? undefined : "outline"} onClick={() => onChange({ ...state, transport: { ...t, mode: val } })}>
            {String(label)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function LinesStep({ state, onChange }: { state: any; onChange: (s: any) => void }) {
  const lines: any[] = Array.isArray(state.lines) ? state.lines : [];
  function updateLine(idx: number, patch: any) {
    const next = [...lines];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange({ ...state, lines: next });
  }
  function addLine() {
    onChange({ ...state, lines: [...lines, { sku: "", qty: 1, unitPriceMajor: 0 }] });
  }
  function removeLine(i: number) {
    const next = lines.filter((_, idx) => idx !== i);
    onChange({ ...state, lines: next });
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-5" value={l.sku ?? ""} placeholder="SKU" onChange={(e) => updateLine(i, { sku: e.target.value })} />
            <Input className="col-span-3" value={String(l.qty ?? 0)} type="number" onChange={(e) => updateLine(i, { qty: Number(e.target.value) })} />
            <Input className="col-span-3" value={String(l.unitPriceMajor ?? 0)} onChange={(e) => updateLine(i, { unitPriceMajor: Number(e.target.value) })} />
            <Button className="col-span-1" variant="outline" onClick={() => removeLine(i)}>Del</Button>
          </div>
        ))}
      </div>
      <div>
        <Button onClick={addLine}>Add line</Button>
      </div>
    </div>
  );
}

function NotesStep({ state, onChange }: { state: any; onChange: (s: any) => void }) {
  const notes = state.notes ?? "";
  return (
    <div>
      <label className="block text-sm">Notes</label>
      <textarea
        className="w-full p-2 rounded bg-slate-950"
        value={notes}
        onChange={(e) => onChange({ ...state, notes: e.target.value })}
      />
    </div>
  );
}

function ReviewStep({ state }: { state: any }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Review</h3>
      <pre className="text-xs bg-slate-900 p-2 rounded">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

