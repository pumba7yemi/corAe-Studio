// app/ship/business/pos/catalog/page.tsx
"use client";

import { useMemo, useState } from "react";

type Item = {
  sku: string;
  name: string;
  barcode?: string;
  price: number;
  vat?: number; // %
  active: boolean;
};

const seedItems: Item[] = [
  { sku: "Product0001", name: "Seed Product", barcode: "100000000001", price: 10, vat: 5, active: true },
  { sku: "COLA330", name: "Cola 330ml", barcode: "5000112543210", price: 4.5, vat: 5, active: true },
  { sku: "MILK1L", name: "Fresh Milk 1L", barcode: "6291000001111", price: 7.75, vat: 5, active: true },
];

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>(seedItems);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Item>({
    sku: "",
    name: "",
    barcode: "",
    price: 0,
    vat: 5,
    active: true,
  });

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter(
      (i) =>
        i.sku.toLowerCase().includes(k) ||
        i.name.toLowerCase().includes(k) ||
        (i.barcode ?? "").toLowerCase().includes(k)
    );
  }, [items, q]);

  const addItem = () => {
    if (!form.sku || !form.name) return;
    if (items.some((i) => i.sku === form.sku)) return;
    setItems((prev) => [form, ...prev]);
    setForm({ sku: "", name: "", barcode: "", price: 0, vat: 5, active: true });
  };

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Catalog</h1>
        <p className="muted">Products, pricing, and barcodes. (Local only for now.)</p>
      </header>

      {/* Search & quick stats */}
      <section className="c-card p-4">
        <div className="row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU, name, or barcode…"
            className="flex-1 border border-ring rounded-lg p-3"
          />
          <div className="badge">{filtered.length} items</div>
        </div>
      </section>

      {/* Add item */}
      <section className="c-card p-4">
        <h2 className="text-lg font-semibold mb-3">Add Item</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
          <input
            className="border border-ring rounded-lg p-2"
            placeholder="SKU (unique)"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value.trim() })}
          />
          <input
            className="border border-ring rounded-lg p-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border border-ring rounded-lg p-2"
            placeholder="Barcode"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            className="border border-ring rounded-lg p-2"
            placeholder="Price (AED)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value || 0) })}
          />
          <input
            type="number"
            step="0.01"
            className="border border-ring rounded-lg p-2"
            placeholder="VAT %"
            value={form.vat ?? 0}
            onChange={(e) => setForm({ ...form, vat: Number(e.target.value || 0) })}
          />
          <label className="row">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="small">Active</span>
          </label>
        </div>

        <div className="row justify-end mt-3">
          <button className="btn btn-primary" onClick={addItem}>➕ Add</button>
        </div>
      </section>

      {/* Table */}
      <section className="c-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left border-b border-ring">
              <th className="py-2 px-3">SKU</th>
              <th className="px-3">Name</th>
              <th className="px-3">Barcode</th>
              <th className="px-3">Price</th>
              <th className="px-3">VAT %</th>
              <th className="px-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.sku} className="border-b border-ring">
                <td className="py-2 px-3 font-mono">{i.sku}</td>
                <td className="px-3">{i.name}</td>
                <td className="px-3">{i.barcode || <span className="muted">—</span>}</td>
                <td className="px-3">{i.price.toFixed(2)}</td>
                <td className="px-3">{(i.vat ?? 0).toFixed(2)}</td>
                <td className="px-3">
                  <span className="badge">{i.active ? "Yes" : "No"}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 muted" colSpan={6}>No items match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
