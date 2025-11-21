"use client";

import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Btn, Input } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "mindful";

export default function Page() {
  const [items, setItems] = useState<string[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const d = loadDraft<Record<string, any>>();
    const seed = (d && Array.isArray(d[KEY]) ? d[KEY] : []) as string[];
    setItems(seed);
  }, []);

  function addItem() {
    const v = value.trim();
    if (!v) return;
    const next = [...items, v];
    setItems(next);
    saveDraft((d: any) => ({ ...(d || {}), [KEY]: next }));
    setValue("");
  }

  function removeItem(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    saveDraft((d: any) => ({ ...(d || {}), [KEY]: next }));
  }

  return (
    <HomeSectionLayout title="Mindful" hint="Quick habits and reflections to keep you centred">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input value={value} onChange={(e: any) => setValue(e.target.value)} placeholder="e.g., 10 min breathing" />
          <Btn onClick={addItem}>Add</Btn>
        </div>

        <div className="space-y-2">
          {items.length === 0 && <div className="text-muted">No mindful items yet — add one above.</div>}
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border rounded">
              <div className="truncate">{it}</div>
              <Btn variant="ghost" onClick={() => removeItem(idx)}>
                Remove
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </HomeSectionLayout>
  );
}
