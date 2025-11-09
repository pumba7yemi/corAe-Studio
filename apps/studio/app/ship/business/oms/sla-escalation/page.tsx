// apps/studio/app/ship/business/oms/sla-escalation/page.tsx
"use client"; // remove if you want this to be a server component (no hooks)

import React, { useState } from "react";

export default function SlaEscalationPage() {
  // Example local state to prove it’s a valid React component
  const [hours, setHours] = useState<number>(24);
  const [roles, setRoles] = useState<string>("Manager, Duty Lead");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">SLA • Escalation Policy</h1>
      <p className="text-sm text-zinc-500">
        Configure acceptance window and escalation roles.
      </p>

      <section className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-zinc-300">Acceptance window (hours)</div>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value || 0))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-zinc-300">
              Escalate to (comma-separated roles)
            </div>
            <input
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              placeholder="Manager, Duty Lead"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
          </label>
        </div>

        <div className="text-xs text-zinc-400">
          Preview: escalate to [
          {roles
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" • ")}
          ] after {hours}h
        </div>
      </section>
    </main>
  );
}