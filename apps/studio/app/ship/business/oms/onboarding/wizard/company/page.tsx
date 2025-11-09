"use client";
import { useState } from "react";

export default function CompanyWizardPage() {
  const [form, setForm] = useState({
    legalName: "",
    jurisdiction: "",
    activities: "",
    addTenant: true,
    tenant: { slug: "", brandName: "", domain: "", themeJson: "" },
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function bind(path: string) {
    return {
      value: path.split(".").reduce((v, k) => (v as any)[k], form as any) ?? "",
      onChange: (e: any) => {
        const parts = path.split(".");
        setForm((s: any) => {
          const copy = structuredClone(s);
          let cur = copy;
          for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
          cur[parts[parts.length - 1]] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
          return copy;
        });
      },
    };
  }

  async function submit() {
    setSaving(true); setError(null);
    try {
      const payload: any = {
        legalName: form.legalName,
        jurisdiction: form.jurisdiction,
        activities: form.activities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
      if (form.addTenant) {
        payload.tenant = {
          slug: form.tenant.slug,
          brandName: form.tenant.brandName,
          domain: form.tenant.domain || undefined,
          theme: form.tenant.themeJson ? JSON.parse(form.tenant.themeJson) : {},
        };
      }
      const res = await fetch("/api/company/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setDone(j.companyId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Company & White-Label Wizard</h1>
      <div className="grid gap-3">
        <input className="border p-2 rounded" placeholder="Legal name *" {...bind("legalName")} />
        <input className="border p-2 rounded" placeholder="Jurisdiction *" {...bind("jurisdiction")} />
        <input className="border p-2 rounded" placeholder="Activities (comma separated)" {...bind("activities")} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...bind("addTenant")} /> Add white-label tenant
        </label>

        {form.addTenant && (
          <div className="rounded border p-3 grid gap-2">
            <input className="border p-2 rounded" placeholder="Tenant slug *" {...bind("tenant.slug")} />
            <input className="border p-2 rounded" placeholder="Brand name *" {...bind("tenant.brandName")} />
            <input className="border p-2 rounded" placeholder="Domain (optional)" {...bind("tenant.domain")} />
            <textarea className="border p-2 rounded" placeholder='Theme JSON (e.g., {"logoUrl": "..."} )' {...bind("tenant.themeJson")} />
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded bg-black text-white">
          {saving ? "Saving…" : "Save & Continue"}
        </button>
        {done && <span className="text-green-700">Company saved: {done}</span>}
        {error && <span className="text-red-700">{error}</span>}
      </div>

      <p className="text-xs opacity-70">
        This creates your Company. If enabled, it also creates/updates a White-Label Tenant and links it.
      </p>
    </div>
  );
}