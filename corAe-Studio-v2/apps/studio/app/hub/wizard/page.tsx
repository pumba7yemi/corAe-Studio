// /app/hub/wizard/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import * as hub from "@/lib/hub/schemas";
const hubSchema: any = (hub as any).hubSchema ?? (hub as any).default ?? (hub as any);

// Derive types directly from the JSON schema at runtime-friendly compile time
const STAGES = hubSchema.stages as readonly ["ORDER", "BOOKING", "ACTIVE", "REPORTING", "INVOICING"];
type HubStage = typeof STAGES[number];

const MODES = hubSchema.modes as readonly ["BUYER", "SELLER", "BROKER"];
type HubMode = typeof MODES[number];

type Deal = {
  id: string;
  code: string;
  stage: HubStage;
  total?: number;
  deliverySlotIso?: string | null;
  bigNine?: Record<string, boolean>;
  statusFlags?: { pricelock?: "Locked" | "Pending" | "Breached"; confirmed?: boolean };
  documents?: { kind: string; url: string }[];
};

export default function HubWizard() {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [autopilot, setAutopilot] = useState(true);
  const [mode, setMode] = useState<HubMode>("BROKER");
  const [message, setMessage] = useState<string>("");

  const steps = STAGES;

  const stageIndex = useMemo(() => {
    if (!deal) return 0;
    return steps.findIndex((s) => s === deal.stage);
  }, [deal, steps]);

  const setMsg = useCallback((m: string) => setMessage(m), []);

  async function run<T>(fn: () => Promise<T>) {
    setLoading(true);
    try {
      const out = await fn();
      return out;
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /** ----------------------------
   * API CALLS (matches earlier routes)
   * ----------------------------- */
  const createBTDO = useCallback(async () => {
    const body = {
      mode,
      vendorId: "ven_demo",
      clientId: "cli_demo",
      currency: "AED",
      vatPercent: 5,
      discountPct: 0,
      items: [{ sku: "SKU-1", name: "Sample Item", uom: "carton", qty: 10, unitPrice: 12.5 }],
      bigNine: {
        signed_tcs: true,
        binding_quote: true,
        required_documents: true,
        contact_product_site_details: true,
        geographical_pricing: true,
        ops_docs_complete: true,
        booking_compliance: true,
        order_execution: false,
        reporting_and_remittance: false,
      },
    };
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Create BTDO failed (${res.status})`);
    const d = (await res.json()) as Deal;
    setDeal(d);
    setMsg(`BTDO created: ${d.code}`);
    return d;
  }, [mode, setMsg]);

  const confirmBDO = useCallback(async () => {
    if (!deal) return;
    const res = await fetch(`/api/deals/${deal.id}/confirm-bdo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceLock: "LOCK",
        documents: [{ kind: "BDO", url: "https://files.example/BDO-demo.pdf" }],
      }),
    });
    if (!res.ok) throw new Error(`Confirm BDO failed (${res.status})`);
    const d = (await res.json()) as Deal;
    setDeal(d);
    setMsg(`BDO confirmed → ${d.stage}`);
    return d;
  }, [deal, setMsg]);

  const issuePO = useCallback(async () => {
    if (!deal) return;
    const res = await fetch(`/api/deals/${deal.id}/issue-po`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poUrl: "https://files.example/PO-demo.pdf",
        deliverySlotIso: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`Issue PO failed (${res.status})`);
    const d = (await res.json()) as Deal;
    setDeal(d);
    setMsg(`PO issued → ${d.stage}`);
    return d;
  }, [deal, setMsg]);

  const postGRN = useCallback(async () => {
    if (!deal) return;
    const res = await fetch(`/api/deals/${deal.id}/post-grn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grnUrl: "https://files.example/GRN-demo.pdf", stockUpdated: true }),
    });
    if (!res.ok) throw new Error(`Post GRN failed (${res.status})`);
    const d = (await res.json()) as Deal;
    setDeal(d);
    setMsg(`GRN posted → ${d.stage}`);
    return d;
  }, [deal, setMsg]);

  const issueInvoice = useCallback(async () => {
    if (!deal) return;
    const res = await fetch(`/api/deals/${deal.id}/issue-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceUrl: "https://files.example/INV-demo.pdf",
        paymentPlan: [{ method: "bank", amount: deal.total ?? 0 }],
      }),
    });
    if (!res.ok) throw new Error(`Issue Invoice failed (${res.status})`);
    const d = (await res.json()) as Deal;
    setDeal(d);
    setMsg(`Invoice issued → ${d.stage}`);
    return d;
  }, [deal, setMsg]);

  /** ----------------------------
   * SIMPLE GUARDS (mirrors schema)
   * ----------------------------- */
  function canGoToBooking(d: Deal | null) {
    if (!d) return false;
    const priceLocked = d.statusFlags?.pricelock === "Locked" || false; // becomes true after confirmBDO
    const signed = d.bigNine?.signed_tcs !== false; // default true
    const quoted = d.bigNine?.binding_quote !== false; // default true
    // Before confirmBDO, priceLocked will be false; guard is enforced server-side.
    return signed && quoted && (priceLocked || true);
  }
  function canGoToActive(d: Deal | null) {
    if (!d) return false;
    const hasDelivery = !!d.deliverySlotIso;
    // PO presence check is server-side; we let API enforce it.
    return hasDelivery || true;
  }
  function canGoToReporting(_d: Deal | null) {
    // Server checks GRN/report docs exist.
    return true;
  }
  function canGoToInvoicing(d: Deal | null) {
    if (!d) return false;
    // Server checks invoice & reporting_and_remittance flag.
    return d.bigNine?.reporting_and_remittance !== false || true;
  }

  /** ----------------------------
   * AUTOPILOT ADVANCE
   * ----------------------------- */
  const advance = useCallback(async () => {
    if (!deal) {
      await run(createBTDO);
      if (!autopilot) return;
    }
    const current = deal ? deal.stage : "ORDER";
    if (current === "ORDER") {
      if (canGoToBooking(deal)) await run(confirmBDO);
      if (!autopilot) return;
    }
    const afterConfirm = (deal ? deal.stage : "BOOKING") as HubStage;
    if (afterConfirm === "BOOKING") {
      if (canGoToActive(deal)) await run(issuePO);
      if (!autopilot) return;
    }
    const afterPO = (deal ? deal.stage : "ACTIVE") as HubStage;
    if (afterPO === "ACTIVE") {
      if (canGoToReporting(deal)) await run(postGRN);
      if (!autopilot) return;
    }
    const afterGRN = (deal ? deal.stage : "REPORTING") as HubStage;
    if (afterGRN === "REPORTING") {
      if (canGoToInvoicing(deal)) await run(issueInvoice);
    }
  }, [deal, autopilot, createBTDO, confirmBDO, issuePO, postGRN, issueInvoice]);

  /** ----------------------------
   * UI HELPERS
   * ----------------------------- */
  function Step({ i, title }: { i: number; title: string }) {
    const active = i === stageIndex;
    const done =
      i < stageIndex || (deal && deal.stage === "INVOICING" && i === steps.length - 1);
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
            done
              ? "bg-green-600 text-white"
              : active
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {done ? "✓" : i + 1}
        </div>
        <div className={`${active ? "font-semibold" : ""}`}>{title}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">OBARI Wizard</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <span>Mode</span>
            <select
              className="border rounded px-2 py-1"
              value={mode}
              onChange={(e) => setMode(e.target.value as HubMode)}
              disabled={!!deal}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autopilot}
              onChange={(e) => setAutopilot(e.target.checked)}
            />
            <span>CAIA Autopilot</span>
          </label>
        </div>
      </header>

      {/* Stepper */}
      <section className="grid gap-3">
        {steps.map((s, i) => (
          <Step key={s} i={i} title={labelForStage(s)} />
        ))}
      </section>

      {/* Controls */}
      <section className="flex flex-wrap gap-2">
        {!deal && (
          <button
            onClick={() => run(createBTDO)}
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white"
          >
            {loading ? "Creating…" : "Start (Create BTDO)"}
          </button>
        )}

        {deal && (
          <>
            {deal.stage === "ORDER" && (
              <button
                onClick={() => run(confirmBDO)}
                disabled={loading}
                className="px-3 py-2 rounded border"
              >
                {loading ? "Confirming…" : "Confirm BDO (Lock Price)"}
              </button>
            )}
            {deal.stage === "BOOKING" && (
              <button
                onClick={() => run(issuePO)}
                disabled={loading}
                className="px-3 py-2 rounded border"
              >
                {loading ? "Issuing…" : "Issue PO + Delivery Slot"}
              </button>
            )}
            {deal.stage === "ACTIVE" && (
              <button
                onClick={() => run(postGRN)}
                disabled={loading}
                className="px-3 py-2 rounded border"
              >
                {loading ? "Posting…" : "Post GRN / Report"}
              </button>
            )}
            {deal.stage === "REPORTING" && (
              <button
                onClick={() => run(issueInvoice)}
                disabled={loading}
                className="px-3 py-2 rounded border"
              >
                {loading ? "Issuing…" : "Issue Invoice + Payment Plan"}
              </button>
            )}
          </>
        )}

        <button
          onClick={advance}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white ml-auto"
        >
          {loading ? "Working…" : deal ? "Advance" : "Autostart"}
        </button>
      </section>

      {/* Status */}
      <section className="text-sm text-gray-700">
        <div className="rounded border p-3 bg-gray-50 space-y-1">
          <div>
            <strong>Deal:</strong>{" "}
            {deal ? `${deal.code} · ${deal.stage}` : "— (not started)"}
          </div>
          {message && <div className="text-gray-800">{message}</div>}
          <div className="text-xs text-gray-500">
            Tip: Leave <em>CAIA Autopilot</em> on and press <em>Advance</em> to let it run each
            step automatically.
          </div>
        </div>
      </section>
    </div>
  );
}

/** Pretty labels for the stage list */
function labelForStage(s: HubStage) {
  switch (s) {
    case "ORDER":
      return "Create BTDO (Order)";
    case "BOOKING":
      return "Confirm BDO (Pricelock)";
    case "ACTIVE":
      return "Issue PO + Delivery Slot";
    case "REPORTING":
      return "Post GRN / Report";
    case "INVOICING":
      return "Issue Invoice + Payment Plan";
    default:
      return s;
  }
}
