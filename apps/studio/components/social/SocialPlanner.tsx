"use client";
import { useState } from "react";

type SocialItem = { id: string; title: string; channel: string; status: string; scheduledAt?: string; approvedBy?: string; createdAt?: string; updatedAt?: string };

export default function SocialPlanner({ domain, items: initial }: { domain: string; items: SocialItem[] }) {
  const [items, setItems] = useState<SocialItem[]>(initial ?? []);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("instagram");

  async function api(action: string, payload: any) {
    const res = await fetch("/api/social", { method: "POST", body: JSON.stringify({ action, domain, payload }) });
    if (!res.ok) { alert('api error'); return null; }
    const j = await res.json(); setItems(j.items ?? []); return j;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Social — {domain}</h2>
        <div className="flex gap-2 mt-2">
          <input className="border p-1 flex-1" placeholder="Post title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <select className="border p-1" value={channel} onChange={(e)=>setChannel(e.target.value)}>
            <option>instagram</option><option>facebook</option><option>x</option><option>tiktok</option>
          </select>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={async ()=>{ if (!title) { alert('title required'); return; } await api('draft', { title, channel }); setTitle(''); }}>Draft</button>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map(it => (
          <div key={it.id} className="border rounded p-3">
            <div className="text-sm opacity-70">{it.channel} • {it.status}</div>
            <div className="font-medium">{it.title}</div>
            <div className="mt-2 flex gap-2">
              {it.status === 'draft' && <button onClick={()=>{ const ok = confirm('Mark as approved by human?'); if (ok) api('approve', { id: it.id, approvedBy: 'human', approved: true }); }}>Approve</button>}
              {it.status === 'approved' && <button onClick={()=>{ const when = prompt('Schedule at (ISO)', new Date().toISOString()); if (when) api('schedule', { id: it.id, scheduledAt: when, humanApproved: true }); }}>Schedule</button>}
              {(it.status === 'approved' || it.status === 'scheduled') && <button onClick={()=>{ const ok = confirm('Publish now? human approved?'); if (ok) api('publish', { id: it.id, humanApproved: true }); }}>Publish</button>}
            </div>
            <div className="text-xs text-gray-500 mt-2">{it.scheduledAt ? `Scheduled: ${it.scheduledAt}` : ''}</div>
          </div>
        ))}
        {items.length === 0 && <div className="opacity-60 text-sm">No posts yet.</div>}
      </div>
    </div>
  );
}
