"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type WantItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  category?: string;
  estimate?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetDate?: string;
  link?: string;
  notes?: string;
  tags?: string[];
};

const WantList = {
  safeParse: (v: any): { success: true; data: WantItem[] } | { success: false } => {
    if (Array.isArray(v)) {
      // Basic pass-through validation: ensure each entry has an id and title
      const ok = v.every((it) => it && typeof it.id === "string" && typeof it.title === "string");
      if (ok) return { success: true, data: v as WantItem[] };
    }
    return { success: false };
  },
};

type Draft = {
  title: string;
  category?: string;
  estimate?: number | "";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetDate?: string;
  link?: string;
  notes?: string;
};

const STORAGE_KEY = "corae.home.iwant.local";

export default function IWantManagePage() {
  const [items, setItems] = useState<WantItem[]>([]);
  const [draft, setDraft] = useState<Draft>({ title: "", priority: "MEDIUM" });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sharingUrl, setSharingUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/home/iwant");
        if (r.ok) {
          const list = await r.json();
          const parsed = WantList.safeParse(list);
          if (!cancel && parsed.success) setItems(parsed.data);
        }
      } catch {}
      const local = localStorage.getItem(STORAGE_KEY);
      if (local && !cancel) {
        try {
          const parsed = WantList.safeParse(JSON.parse(local));
          if (parsed.success) {
            const ids = new Set(items.map((i) => i.id));
            const merged = [...items, ...parsed.data.filter((i) => !ids.has(i.id))];
            setItems(merged);
          }
        } catch {}
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const total = useMemo(() => items.reduce((s, i) => s + (i.estimate || 0), 0), [items]);

  const addItem = async () => {
    if (!draft.title.trim()) return;
    const payload = {
      title: draft.title.trim(),
      category: draft.category || "General",
      estimate: typeof draft.estimate === "number" ? draft.estimate : 0,
      priority: draft.priority || "MEDIUM",
      targetDate: draft.targetDate || undefined,
      link: draft.link || undefined,
      notes: draft.notes || undefined,
      tags: [],
    };
    const now = new Date().toISOString();
    const optimistic: WantItem = { id: `local_${Date.now().toString(36)}`, status: "WISHLIST", createdAt: now, updatedAt: now, ...payload } as WantItem;
    setItems((prev) => [optimistic, ...prev]);
    setDraft({ title: "", priority: "MEDIUM" });
    try {
      const r = await fetch("/api/home/iwant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) {
        const j = await r.json();
        if (j?.item) setItems((prev) => [j.item as WantItem, ...prev.filter((i) => i.id !== optimistic.id)]);
      }
    } catch {}
  };

  const findBestPrice = async (item: WantItem) => {
    const r = await fetch("/api/home/bestprice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: item.title, link: item.link }) });
    const j = await r.json();
    if (j?.ok && j.options?.length) {
      const best = j.options[0];
      const tracked = `/api/home/redirect?m=${encodeURIComponent(best.merchant)}&itemId=${encodeURIComponent(item.id)}&u=${encodeURIComponent(best.affiliateUrl)}`;
      window.open(tracked, "_blank");
      return;
    }
    alert("No offers found (stub).");
  };

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const createShare = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return alert("Select at least one item to share.");
    const r = await fetch("/api/home/wish/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemIds: ids, title: "My Wishlist" }) });
    const j = await r.json();
    if (j?.ok && j.url) {
      const url = j.url;
      setSharingUrl(url);
      await navigator.clipboard.writeText(window.location.origin + url);
      alert("Share URL copied to clipboard!");
    } else {
      alert("Share failed.");
    }
  };

  const [compareResults, setCompareResults] = useState<any[] | null>(null);
  const compareSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return alert("Select at least one item to compare.");
    const itemsToCompare = items.filter((i) => ids.includes(i.id)).map(i => ({ title: i.title, url: i.link, desiredPrice: i.estimate }));
    try {
      const r = await fetch("/api/home/want/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: itemsToCompare }) });
      if (!r.ok) throw new Error(`status ${r.status}`);
      const j = await r.json();
      setCompareResults(j.results ?? null);
    } catch (err) {
      console.error(err);
      alert("Compare failed.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">I Want</h1>
        <Link href="/home" className="text-sm underline">â† Home</Link>
      </div>
      <p className="text-sm text-zinc-400">Create your wishlist, find the best price, then share a public link.</p>

      <div className="mt-4 grid gap-3 rounded-2xl border p-4 md:grid-cols-2">
        <input className="rounded-xl border bg-transparent p-2" placeholder="What do you want?"
          value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
        <input className="rounded-xl border bg-transparent p-2" placeholder="Category" value={draft.category ?? ""}
          onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} />
        <input className="rounded-xl border bg-transparent p-2" placeholder="Estimate (AED)" type="number"
          value={draft.estimate ?? ""} onChange={e => setDraft(d => ({ ...d, estimate: e.target.value === "" ? "" : Number(e.target.value) }))} />
        <select className="rounded-xl border bg-transparent p-2" value={draft.priority}
          onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Draft["priority"] }))}>
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
        </select>
        <input className="rounded-xl border bg-transparent p-2" type="date" value={draft.targetDate ?? ""}
          onChange={e => setDraft(d => ({ ...d, targetDate: e.target.value }))} />
        <input className="rounded-xl border bg-transparent p-2" placeholder="Link (optional)" value={draft.link ?? ""}
          onChange={e => setDraft(d => ({ ...d, link: e.target.value }))} />
        <textarea className="rounded-xl border bg-transparent p-2 md:col-span-2" placeholder="Notes"
          value={draft.notes ?? ""} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} />
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500" onClick={addItem}>+ Add</button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={createShare} className="rounded-full border px-3 py-1 text-sm hover:bg-white/10">Create Share Link</button>
        <button onClick={compareSelected} className="rounded-full border px-3 py-1 text-sm hover:bg-white/10">Compare selected</button>
        {sharingUrl && <Link href={sharingUrl} className="text-sm underline">Open shared page</Link>}
      </div>

      <div className="mt-6 grid gap-3">
        {items.map(item => (
          <div key={item.id} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <label className="mt-1">
                <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggleSelect(item.id)} />
              </label>
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-zinc-400">
                  {item.category} â€¢ {item.priority} â€¢ AED {item.estimate?.toLocaleString?.() ?? 0}
                  {item.targetDate ? <> â€¢ target {item.targetDate}</> : null}
                </div>
                {item.link && <a className="text-xs underline" href={item.link} target="_blank" rel="noreferrer">Open link</a>}
                {item.notes && <div className="mt-1 text-sm">{item.notes}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => findBestPrice(item)}>Find best price</button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-400">No items yet.</div>}
      </div>

      {compareResults && (
        <div className="mt-6 rounded-xl border p-4">
          <h2 className="text-lg font-medium">Compare results</h2>
          <div className="mt-3 grid gap-3">
            {compareResults.map((res: any, idx: number) => (
              <div key={idx} className="rounded-lg border p-3">
                <div className="font-medium">{res.item?.title ?? res.item?.name ?? 'Item'}</div>
                <div className="mt-2 grid gap-2">
                  {res.offers?.map((o: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="text-sm">{o.vendor} â€” {o.currency ?? ''} {o.price}</div>
                      {o.affiliateUrl ? <a className="text-xs underline" href={o.affiliateUrl} target="_blank" rel="noreferrer">Buy</a> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-right text-sm text-zinc-400">Total (all): <span className="font-semibold text-white">AED {total.toLocaleString()}</span></div>
    </div>
  );
}

