// apps/studio/app/work/onboarding/wizard/partners/page.tsx
"use client";

/**
 * corAe â€¢ Work â€¢ Onboarding â€¢ Workflow Partners Wizard
 * Purpose:
 *   - Quickly add or edit Workflow Partnersâ„¢ during onboarding.
 *   - Writes directly to /api/work/partners (bulkUpsert)
 */

import React, { useState } from "react";

type Partner = {
  id: string;
  role: string;
  contact?: string;
  isExternal?: boolean;
  departmentId?: string;
  active: boolean;
};

export default function PartnersOnboardingWizardPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [role, setRole] = useState("");
  const [contact, setContact] = useState("");
  const [isExternal, setIsExternal] = useState(false);

  function addPartner() {
    if (!role.trim()) return;
    const newPartner: Partner = {
      id: "wp_" + Math.random().toString(36).slice(2, 10),
      role: role.trim(),
      contact: contact.trim(),
      isExternal,
      active: true,
    };
    setPartners((x) => [...x, newPartner]);
    setRole("");
    setContact("");
    setIsExternal(false);
  }

  async function savePartners() {
    await fetch("/api/work/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulkUpsert", items: partners }),
    });
    alert("Partners saved successfully.");
  }

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-2xl font-semibold">Workflow Partners Wizard</h1>
      <p className="text-sm text-zinc-400 mb-6">Define or import your Workflow Partnersâ„¢</p>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            placeholder="Role (e.g., Technician, QA)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact (email/phone)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isExternal}
              onChange={(e) => setIsExternal(e.target.checked)}
            />{" "}
            External Partner
          </label>
        </div>
        <button
          onClick={addPartner}
          className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
        >
          + Add Partner
        </button>

        {partners.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {partners.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs"
              >
                {p.role} {p.isExternal && "(external)"}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={savePartners}
            disabled={partners.length === 0}
            className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
