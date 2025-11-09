// app/ship/business/pos/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type CartItem = {
  code: string;
  name: string;
  price: number; // per unit, in major currency (e.g., 12.34)
  qty: number;
};

export default function POSHome() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<"cash" | "card" | "bank" | "other">("cash");
  const inputRef = useRef<HTMLInputElement>(null);

  // autofocus for keyboard-wedge scanners
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // --- Product lookup (placeholder API; wire to Prisma later) ---
  async function lookupProduct(code: string) {
    try {
      const res = await fetch(`/api/pos/product?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data?.product) {
        const p = data.product as { code: string; name: string; price: number };
        setCart((prev) => {
          const idx = prev.findIndex((i) => i.code === p.code);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
            return copy;
          }
          return [...prev, { ...p, qty: 1 }];
        });
      }
    } catch {
      // silent for now
    }
  }

  // handle Enter like a scan terminator
  function onScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const code = barcode.trim();
      if (code) lookupProduct(code);
      setBarcode("");
    }
  }

  function inc(code: string) {
    setCart((prev) =>
      prev.map((i) => (i.code === code ? { ...i, qty: i.qty + 1 } : i))
    );
  }
  function dec(code: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.code === code ? { ...i, qty: Math.max(0, i.qty - 1) } : i))
        .filter((i) => i.qty > 0)
    );
  }
  function removeLine(code: string) {
    setCart((prev) => prev.filter((i) => i.code !== code));
  }
  function clearCart() {
    setCart([]);
    inputRef.current?.focus();
  }

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );
  const vat = useMemo(() => +(subtotal * 0.05).toFixed(2), [subtotal]); // demo 5% VAT
  const total = +(subtotal + vat).toFixed(2);

  async function checkout() {
    const res = await fetch("/api/pos/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, subtotal, vat, total, method }),
    });
    const data = await res.json();
    if (data.ok) {
      setCart([]);
      alert("✅ Sale recorded and sent to OBARI/Finance");
    } else {
      alert(`❌ ${data.error || "Checkout failed"}`);
    }
    inputRef.current?.focus();
  }

  return (
    <main className="p-6 space-y-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card">
        <div className="hero-accent" />
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-3xl font-bold">Point of Sale</h1>
            <p className="text-sm text-muted mt-1">
              Catalog · Stock · Sales — the heartbeat that feeds OBARI™ and Finance.
            </p>
          </div>
          <span className="pill text-xs">POS · Register</span>
        </div>

        {/* Hub quick links (sticky inside hero) */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn"
            onClick={() => router.push("/ship/business/oms/finance/pos/catalog")}
            title="Products, pricing, barcodes"
          >
            📦 Catalog
          </button>
          <button
            className="btn"
            onClick={() => router.push("/ship/business/oms/finance/pos/stock")}
            title="Live levels, movements, adjustments"
          >
            📊 Stock
          </button>
          <button
            className="btn"
            onClick={() => router.push("/ship/business/oms/finance/pos/sales" as unknown as any)}
            title="Receipts, refunds, Z report"
          >
            🧾 Sales
          </button>
          <button
            className="btn"
            onClick={() => router.push("/ship/business/oms/finance/pos/settings" as unknown as any)}
            title="Locations, taxes, devices"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Body */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Left: Quick Till */}
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-card overflow-hidden">
          {/* Sticky scan bar */}
          <div className="sticky top-0 z-10 border-b bg-[color-mix(in_srgb,var(--panel)_92%,transparent)] backdrop-blur px-4 py-3">
            <h2 className="text-base font-semibold mb-2">Quick Till</h2>
            <input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={onScanKeyDown}
              placeholder="Scan barcode or type code and press Enter…"
              className="w-full border border-ring rounded-lg p-3 text-lg bg-surface"
            />
          </div>

          {/* Cart table */}
          <div className="p-4">
            <div className="rounded-xl border border-ring overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr className="text-left border-b border-ring">
                    <th className="py-2 px-3">Code</th>
                    <th className="px-3">Name</th>
                    <th className="px-3 text-right">Qty</th>
                    <th className="px-3 text-right">Price</th>
                    <th className="px-3 text-right">Line Total</th>
                    <th className="px-3 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {cart.length ? (
                    cart.map((i) => (
                      <tr key={i.code} className="border-b border-ring">
                        <td className="py-2 px-3 font-mono">{i.code}</td>
                        <td className="px-3">{i.name}</td>
                        <td className="px-3 text-right">{i.qty}</td>
                        <td className="px-3 text-right">{i.price.toFixed(2)}</td>
                        <td className="px-3 text-right">{(i.qty * i.price).toFixed(2)}</td>
                        <td className="px-3 text-right">
                          <div className="inline-flex gap-1">
                            <button className="btn" onClick={() => dec(i.code)} title="Decrease">
                              −
                            </button>
                            <button className="btn" onClick={() => inc(i.code)} title="Increase">
                              +
                            </button>
                            <button
                              className="btn"
                              onClick={() => removeLine(i.code)}
                              title="Remove line"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-muted" colSpan={6}>
                        No items — scan to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cart actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-muted">
                Tip: your USB/Bluetooth scanner will “type + Enter” here automatically.
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={clearCart}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Totals & Payment */}
        <div className="rounded-2xl border bg-card shadow-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Payment</h2>

          <div className="grid gap-2">
            <label className="text-sm text-muted">Method</label>
            <select
              className="rounded-md border px-3 py-2 bg-transparent"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card (Stripe)</option>
              <option value="bank">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="rounded-xl border p-3 bg-[color-mix(in_srgb,var(--panel)_86%,transparent)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-sm font-medium">{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">VAT (5%)</span>
              <span className="text-sm font-medium">{vat.toFixed(2)}</span>
            </div>
            <div className="mt-1 pt-2 border-t flex items-center justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-base font-semibold">{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <button className="btn btn-primary" disabled={!cart.length} onClick={checkout}>
              🧾 Complete Sale
            </button>
            <button
              className="btn"
              onClick={() => {
                // demo print preview hook
                window.print();
              }}
            >
              🖨 Print Receipt
            </button>
          </div>

          {/* Mini receipt preview */}
          <div className="rounded-xl border p-3 bg-[color-mix(in_srgb,var(--panel)_86%,transparent)]">
            <div className="text-xs text-muted mb-2">Receipt Preview</div>
            <div className="text-xs font-mono whitespace-pre-wrap">
              {cart.length
                ? cart
                    .map(
                      (i) =>
                        `${i.qty}× ${i.name} @ ${i.price.toFixed(2)}  = ${(i.qty * i.price).toFixed(2)}`
                    )
                    .join("\n")
                : "—"}
              {cart.length ? `\n\nTotal: ${total.toFixed(2)}` : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Explainer */}
      <section className="rounded-2xl border bg-card shadow-card p-4">
        <h2 className="text-base font-semibold mb-2">How POS powers the corAe flow</h2>
        <ul className="text-sm text-muted list-disc pl-5 space-y-1">
          <li>Each sale updates stock and writes Sale/SaleLine records.</li>
          <li>Low-stock rules can auto-generate OBARI <strong>Orders</strong> for the next cycle.</li>
          <li>Sales post into Finance (Sales Ledger); payouts and till moves flow to Bank.</li>
        </ul>
      </section>
    </main>
  );
}