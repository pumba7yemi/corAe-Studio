import React from 'react';

export default async function Page(props: any) {
  const slug = props?.params?.slug;
  const res = await fetch(`/api/home/faith/library/${encodeURIComponent(slug)}`);
  const json = await res.json();
  const item = json.item;
  if (!item) return <div>Not found</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>{item.title}</h1>
      <div>
        {item.blocks?.map((b: any, i: number) => (
          <div key={i} style={{ marginBottom: 6 }}>{b.text}</div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => fetch('/api/home/faith/journal', { method: 'POST', body: JSON.stringify({ dateISO: new Date().toISOString(), librarySlug: item.slug, title: item.title }), headers: { 'Content-Type': 'application/json' } })}>Add to Journal</button>
      </div>
    </div>
  );
}

