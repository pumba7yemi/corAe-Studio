// apps/studio/app/business/oms/onboarding/sla-escalation/page.tsx
"use client";

import { useEffect, useState } from "react";

type SLA = {
  bookingCommit_hours: number;
  activeDelay_minutes: number;
  reportingUpload_hours: number;
  reportingSignoff_hours: number;
  invoiceRaise_hours: number;
};

type EscalationLevel = { after_minutes: number; notifyRoles: string[] };

export default function OmsSlaEscalationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sla, setSla] = useState<SLA>({
    bookingCommit_hours: 4,
    activeDelay_minutes: 30,
    reportingUpload_hours: 12,
    reportingSignoff_hours: 24,
    invoiceRaise_hours: 24,
  });
  const [levels, setLevels] = useState<EscalationLevel[]>([
    { after_minutes: 30, notifyRoles: ["OperationsManager"] },
    { after_minutes: 120, notifyRoles: ["FinanceManager"] },
    { after_minutes: 360, notifyRoles: ["Owner"] },
  ]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/business/oms/sla");
        if (r.ok) {
          const data = await r.json();
          if (data?.sla) setSla(data.sla);
          if (data?.escalation?.levels) setLevels(data.escalation.levels);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updateLevel(i: number, patch: Partial<EscalationLevel>) {
    setLevels((prev) => prev.map((lv, idx) => (idx === i ? { ...lv, ...patch } : lv)));
  }

  function addLevel() {
    setLevels((prev) => [...prev, { after_minutes: 60, notifyRoles: ["OperationsManager"] }]);
  }

  function removeLevel(i: number) {
    setLevels((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save(goNext = false) {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/business/oms/sla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sla, escalation: { levels } }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Failed to save");
      setMsg("Saved âœ“");
      if (goNext) location.href = "/business/oms/onboarding";
    } catch (e: any) {
      setMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm opacity-70">Loading SLA & Escalationâ€¦</div>
      </div>
    );
  }

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <h1 className="text-3xl font-semibold">SLA & Escalation</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Define operational SLAs and who gets notified at each delay threshold.
        </p>

        {/* SLA */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold">Service Level Agreements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Booking Commit (hours)"
              value={sla.bookingCommit_hours}
              onChange={(v) => setSla({ ...sla, bookingCommit_hours: v })}
            />
            <Field
              label="Active Delay (minutes)"
              value={sla.activeDelay_minutes}
              onChange={(v) => setSla({ ...sla, activeDelay_minutes: v })}
            />
            <Field
              label="Reporting Upload (hours)"
              value={sla.reportingUpload_hours}
              onChange={(v) => setSla({ ...sla, reportingUpload_hours: v })}
            />
            <Field
              label="Reporting Signoff (hours)"
              value={sla.reportingSignoff_hours}
              onChange={(v) => setSla({ ...sla, reportingSignoff_hours: v })}
            />
            <Field
              label="Invoice Raise (hours)"
              value={sla.invoiceRaise_hours}
              onChange={(v) => setSla({ ...sla, invoiceRaise_hours: v })}
            />
          </div>
        </div>

        {/* Escalation */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Escalation Levels</h2>
            <button
              onClick={addLevel}
              className="rounded-xl border border-zinc-700 bg-zinc-950 hover:bg-zinc-900 px-3 py-1.5 text-sm"
            >
              + Add Level
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {levels.map((lv, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">After (minutes)</label>
                    <input
                      type="number"
                      value={lv.after_minutes}
                      onChange={(e) => updateLevel(i, { after_minutes: Number(e.target.value || 0) })}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Notify Roles (comma-separated)</label>
                    <input
                      value={lv.notifyRoles.join(", ")}
                      onChange={(e) =>
                        updateLevel(i, {
                          notifyRoles: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
                      placeholder="OperationsManager, FinanceManager"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => removeLevel(i)}
                    className="text-xs rounded-lg border border-red-800 bg-red-950/30 hover:bg-red-900/30 px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {levels.length === 0 && (
              <div className="text-sm text-zinc-400">No levels. Add at least one escalation step.</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-xl border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 px-4 py-2 text-sm"
          >
            {saving ? "Savingâ€¦" : "Save"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="rounded-xl border border-emerald-700 bg-emerald-950/30 hover:bg-emerald-900/30 px-4 py-2 text-sm"
          >
            {saving ? "Savingâ€¦" : "Save & Continue"}
          </button>
          <a
            href="/business/oms/onboarding"
            className="rounded-xl border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 px-4 py-2 text-sm"
          >
            â† Back
          </a>
        </div>

        {msg && <div className="mt-4 text-sm text-zinc-300">{msg}</div>}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
      />
    </div>
  );
}
