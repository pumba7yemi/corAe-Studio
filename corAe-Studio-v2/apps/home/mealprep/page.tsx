"use client";

import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Card, Btn, Input, Chip, Textarea } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "mealprep";

type Plan = { id: string; title: string; notes?: string };

export default function MealPrepPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const d = loadDraft<Record<string, any>>();
    setPlans(Array.isArray(d?.[KEY]) ? d[KEY] : []);
  }, []);

  const add = () => {
    if (!title.trim()) return;
    const next = [
      ...plans,
      { id: (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2), title: title.trim(), notes: notes.trim() || undefined },
    ];
    setPlans(next);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: next }));
    setTitle("");
    setNotes("");
  };

  const remove = (id: string) => {
    const n = plans.filter((p) => p.id !== id);
    setPlans(n);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: n }));
  };

  return (
    <HomeSectionLayout title="Home • Meal Prep" hint="Weekly plan & batch-cook">
      <Card title="Plans">
        <Input placeholder="e.g., Week 46 plan" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <Textarea placeholder="Notes / recipe links / shopping pointers" value={notes} onChange={(e: any) => setNotes(e.target.value)} />
        <Btn variant="secondary" onClick={add}>
          + Add Plan
        </Btn>
        {plans.length > 0 && (
          <div className="mt-3 space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <strong>{p.title}</strong>
                  <Btn variant="danger" onClick={() => remove(p.id)}>
                    Remove
                  </Btn>
                </div>
                {p.notes && <p className="mt-1 text-zinc-300">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </HomeSectionLayout>
  );
}
