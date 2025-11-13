import React from 'react';
// @ts-ignore: module does not have type declarations in this workspace
import { listPrayerDocs } from '@/packages/core-faith';

export default async function Page() {
  const items = await listPrayerDocs();

  return (
    <div style={{ padding: 16 }}>
      <h1>Prayer Library</h1>
      <ul>
        {items.map((it: any) => (
          <li key={it.slug}><a href={`/ship/home/faith/catholicism/library/${encodeURIComponent(it.slug)}`}>{it.title}</a></li>
        ))}
      </ul>
    </div>
  );
}
