"use client";

import { useState } from "react";

type FoundProduct = {
  id: string;
  code: string;
  name: string;
  price: number;
  tax: number;
  barcode?: string | null;
  imageUrl?: string | null;
};

export default function POSCatalogPage() {
  // ---- Search (by barcode/code) ----
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<FoundProduct | null>(null);
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setFound(null);
    try {
      const res = await fetch(`/api/business/pos/product?code=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      if (data?.ok && data.product) setFound(data.product);
      else setFound(null);
    } finally {
      setSearching(false);
    }
  };

  // ---- Quick Add (new item) ----
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("0.00");
  const [taxRate, setTaxRate] = useState<string>("5.00");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const canSave =
    code.trim().length >= 3 &&
    name.trim().length >= 2 &&
    !Number.isNaN(Number(price));

  const saveItem = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/business/pos/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          price: Number(price),
          taxRate: Number(taxRate || 0),
          barcode: barcode.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setSaveMsg("✅ Item created.");
        setCode("");
        setName("");
        setPrice("0.00");
        setTaxRate("5.00");
        setBarcode("");
        setImageUrl("");
      } else {
        setSaveMsg(`❌ ${data?.error || "Failed to create item."}`);
      }
    } catch (e: any) {
      setSaveMsg(`⚠️ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-2xl font-bold">Catalog</h1>
        <p className="muted">Search and add products for POS and OBARI flow.</p>
      </header>

      {/* Search */}
      <section className="c-card space-y-3">
        <h2 className="text-lg font-semibold">Find product (barcode / code)</h2>
        <div className="flex gap-2">
          <input
            placeholder="e.g. 6291234567890 or Product0001"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-ring rounded-lg p-2 bg-surface text-text"
          />
          <button
            onClick={doSearch}
            disabled={searching || !search.trim()}
            className="btn"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {found && (
          <div className="grid gap-3 md:grid-cols-[120px,1fr] items-start mt-2">
            {found.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={found.imageUrl}
                alt={found.name}
                className="rounded-xl border border-ring"
              />
            ) : (
              <div className="rounded-xl border border-ring h-[120px] w-[120px] grid place-items-center text-sm muted">
                no image
              </div>
            )}
            <div className="stack">
              <div className="text-sm muted">{found.code}{found.barcode ? ` • ${found.barcode}` : ""}</div>
              <div className="text-lg font-semibold">{found.name}</div>
              <div className="small">
                Price: {found.price.toFixed(2)} • Tax: {found.tax.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Add */}
      <section className="c-card space-y-3">
        <h2 className="text-lg font-semibold">Quick add product</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="stack">
            <label className="small muted">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Product0001"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>

          <div className="stack">
            <label className="small muted">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sample Item"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>

          <div className="stack">
            <label className="small muted">Price *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>

          <div className="stack">
            <label className="small muted">Tax %</label>
            <input
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              inputMode="decimal"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>

          <div className="stack">
            <label className="small muted">Barcode</label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="EAN/UPC"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>

          <div className="stack">
            <label className="small muted">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="border border-ring rounded-lg p-2 bg-surface text-text"
            />
          </div>
        </div>

        {imageUrl?.trim() && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="preview"
            className="rounded-xl border border-ring w-[160px] mt-1"
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={saveItem}
            disabled={!canSave || saving}
            className="btn btn-primary"
          >
            {saving ? "Saving…" : "Save Item"}
          </button>
          {saveMsg && <span className="small">{saveMsg}</span>}
        </div>
      </section>
    </main>
  );
}
