"use client";

/**
 * OBARI — Reporting (Stage 5)
 * Displays reports generated from Active stage (ACT_* → REP_*).
 */

import { useEffect, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav"; // ✅ alias (never breaks)

type ReportRecord = {
  report_id: string;
  source_active_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  status: "draft" | "final";
  variance?: { reason?: string; delta_minor?: number };
  compliance?: { ok: boolean; missing?: string[] };
  totals: { subtotal: number; lines: number };
  generated_at_iso: string;
  updated_at_iso: string;
  notes?: string;
};

export default function ObariReportPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/ship/business/oms/obari/report", { cache: "no-store" });
      const j = await r.json();
      if (j.ok) setReports(j.items || []);
      else throw new Error(j.error || "Load failed");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed to load reports"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 space-y-6 flex flex-col min-h-screen">
      {/* ───────────── HEADER ───────────── */}
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Reporting</h1>
        <p className="muted">
          Variance, compliance, GRV, expiry, and notes summary for completed jobs.
        </p>
      </header>

      {/* ───────────── LIST ───────────── */}
      <section className="c-card p-4 flex-1">
        {loading ? (
          <div className="small text-slate-400">Loading reports…</div>
        ) : reports.length === 0 ? (
          <div className="small text-slate-500">No reports generated yet.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.report_id}
                className="border border-slate-700 rounded-xl p-3 bg-slate-900/40"
              >
                <div className="font-mono text-slate-200">
                  {r.order_numbers.so_no || r.order_numbers.po_no || "—"}
                </div>
                <div className="text-slate-400 text-xs">
                  {r.direction.toUpperCase()} • {r.status.toUpperCase()} •{" "}
                  {new Date(r.generated_at_iso).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Counterparty: {r.parties.counterparty_name}
                </div>
                <div className="text-xs text-slate-400">
                  Variance:{" "}
                  {r.variance?.delta_minor
                    ? `${r.variance.delta_minor / 100} (${r.variance.reason ?? ""})`
                    : "—"}
                </div>
                <div className="text-xs text-slate-400">
                  Compliance:{" "}
                  {r.compliance
                    ? r.compliance.ok
                      ? "✅ OK"
                      : `⚠ Missing: ${r.compliance.missing?.join(", ")}`
                    : "—"}
                </div>
                <div className="text-xs text-slate-500">
                  Notes: {r.notes ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {msg && <div className="small text-red-500">{msg}</div>}

      {/* ───────────── NAVIGATION ARROWS ───────────── */}
      <footer className="pt-4 mt-auto">
        <ArrowNav
          backHref="/ship/business/oms/obari/active"
          nextHref="/ship/business/oms/obari/invoice"
        >
          Stage 5 — Reporting
        </ArrowNav>
      </footer>
    </main>
  );
}