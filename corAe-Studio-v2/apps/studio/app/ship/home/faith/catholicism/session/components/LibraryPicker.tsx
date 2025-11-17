'use client';
import React, { useEffect, useState } from 'react';

export default function LibraryPicker({ onInsert }: { onInsert: (doc: any) => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/ship/home/faith/library').then((r) => r.json()).then((j) => setItems(j.items || []));
  }, []);

  return (
    <div>
      <h4>Prayer Library</h4>
      <select onChange={(e) => {
        const slug = e.target.value;
        const doc = items.find((x) => x.slug === slug);
        if (doc) onInsert(doc);
      }}>
        <option value="">-- insert from library --</option>
        {items.map((it) => <option key={it.slug} value={it.slug}>{it.title}</option>)}
      </select>
    </div>
  );
}
