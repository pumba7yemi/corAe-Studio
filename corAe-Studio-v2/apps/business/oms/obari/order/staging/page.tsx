"use client";

/**
 * OBARI â€” Order â€º Staging (UI)
 * Purpose:
 * - Take a BDO draft (pasted JSON or loaded from session/local storage)
 * - POST to /api/obari/order/staging to create the immutable Order Staging Snapshot
 * - Show the staged snapshot (PO/SO numbers, locked fields)
 * - Allow notes-only patch via PATCH /api/obari/order/staging
 * - Quick fetch by Snapshot ID + view Transport Flag
 *
 * Storage conventions this UI will try to read (soft):
 * - sessionStorage["bdo.lastDraft"]          // a BdoOrderDraft stringified
 * - localStorage["bdo.lastDraft"]
 */

import { useEffect, useMemo, useState } from "react";

type Minor = number;
type Direction = "inbound" | "outbound";

type Cadence =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "EVERY_3_WEEKS"
  | "EVERY_4_WEEKS"
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUAL"
  | "ANNUAL";

type BdoLine = {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor;
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
};

type BdoOrderDraft = {
  bdo_id: string;
  direction: Direction; // inbound (PO) | outbound (SO)
  counterparty: { id: string; name: string };
  our_party: { id: string; name: string };
  schedule:
    | { kind: "scheduled"; rule: Cadence; day?: string; window?: string }
    | { kind: "ad_hoc" };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region?: string; postcode?: string };
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
};

type OrderStagingSnapshot = {
  snapshot_id: string;
  source: { kind: "BDO"; id: string };
  direction: Direction;
  order_numbers: { po_no?: string; so_no?: string };
  parties: {
    counterparty_id: string;
    counterparty_name: string;
    our_id: string;
    our_name: string;
  };
  schedule: BdoOrderDraft["schedule"];
  transport: BdoOrderDraft["transport"];
  geography?: BdoOrderDraft["geography"];
  references?: BdoOrderDraft["references"];
  notes?: string;
  lines: Array<{ sku: string; title: string; qty: number; uom?: string; unit_price: Minor }>;
  totals: { subtotal: Minor; lines: number };
  status: "staging";
  created_at_iso: string;
};

type ApiOk<T> = { ok: true } & T;
type ApiErr = { ok: false; error: string };

