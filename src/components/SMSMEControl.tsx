"use client";

import { useState } from "react";
import SMSMEChooser from "@/components/SMSMEChooser";   // 👈 add this here

export default function SMSMEControl() {
  const [status, setStatus] = useState<string>("");

  async function runDefault() {
    setStatus("Running default SMSME...");
    const res = await fetch("/api/smsme/run", { method: "POST" });
    const data = await res.json();
    if (data.ok) setStatus(`✅ Completed (${data.steps} steps)`);
    else setStatus(`❌ ${data.error}`);
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-base font-semibold">SchemaMind / SMSME</h2>

      {/* 👇 This is your new upload + run panel */}
      <SMSMEChooser />

      {/* 👇 Optional default run button for built-in old/new examples */}
      <button
        onClick={runDefault}
        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
      >
        Run Default SMSME
      </button>

      {status && (
        <div className="text-xs text-slate-700 bg-slate-50 border p-2 rounded-lg">
          {status}
        </div>
      )}
    </div>
  );
}