"use client";

/**
 * OBARI — Invoicing (Stage 6)
 * Generates and manages invoices following Reporting stage.
 */
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/components/ui/button";
import ArrowNav from "@/components/navigation/ArrowNav"; // ✅ alias (never breaks)

export default function ObariInvoicingPage() {
  return (
    <main className="p-6 space-y-6 flex flex-col min-h-screen">
      {/* ───────────── HEADER ───────────── */}
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Invoicing</h1>
        <p className="muted">Invoice generation and financial reconciliation module.</p>
      </header>

      {/* ───────────── BODY / CONTENT ───────────── */}
      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Card className="c-card">
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Invoice Starter</h2>
            <p className="text-sm text-muted">This page was scaffolded by CAIA Dev Agent.</p>

            <div className="row">
              <Button variant="default">Generate Invoice</Button>
              <Button variant="outline">View Records</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ───────────── NAVIGATION ARROWS ───────────── */}
      <footer className="pt-4 mt-auto">
        <ArrowNav
          backHref="/ship/business/oms/obari/report"
          nextHref="/ship/business/oms/obari/finalized"
        >
          ← Back to Reporting · Stage 6 — Invoice · To Finalized →
        </ArrowNav>
      </footer>
    </main>
  );
}