import React from 'react';

export default async function Page(props: any) {
  const date = props?.params?.date;
  const res = await fetch(`/api/home/faith/journal?date=${encodeURIComponent(date)}`);
  const j = await res.json();
  if (!j.ok) return <div>No journal for {date}</div>;
  const entry = j.entry;
  return (
    <div style={{ padding: 12 }}>
      <h1>Journal â€” {date}</h1>
      <div><strong>Intent:</strong> {entry.intent}</div>
      <div><strong>Prep:</strong><pre>{JSON.stringify(entry.prep,null,2)}</pre></div>
      <div><strong>Tailored Prayer:</strong><pre>{entry.tailoredPrayer}</pre></div>
    </div>
  );
}

