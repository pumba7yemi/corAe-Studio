// app/ship/business/pos/till/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";

type SaleItem = {
  code: string;
  name: string;
  qty: number;
  price: number;
};

export default function POSTill() {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // handle Enter (simulate barcode scan)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcode.trim() !== "") {
      addItem(barcode.trim());
      setBarcode("");
    }
  };

  const addItem = (code: string) => {
    // placeholder lookup
    const product = {
      code,
      name: `Product ${code}`,
      qty: 1,
      price: Math.round(Math.random() * 50 + 5),
    };
    setItems((prev) => [...prev, product]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">POS Till</h1>
        <p className="muted">Scan barcode or type code and press Enter.</p>
      </header>

      <div className="c-card p-4">
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border border-ring rounded-lg p-3 text-lg"
          placeholder="Scan or enter product code..."
        />
      </div>

      <div className="c-card p-4">
        <h2 className="text-lg font-semibold mb-2">Sale Items</h2>
        {items.length === 0 ? (
          <p className="muted">No items yet — start scanning.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ring">
                <th className="py-2">Code</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Price (AED)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} className="border-b border-ring">
                  <td className="py-2">{i.code}</td>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>{i.price.toFixed(2)}</td>
                  <td>{(i.price * i.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="c-card p-4 flex justify-between text-lg font-semibold">
        <span>Total:</span>
        <span>{total.toFixed(2)} AED</span>
      </div>

      <div className="row justify-end">
        <button className="btn btn-primary">🧾 Checkout</button>
      </div>
    </main>
  );
}
