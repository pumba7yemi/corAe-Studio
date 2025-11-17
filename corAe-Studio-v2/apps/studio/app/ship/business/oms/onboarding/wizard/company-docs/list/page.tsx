"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type CompanyDoc = {
  id: string;
  category: string;
  type: string;
  url: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  visibility?: "INTERNAL" | "PUBLIC" | "REGULATOR" | null;
  createdAt?: string;
  updatedAt?: string;
};

type FilterMode = "all" | "expiring" | "expired";

export default function CompanyDocsListPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [docs, setDocs] = useState<CompanyDoc[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // UX controls
  const [filter, setFilter] = useState<FilterMode>("all");
  const [threshold, setThreshold] = useState<number>(30); // days

  useEffect(() => {
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      setCompanyId(qs.get("companyId"));
    }
    if (!companyId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/company/documentation?companyId=${companyId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load");
        setDocs(data.documents || []);
        setMsg(null);
      } catch (e: any) {
        setMsg(`⚠️ ${e?.message || "Error fetching docs"}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  // Derived stats
  const now = useMemo(() => new Date(), []);
  const enriched = useMemo(() => docs.map(d => ({ ...d, status: statusOf(d, now, threshold) })), [docs, now, threshold]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "expired": return enriched.filter(d => d.status.kind === "expired");
      case "expiring": return enriched.filter(d => d.status.kind === "expiring");
      default: return enriched;
    }
  }, [enriched, filter]);

  // Sort by risk first, then by expiry ascending, then category/type
  const sorted = useMemo(() => {
    const order = { expired: 0, expiring: 1, ok: 2 } as const;
    return filtered.slice().sort((a, b) => {
      const ak = order[a.status.kind], bk = order[b.status.kind];
      if (ak !== bk) return ak - bk;
      const ad = toDate(a.expiresAt), bd = toDate(b.expiresAt);
      if (ad && bd) return ad.getTime() - bd.getTime();
      if (ad && !bd) return -1;
      if (!ad && bd) return 1;
      // fallback
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.type.localeCompare(b.type);
    });
  }, [filtered]);

  const counts = useMemo(() => ({
    total: enriched.length,
    expired: enriched.filter(d => d.status.kind === "expired").length,
    expiring: enriched.filter(d => d.status.kind === "expiring").length,
    ok: enriched.filter(d => d.status.kind === "ok").length,
  }), [enriched]);

  function exportCsv() {
    const rows = [
      ["Category","Type","URL","Issued","Expires","Status","DaysRemaining","Visibility","Notes"],
      ...enriched.map(d => [
        d.category,
        d.type,
        d.url,
        safeDate(d.issuedAt),
        safeDate(d.expiresAt),
        d.status.label,
        String(d.status.daysRemaining ?? ""),
        d.visibility || "INTERNAL",
        (d.notes || "").replace(/\r?\n/g, " "),
      ])
    ];
    const csv = rows.map(r => r.map(cell => csvEscape(cell)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company-docs-${companyId || "unknown"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`${inter.variable} max-w-6xl mx-auto p-6 space-y-6`}>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Company Documents</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button className="btnGhost" onClick={() => router.push(`/ship/business/oms/onboarding/wizard/company-docs?companyId=${companyId}`)}>Edit</button>
          <button className="btnGhost" onClick={() => router.push("/ship/business/oms/onboarding/wizard")}>← Back to Wizard</button>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="chips">
          <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
            All <small className="ml-1 opacity-70">({counts.total})</small>
          </button>
          <button className={`chip ${filter === "expiring" ? "on" : ""}`} onClick={() => setFilter("expiring")}>
            Expiring ≤ {threshold}d <small className="ml-1 opacity-70">({counts.expiring})</small>
          </button>
          <button className={`chip ${filter === "expired" ? "on" : ""}`} onClick={() => setFilter("expired")}>
            Expired <small className="ml-1 opacity-70">({counts.expired})</small>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm opacity-70">Threshold</label>
          <select className="inp min-w-20" value={threshold} onChange={e => setThreshold(Number(e.target.value))}>
            {[7,14,30,60,90].map(d => <option key={d} value={d}>{d} days</option>)}
          </select>
          <button className="btnGhost" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      {msg && <p className="text-sm">{msg}</p>}
      {loading && <p className="text-sm opacity-70">Loading...</p>}

      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Issued</th>
              <th className="px-3 py-2">Expires</th>
              <th className="px-3 py-2">Visibility</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-3 py-3 text-center opacity-70">No documents found.</td>
              </tr>
            )}
            {sorted.map((d) => (
              <tr key={d.id} className={rowClass(d.status.kind)}>
                <td className="px-3 py-2">
                  <span className={`badge ${badgeClass(d.status.kind)}`} title={d.status.hint}>
                    {d.status.label}{typeof d.status.daysRemaining === "number" ? ` (${d.status.daysRemaining}d)` : ""}
                  </span>
                </td>
                <td className="px-3 py-2">{d.category}</td>
                <td className="px-3 py-2">{d.type}</td>
                <td className="px-3 py-2">
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{d.url}</a>
                </td>
                <td className="px-3 py-2">{safeDate(d.issuedAt)}</td>
                <td className="px-3 py-2">{safeDate(d.expiresAt)}</td>
                <td className="px-3 py-2">{d.visibility || "INTERNAL"}</td>
                <td className="px-3 py-2">{d.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .btnGhost { background:#f4f4f5; padding:.6rem 1rem; border-radius:.75rem; }
        .inp { width:auto; border:1px solid #e5e7eb; border-radius:.75rem; padding:.45rem .6rem; background:#fff; }
        .chips { display:flex; flex-wrap:wrap; gap:.5rem; }
        .chip { padding:.35rem .7rem; border:1px solid #e5e7eb; border-radius:9999px; background:#fff; font-size:.85rem; }
        .chip.on { background:#111; color:#fff; border-color:#111; }
        .badge { font-size:.7rem; padding:.2rem .5rem; border-radius:.5rem; border:1px solid #e5e7eb; }
        .badge.ok { background:#ecfdf5; border-color:#a7f3d0; }         /* soft green */
        .badge.expiring { background:#fffbeb; border-color:#fde68a; }   /* soft amber */
        .badge.expired { background:#fef2f2; border-color:#fecaca; }    /* soft red */
        .row-expiring { background: #fffdf5; }
        .row-expired { background: #fff7f7; }
        table { border-collapse:collapse; width:100%; }
        th, td { border-color:#e5e7eb; }
        th { font-weight:600; font-size:.85rem; }
        td { font-size:.85rem; }
      `}</style>
    </div>
  );

  /* ───────── helpers ───────── */

  function statusOf(d: CompanyDoc, today: Date, threshDays: number) {
    const exp = toDate(d.expiresAt);
    if (!exp) return { kind: "ok" as const, label: "No Expiry", hint: "No expiry date recorded", daysRemaining: undefined };
    const days = daysBetween(today, exp);
    if (days < 0) return { kind: "expired" as const, label: "Expired", hint: `Expired ${Math.abs(days)} day(s) ago`, daysRemaining: days };
    if (days <= threshDays) return { kind: "expiring" as const, label: "Expiring", hint: `Expires in ${days} day(s)`, daysRemaining: days };
    return { kind: "ok" as const, label: "OK", hint: `Expires in ${days} day(s)`, daysRemaining: days };
  }

  function rowClass(kind: "ok" | "expiring" | "expired") {
    if (kind === "expired") return "border-t row-expired";
    if (kind === "expiring") return "border-t row-expiring";
    return "border-t";
  }

  function badgeClass(kind: "ok" | "expiring" | "expired") {
    return kind;
  }

  function toDate(v?: string | null) {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  function daysBetween(a: Date, b: Date) {
    // normalize to midnight for stable results
    const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  function safeDate(v?: string | null) {
    const d = toDate(v);
    return d ? d.toISOString().split("T")[0] : "-";
  }

  function csvEscape(x: any) {
    const s = String(x ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
    }
}