export default function OrderStagingPage() {
  const [draftText, setDraftText] = useState("");
  const [snapshot, setSnapshot] = useState<OrderStagingSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Fetch-by-ID helpers
  const [fetchId, setFetchId] = useState("");
  const [flag, setFlag] = useState<"CDIQ" | "CDC" | "CDN" | null>(null);

  // Notes editor
  const [notes, setNotes] = useState<string>("");

  // Try to preload a BDO draft from storage (non-fatal)
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("bdo.lastDraft");
      const l = !s && localStorage.getItem("bdo.lastDraft");
      const use = s || l;
      if (use) setDraftText(use);
    } catch {
      // ignore
    }
  }, []);

  const parsedDraft: BdoOrderDraft | null = useMemo(() => {
    if (!draftText.trim()) return null;
    try {
      const obj = JSON.parse(draftText) as BdoOrderDraft;
      if (!obj?.bdo_id || !obj?.lines?.length) return null;
      return obj;
    } catch {
      return null;
    }
  }, [draftText]);

  async function stageNow() {
    if (!parsedDraft) {
      setMsg("Provide a valid BDO draft JSON first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    setFlag(null);
    try {
      const res = await fetch("/api/business/oms/obari/order/staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedDraft),
      });
      const data = (await res.json()) as ApiOk<{ snapshot: OrderStagingSnapshot }> | ApiErr;
      if (!data.ok) throw new Error(data.error);
      setSnapshot(data.snapshot);
      setNotes(data.snapshot.notes ?? "");
      setMsg("âœ… Staged snapshot created.");
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Stage failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function fetchSnapshot() {
    if (!fetchId.trim()) {
      setMsg("Enter a Snapshot ID to fetch.");
      return;
    }
    setBusy(true);
    setMsg(null);
    setFlag(null);
    try {
      const res = await fetch(`/api/obari/order/staging?id=${encodeURIComponent(fetchId)}`);
      const data = (await res.json()) as ApiOk<{ snapshot: OrderStagingSnapshot }> | ApiErr;
      if (!data.ok) throw new Error(data.error);
      setSnapshot(data.snapshot);
      setNotes(data.snapshot.notes ?? "");
      setMsg("âœ… Snapshot loaded.");
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Fetch failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function fetchFlag() {
    const id = snapshot?.snapshot_id || fetchId.trim();
    if (!id) {
      setMsg("Load a snapshot or enter an ID first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/obari/order/staging?id=${encodeURIComponent(id)}&flag=1`);
      const data = (await res.json()) as ApiOk<{ flag: "CDIQ" | "CDC" | "CDN" }> | ApiErr;
      if (!data.ok) throw new Error(data.error);
      setFlag(data.flag);
      setMsg("âœ… Transport flag resolved.");
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Flag fetch failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    if (!snapshot) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/obari/order/staging", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId: snapshot.snapshot_id, notes }),
      });
      const data = (await res.json()) as ApiOk<{ snapshot: OrderStagingSnapshot }> | ApiErr;
      if (!data.ok) throw new Error(data.error);
      setSnapshot(data.snapshot);
      setMsg("âœ… Notes updated.");
    } catch (e: any) {
      setMsg(`âŒ ${e?.message || "Notes update failed"}`);
    } finally {
      setBusy(false);
    }
  }

  const subtotalFmt = (v?: number) =>
    typeof v === "number" ? (v / 100).toFixed(2) : "0.00";

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI â€” Order Â· Staging</h1>
        <p className="muted">
          Create the immutable staging snapshot from a BDO, view PO/SO numbers, and patch notes only.
        </p>
      </header>

      {/* Left: Paste/Load BDO â†’ Stage */}
      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Stage from BDO</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="stack md:col-span-2">
            <span className="small muted">BDO Draft (JSON)</span>
            <textarea
              className="border border-ring rounded-lg p-2 min-h-[160px] font-mono text-sm"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder='{"bdo_id":"BDO_xxx","direction":"inbound","counterparty":{...},...}'
            />
          </label>

          <div className="row gap-2">
            <button
              className="btn btn-primary"
              onClick={stageNow}
              disabled={!parsedDraft || busy}
            >
              {busy ? "Workingâ€¦" : "Stage Snapshot"}
            </button>
            <button
              className="btn"
              onClick={() => {
                try {
                  const s = sessionStorage.getItem("bdo.lastDraft");
                  const l = !s && localStorage.getItem("bdo.lastDraft");
                  const use = s || l || "";
                  setDraftText(use || "");
                  setMsg(use ? "Loaded draft from storage." : "No stored draft found.");
                } catch {
                  setMsg("Could not read storage.");
                }
              }}
              disabled={busy}
            >
              Load from storage
            </button>
          </div>
        </div>
      </section>

      {/* Fetch by ID / Flag */}
      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Fetch Snapshot / Transport Flag</h2>
        <div className="row gap-2">
          <input
            className="border border-ring rounded-lg p-2 flex-1 font-mono"
            placeholder="OSTG_xxxxxxxx"
            value={fetchId}
            onChange={(e) => setFetchId(e.target.value)}
          />
          <button className="btn" onClick={fetchSnapshot} disabled={busy}>
            Fetch
          </button>
          <button className="btn" onClick={fetchFlag} disabled={busy}>
            Get Flag
          </button>
          {flag && <div className="small">Flag: <span className="font-mono">{flag}</span></div>}
        </div>
      </section>

      {/* Snapshot View */}
      {snapshot && (
        <section className="c-card p-4 space-y-4">
          <h2 className="text-lg font-semibold">Snapshot</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="stack">
              <div className="small muted">Snapshot ID</div>
              <div className="font-mono">{snapshot.snapshot_id}</div>
            </div>
            <div className="stack">
              <div className="small muted">Created</div>
              <div>{new Date(snapshot.created_at_iso).toLocaleString()}</div>
            </div>

            <div className="stack">
              <div className="small muted">Direction</div>
              <div className="font-mono">{snapshot.direction.toUpperCase()}</div>
            </div>
            <div className="stack">
              <div className="small muted">Order No.</div>
              <div className="font-mono">
                {snapshot.order_numbers.po_no || snapshot.order_numbers.so_no}
              </div>
            </div>

            <div className="stack">
              <div className="small muted">Counterparty</div>
              <div className="font-mono">
                {snapshot.parties.counterparty_id} â€” {snapshot.parties.counterparty_name}
              </div>
            </div>
            <div className="stack">
              <div className="small muted">Our Party</div>
              <div className="font-mono">
                {snapshot.parties.our_id} â€” {snapshot.parties.our_name}
              </div>
            </div>

            <div className="stack md:col-span-2">
              <div className="small muted">Schedule</div>
              <div className="font-mono">
                {snapshot.schedule.kind === "scheduled"
                  ? `${snapshot.schedule.rule}${
                      snapshot.schedule.day ? " Â· " + snapshot.schedule.day : ""
                    }${snapshot.schedule.window ? " Â· " + snapshot.schedule.window : ""}`
                  : "AD_HOC"}
              </div>
            </div>

            <div className="stack">
              <div className="small muted">Transport</div>
              <div className="font-mono">
                in_quote={String(snapshot.transport.in_quote)}
                {snapshot.transport.mode ? ` Â· mode=${snapshot.transport.mode}` : ""}
              </div>
            </div>

            <div className="stack">
              <div className="small muted">Totals (ex VAT)</div>
              <div className="font-mono">Â£{subtotalFmt(snapshot.totals.subtotal)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="small muted">Lines</div>
            <div className="overflow-auto border border-ring rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-2">SKU</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-left p-2">UOM</th>
                    <th className="text-right p-2">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.lines.map((ln, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono">{ln.sku}</td>
                      <td className="p-2">{ln.title}</td>
                      <td className="p-2 text-right">{ln.qty}</td>
                      <td className="p-2">{ln.uom || "-"}</td>
                      <td className="p-2 text-right">Â£{subtotalFmt(ln.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes-only edit */}
          <div className="space-y-2">
            <div className="small muted">Notes (only field allowed to change while in staging)</div>
            <textarea
              className="border border-ring rounded-lg p-2 w-full min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="row justify-end gap-2">
              <button className="btn" onClick={saveNotes} disabled={busy}>
                Save Notes
              </button>
            </div>
          </div>
        </section>
      )}

      {msg && <div className="small">{msg}</div>}
    </main>
  );
}
