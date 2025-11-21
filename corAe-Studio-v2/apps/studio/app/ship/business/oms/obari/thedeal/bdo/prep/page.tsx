"use client";
export const dynamic = "force-dynamic";

/**
 * OBARI â€” TheDeal â€º BDO â€º Prep Â· 150.logic
 * Flow: BDO Ready â†’ BDO Prep â†’ Order (OBARI core)
 * - Reads saved schedule snapshot from sessionStorage ("bdo.schedule.selection")
 * - Optional preset auto-fills direction, parties, and item details
 * - Issues a BDO Draft via /api/business/oms/obari/bdo/order/issue
 * - Back â†’ BDO Ready (thedeal) | Next â†’ Order (obari core)
 */

import { useEffect, useMemo, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav";

type Direction = "PURCHASE" | "SALES";
type WeekRef = "W1" | "W2" | "W3" | "W4";
type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

type SavedSchedule = {
  mode: ScheduleMode;
  weekRef?: WeekRef | null;
  startDate: string;
  endDate: string;
  label?: string | null;
};

type BdoPreset = {
  id: string;
  name: string;
  direction: Direction;
  vendorCode?: string | null;
  customerCode?: string | null;
  scheduleMode?: ScheduleMode | null;
  defaultWeek?: WeekRef | null;
  currency?: string | null;
  taxCode?: string | null;
  itemCode?: string | null;
  unit?: string | null;
  unitPrice?: number | null;
};

type IssueResponse = { ok: true; data: any } | { ok: false; error: string };

export default function BdoPrepPage() {
  const [sched, setSched] = useState<SavedSchedule | null>(null);
  const [bdoList, setBdoList] = useState<BdoPreset[]>([]);
  const [bdoId, setBdoId] = useState<string>("");

  const [direction, setDirection] = useState<Direction>("PURCHASE");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("CYCLE_28");
  const [expectedWeek, setExpectedWeek] = useState<WeekRef | "">("");

  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("EA");
  const [unitPrice, setUnitPrice] = useState("0");
  const [currency, setCurrency] = useState("AED");
  const [taxCode, setTaxCode] = useState("");
  const [vendorCode, setVendorCode] = useState("Vendor0001");
  const [customerCode, setCustomerCode] = useState("");

  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* â”€â”€ Load schedule (from BDO Ready) â”€â”€ */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bdo.schedule.selection");
      if (raw) setSched(JSON.parse(raw) as SavedSchedule);
    } catch { /* ignore */ }
  }, []);

  /* â”€â”€ Load presets (thedeal) â”€â”€ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/business/oms/obari/bdo/presets", { cache: "no-store" });
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) setBdoList(data.items);
      } catch { /* optional */ }
    })();
  }, []);

  /* â”€â”€ Apply preset â”€â”€ */
  useEffect(() => {
    const p = bdoList.find((x) => x.id === bdoId);
    if (!p) return;
    setDirection(p.direction);
    if (p.scheduleMode) setScheduleMode(p.scheduleMode);
    if (p.defaultWeek) setExpectedWeek(p.defaultWeek);
    if (p.direction === "PURCHASE") {
      setVendorCode(p.vendorCode ?? "Vendor0001");
      setCustomerCode("");
    } else {
      setCustomerCode(p.customerCode ?? "Customer0001");
      setVendorCode("");
    }
    if (p.itemCode) setItemCode(p.itemCode);
    if (p.unit) setUnit(p.unit);
    if (typeof p.unitPrice === "number") setUnitPrice(String(p.unitPrice));
    if (p.currency) setCurrency(p.currency);
    if (p.taxCode) setTaxCode(p.taxCode);
  }, [bdoId, bdoList]);

  /* â”€â”€ Validation â”€â”€ */
  const canIssue = useMemo(() => {
    const q = Number(qty);
    const p = Number(unitPrice);
    return itemCode.trim().length > 0 && Number.isFinite(q) && q > 0 && Number.isFinite(p) && p >= 0;
  }, [itemCode, qty, unitPrice]);

  /* â”€â”€ Issue BDO Draft â”€â”€ */
  async function issueOrder() {
    if (!canIssue) return;
    setIssuing(true);
    setMessage(null);
    try {
      const payload = {
        direction,
        itemCode: itemCode.trim(),
        description: description.trim() || undefined,
        qty: Number(qty),
        unit: unit.trim() || undefined,
        unitPrice: Number(unitPrice),
        currency: currency.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
        scheduleMode,
        expectedWeek: (expectedWeek || undefined) as WeekRef | undefined,
        vendorCode: direction === "PURCHASE" ? (vendorCode.trim() || "Vendor0001") : undefined,
        customerCode: direction === "SALES" ? (customerCode.trim() || "Customer0001") : undefined,
      };

      const res = await fetch("/api/business/oms/obari/bdo/order/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: IssueResponse = await res.json();
      if (!data.ok) throw new Error(data.error || "Issue failed.");

      setMessage("âœ… BDO Draft issued.");
    } catch (e: any) {
      setMessage(`âŒ ${e.message || "Failed to issue BDO Draft."}`);
    } finally {
      setIssuing(false);
    }
  }

  /* â”€â”€ Schedule banner â”€â”€ */
  const schedLine = sched
    ? (() => {
        const s = new Date(sched.startDate);
        const e = new Date(sched.endDate);
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const bits = [
          `Mode: ${sched.mode}`,
          sched.weekRef ? `Week: ${sched.weekRef}` : null,
          `Window: ${fmt(s)} â†’ ${fmt(e)}`,
          sched.label ? `Label: ${sched.label}` : null,
        ].filter(Boolean);
        return bits.join(" Â· ");
      })()
    : null;

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI â€” BDO Prep</h1>
        <p className="muted">Prepare commercial details from your BDO Ready window, then issue a BDO draft.</p>
      </header>

      <section className="c-card p-4 space-y-2">
        <h2 className="text-lg font-semibold">Schedule Selected</h2>
        {sched ? (
          <div className="small">{schedLine}</div>
        ) : (
          <div className="small text-yellow-600">
            No schedule found. Go back to <span className="font-mono">BDO Ready</span> to choose cadence and dates.
          </div>
        )}
      </section>

      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">BDO Preset (optional)</h2>
        <div className="row gap-2">
          <select
            value={bdoId}
            onChange={(e) => setBdoId(e.target.value)}
            className="border border-ring rounded-lg p-2 bg-card flex-1"
            disabled={bdoList.length === 0}
          >
            <option value="">{bdoList.length ? "Select a presetâ€¦" : "No presets"}</option>
            {bdoList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="small muted">Preset can fill direction, parties, schedule hints, and item defaults.</div>
      </section>

      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Commercials</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="stack">
            <span className="small muted">Direction</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="border border-ring rounded-lg p-2 bg-card"
            >
              <option value="PURCHASE">PURCHASE</option>
              <option value="SALES">SALES</option>
            </select>
          </label>

          <label className="stack">
            <span className="small muted">Schedule Mode</span>
            <select
              value={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.value as ScheduleMode)}
              className="border border-ring rounded-lg p-2 bg-card"
            >
              <option value="CYCLE_28">CYCLE_28</option>
              <option value="MONTHLY">MONTHLY</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </label>

          <label className="stack">
            <span className="small muted">Expected Week (optional)</span>
            <select
              value={expectedWeek}
              onChange={(e) => setExpectedWeek(e.target.value as WeekRef | "")}
              className="border border-ring rounded-lg p-2 bg-card"
            >
              <option value="">â€” Auto â€”</option>
              <option value="W1">W1</option>
              <option value="W2">W2</option>
              <option value="W3">W3</option>
              <option value="W4">W4</option>
            </select>
          </label>

          <label className="stack md:col-span-3">
            <span className="small muted">Description (optional)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Item Code</span>
            <input
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder="Product0001"
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Qty</span>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="decimal"
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Unit</span>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="EA / KG / L"
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Unit Price</span>
            <input
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              inputMode="decimal"
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Currency</span>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-ring rounded-lg p-2"
            />
          </label>

          <label className="stack">
            <span className="small muted">Tax Code</span>
            <input
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              className="border border-ring rounded-lg p-2"
            />
          </label>

          {direction === "PURCHASE" && (
            <label className="stack">
              <span className="small muted">Vendor Code</span>
              <input
                value={vendorCode}
                onChange={(e) => setVendorCode(e.target.value)}
                placeholder="Vendor0001"
                className="border border-ring rounded-lg p-2"
              />
            </label>
          )}

          {direction === "SALES" && (
            <label className="stack">
              <span className="small muted">Customer Code</span>
              <input
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder="Customer0001"
                className="border border-ring rounded-lg p-2"
              />
            </label>
          )}
        </div>

        <div className="row justify-end gap-2">
          <button className="btn btn-primary" onClick={issueOrder} disabled={!canIssue || issuing}>
            {issuing ? "Issuingâ€¦" : "Issue BDO Draft"}
          </button>
        </div>

        {message && <div className="small mt-2">{message}</div>}
      </section>

      <ArrowNav
        backHref="/business/oms/obari/thedeal/bdo/schedule"
        nextHref="/business/oms/obari/order"
        nextLabel="To Order"
      >
        Step 3 of 3 â€” BDO Prep
      </ArrowNav>
    </main>
  );
}
