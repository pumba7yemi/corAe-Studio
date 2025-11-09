"use client";

import { useState } from "react";

export default function HRWizardPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleTitle: "",
    status: "APPLICANT",
    hiredAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/hr/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      setDone(json.employee?.code || "OK");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function bind<K extends keyof typeof form>(k: K) {
    return {
      value: form[k] ?? "",
      onChange: (e: any) => setForm((s) => ({ ...s, [k]: e.target.value })),
    };
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">HR Wizard — Pre-First-Trade</h1>
      <p className="text-sm opacity-80">
        Create your first Employee. This will also write a Chronological entry and open a draft Appraisal (90-day probation).
      </p>

      <div className="grid grid-cols-1 gap-4">
        <input className="border p-2 rounded" placeholder="First name *" {...bind("firstName")} />
        <input className="border p-2 rounded" placeholder="Last name *" {...bind("lastName")} />
        <input className="border p-2 rounded" placeholder="Email" {...bind("email")} />
        <input className="border p-2 rounded" placeholder="Phone" {...bind("phone")} />
        <input className="border p-2 rounded" placeholder="Role title *" {...bind("roleTitle")} />
        <select className="border p-2 rounded" {...bind("status")}>
          <option value="APPLICANT">APPLICANT</option>
          <option value="PROBATION">PROBATION</option>
          <option value="ACTIVE">ACTIVE</option>
        </select>
        <input className="border p-2 rounded" type="date" {...bind("hiredAt")} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Create & Seed Appraisal"}
        </button>
        {done && <span className="text-green-700">Saved: {done}</span>}
        {error && <span className="text-red-700">Error: {error}</span>}
      </div>

      <div className="text-xs opacity-70">
        On submit: Employee → Chrono log (HR) → Draft Appraisal (90 days).
      </div>
    </div>
  );
}