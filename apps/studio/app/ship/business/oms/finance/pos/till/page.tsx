"use client";

import { useState } from "react";

export default function POSTill() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Scan or type product code
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.trim();
    setBarcode(code);
    if (code.length < 3) return; // avoid accidental triggers

    try {
      const res = await fetch(`/api/business/pos/product?code=${code}`);
      const data = await res.json();
      if (data?.product) {
        setCart((prev) => [...prev, { ...data.product, qty: 1 }]);
      }
    } catch {
      alert("❌ Product not found or lookup failed.");
    } finally {
      setBarcode("");
    }
  };

  // 🧮 Calculate total
  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0);

  // 💳 Checkout
  const handleCheckout = async () => {
    if (!cart.length) return alert("Cart is empty.");
    setLoading(true);

    try {
      const res = await fetch("/api/business/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total }),
      });
      const data = await res.json();

      if (data.ok) {
        alert("✅ Sale recorded and sent to OBARI");
        setCart([]);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err: any) {
      alert(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-2xl font-bold">POS Till</h1>
        <p className="muted">Scan products and complete the sale instantly.</p>
      </header>

      {/* Barcode input */}
      <input
        autoFocus
        placeholder="Scan barcode or type code"
        value={barcode}
        onChange={handleScan}
        className="border border-ring p-3 w-full rounded-lg bg-surface text-text"
      />

      {/* Cart items */}
      <div className="c-card">
        <h2 className="font-semibold mb-2">Cart</h2>
        <ul className="divide-y divide-ring text-sm">
          {cart.map((p, i) => (
            <li key={i} className="flex justify-between py-1">
              <span>{p.name || "Unnamed"}</span>
              <span>
                {p.qty} × {p.price?.toFixed(2) ?? "0.00"}
              </span>
            </li>
          ))}
        </ul>

        <hr className="my-2 border-ring" />
        <div className="flex justify-between font-semibold">
          <span>Total:</span> <span>{total.toFixed(2)} AED</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || !cart.length}
        className="btn btn-primary w-full"
      >
        {loading ? "Processing..." : "Checkout"}
      </button>
    </main>
  );
}
