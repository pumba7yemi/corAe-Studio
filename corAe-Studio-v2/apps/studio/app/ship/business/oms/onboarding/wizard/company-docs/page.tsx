"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type DocItem = {
  category: string;
  type: string;
  url: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  visibility?: "INTERNAL" | "PUBLIC" | "REGULATOR";
};

export default function CompanyDocsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [categories, setCategories] = useState(["TRADE", "INSURANCE", "TAX", "BANK", "COMPLIANCE"]);

  useEffect(() => {
    // Derive companyId from the browser URL (avoid next/navigation hook which
    // requires a Suspense boundary during prerender). This keeps the page
    // a client-only component and avoids prerender-time errors.
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      setCompanyId(qs.get("companyId"));
    }
    if (!companyId) return;
    (async () => {
      try {
        const res = await fetch(`/api/company/documentation?companyId=${companyId}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load");
        setDocs(data.documents || []);
      } catch (e: any) {
        setMsg(`⚠️ Load failed: ${e?.message}`);
      }
    })();
  }, [companyId]);

  async function save() {
    if (!companyId) {
      setMsg("❌ companyId missing in URL");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/company/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          documents: docs,
          replaceCategories: [], // you can push ["TRADE"] etc if doing full overwrite
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Save failed");
      setMsg(`✅ Saved ${data.upserted} docs.`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${inter.variable} max-w-3xl mx-auto p-6 space-y-6`}>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Company Documentation</h1>
        <button className="btnGhost" onClick={() => router.push("/ship/business/oms/onboarding/wizard")}>← Back to Wizard</button>
      </header>

      {msg && <p className="text-sm">{msg}</p>}

      <div className="space-y-4">
        {docs.map((d, i) => (
          <div key={i} className="border rounded-xl p-3 space-y-2 bg-white shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className="inp"
                value={d.category}
                onChange={(e) => updateDoc(i, { category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
                <option value="">Other</option>
              </select>
              <input
                className="inp"
                placeholder="Type (e.g., Trade Licence, Insurance Cert)"
                value={d.type}
                onChange={(e) => updateDoc(i, { type: e.target.value })}
              />
            </div>
            <input
              className="inp"
              placeholder="Document URL"
              value={d.url}
              onChange={(e) => updateDoc(i, { url: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="inp"
                placeholder="Issued At (YYYY-MM-DD)"
                value={d.issuedAt || ""}
                onChange={(e) => updateDoc(i, { issuedAt: e.target.value })}
              />
              <input
                className="inp"
                placeholder="Expires At (YYYY-MM-DD)"
                value={d.expiresAt || ""}
                onChange={(e) => updateDoc(i, { expiresAt: e.target.value })}
              />
            </div>
            <input
              className="inp"
              placeholder="Notes"
              value={d.notes || ""}
              onChange={(e) => updateDoc(i, { notes: e.target.value })}
            />
            <select
              className="inp"
              value={d.visibility || "INTERNAL"}
              onChange={(e) => updateDoc(i, { visibility: e.target.value as any })}
            >
              <option value="INTERNAL">INTERNAL</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="REGULATOR">REGULATOR</option>
            </select>
            <div className="flex justify-end">
              <button className="text-xs text-red-600" onClick={() => removeDoc(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button className="btnGhost" onClick={addDoc}>+ Add Document</button>
        <button disabled={busy} className="btn" onClick={save}>
          {busy ? "Saving..." : "Save All"}
        </button>
      </div>

      <style jsx global>{`
        .inp { width:100%; border:1px solid #e5e7eb; border-radius:.75rem; padding:.6rem .8rem; }
        .btn { background:#111; color:white; padding:.6rem 1.1rem; border-radius:.75rem; font-weight:500; }
        .btnGhost { background:#f4f4f5; padding:.6rem 1rem; border-radius:.75rem; }
      `}</style>
    </div>
  );

  function addDoc() {
    setDocs([...docs, { category: "TRADE", type: "", url: "" }]);
  }
  function removeDoc(i: number) {
    setDocs(docs.filter((_, idx) => idx !== i));
  }
  function updateDoc(i: number, patch: Partial<DocItem>) {
    setDocs((arr) => arr.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
}