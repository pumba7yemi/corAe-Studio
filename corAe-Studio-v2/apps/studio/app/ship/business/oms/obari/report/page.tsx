"use client";

/**
 * OBARI â€” Reporting (Stage 5)
 * Displays reports generated from Active stage (ACT_* â†’ REP_*).
 */

import { useEffect, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav"; // âœ… alias (never breaks)

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
      const r = await fetch("/api/business/oms/obari/report", { cache: "no-store" });
      const j = await r.json();
      if (j.ok) setReports(j.items || []);
      else throw new Error(j.error || "Load failed");
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Failed to load reports"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 space-y-6 flex flex-col min-h-screen">
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI â€” Reporting</h1>
        <p className="muted">
          Variance, compliance, GRV, expiry, and notes summary for completed jobs.
        </p>
      </header>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="c-card p-4 flex-1">
        {loading ? (
          <div className="small text-slate-400">Loading reportsâ€¦</div>
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
                  {r.order_numbers.so_no || r.order_numbers.po_no || "â€”"}
                </div>
                <div className="text-slate-400 text-xs">
                  {r.direction.toUpperCase()} â€¢ {r.status.toUpperCase()} â€¢{" "}
                  {new Date(r.generated_at_iso).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Counterparty: {r.parties.counterparty_name}
                </div>
                <div className="text-xs text-slate-400">
                  Variance:{" "}
                  {r.variance?.delta_minor
                    ? `${r.variance.delta_minor / 100} (${r.variance.reason ?? ""})`
                    : "â€”"}
                </div>
                <div className="text-xs text-slate-400">
                  Compliance:{" "}
                  {r.compliance
                    ? r.compliance.ok
                      ? "âœ… OK"
                      : `âš  Missing: ${r.compliance.missing?.join(", ")}`
                    : "â€”"}
                </div>
                <div className="text-xs text-slate-500">
                  Notes: {r.notes ?? "â€”"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {msg && <div className="small text-red-500">{msg}</div>}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ NAVIGATION ARROWS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="pt-4 mt-auto">
        <ArrowNav
          backHref="/business/oms/obari/active"
          nextHref="/business/oms/obari/invoice"
        >
          Stage 5 â€” Reporting
        </ArrowNav>
      </footer>
    </main>
  );
}
