"use client";

import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Card, Btn, Input, Chip } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "maintenance";

type Item = { id: string; title: string; due?: string; vendor?: string };

export default function MaintenancePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [vendor, setVendor] = useState("");

  useEffect(() => {
    const d = loadDraft<Record<string, any>>();
    setItems(Array.isArray(d?.[KEY]) ? d[KEY] : []);
  }, []);

  const add = () => {
    if (!title.trim()) return;
    const next = [
      ...items,
      {
        id: (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: title.trim(),
        due: due.trim() || undefined,
        vendor: vendor.trim() || undefined,
      },
    ];
    setItems(next);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: next }));
    setTitle("");
    setDue("");
    setVendor("");
  };

  const remove = (id: string) => {
    const n = items.filter((i) => i.id !== id);
    setItems(n);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: n }));
  };

  return (
    <HomeSectionLayout title="Home • Maintenance" hint="Repairs, servicing, vendors">
      <Card title="Track Maintenance">
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="e.g., AC service" value={title} onChange={(e: any) => setTitle(e.target.value)} />
          <Input placeholder="Due (e.g., 2025-11-15)" value={due} onChange={(e: any) => setDue(e.target.value)} />
          <Input placeholder="Vendor (optional)" value={vendor} onChange={(e: any) => setVendor(e.target.value)} />
        </div>
        <Btn variant="secondary" onClick={add}>
          + Add
        </Btn>
        {items.length > 0 && (
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div key={i.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>{i.title}</strong>
                    {i.due ? ` • due ${i.due}` : ""}
                    {i.vendor ? ` • ${i.vendor}` : ""}
                  </span>
                  <Btn variant="danger" onClick={() => remove(i.id)}>
                    Remove
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </HomeSectionLayout>
  );
}
