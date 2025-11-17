// apps/studio/app/ship/business/onboarding/start-company/page.tsx
"use client";

import { useState } from "react";

export default function StartCompanyWizardPage() {
  const [companyName, setCompanyName] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ship/business/start-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, ownerUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start company");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-xl px-6 pt-16 pb-32">
        <h1 className="text-3xl font-semibold mb-3">🏁 Start Company</h1>
        <p className="text-sm text-zinc-400 mb-8">
          Create a new company record, enable its modules, and initiate the OBARI automation workflow.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Company Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Owner User ID</label>
            <input
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
              placeholder="Enter owner user ID"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 px-4 py-2 text-sm"
          >
            {loading ? "Creating…" : "Create Company"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-400 border border-red-800 bg-red-950/30 rounded-xl p-3">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="mt-6 border border-emerald-800 bg-emerald-950/30 rounded-xl p-4 text-sm space-y-1">
            <div className="font-semibold text-emerald-400">✅ Company Created Successfully</div>
            <div>Company ID: {result.companyId}</div>
            <div>Workflow Instance ID: {result.instanceId}</div>
          </div>
        )}

        <div className="mt-10">
          <a
            href="/ship/business/onboarding"
            className="inline-block rounded-xl border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 px-4 py-2 text-sm"
          >
            ← Back to Business Onboarding
          </a>
        </div>
      </div>
    </div>
  );
}