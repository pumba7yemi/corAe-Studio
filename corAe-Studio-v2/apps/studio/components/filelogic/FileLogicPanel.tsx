"use client";
import { useState } from "react";

type FLItem = {
  id: string;
  name: string;
  path: string;
  owner?: string;
  flags?: string[];
  role?: string;
  updatedAt: string;
};

export default function FileLogicPanel({ domain, items: initial }: { domain: string; items: FLItem[] }) {
  const [items, setItems] = useState<FLItem[]>(initial ?? []);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  async function api(action: string, payload: any) {
    const res = await fetch("/api/filelogic", { method: "POST", body: JSON.stringify({ action, domain, payload }) });
    if (!res.ok) {
      alert("API error");
      return null;
    }
    const j = await res.json();
    setItems(j.items ?? []);
    return j;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">FileLogic — {domain}</h2>
        <div className="flex gap-2 mt-2">
          <input className="border p-1 flex-1" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="border p-1 w-64" placeholder="Path" value={path} onChange={(e)=>setPath(e.target.value)} />
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={async ()=>{
            if (!name || !path) { alert('name and path required'); return; }
            await api('create', { name, path }); setName(''); setPath('');
          }}>Create</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-600"><th className="p-2">Name</th><th>Path</th><th>Owner</th><th>Flags</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.name}</td>
                <td className="p-2">{i.path}</td>
                <td className="p-2">{i.owner ?? '-'}</td>
                <td className="p-2">{(i.flags ?? []).join(', ')}</td>
                <td className="p-2 text-xs text-gray-500">{i.updatedAt}</td>
                <td className="p-2">
                  <button className="text-sm mr-2" onClick={()=>{ const newPath = prompt('New path', i.path); if (newPath) api('move', { id: i.id, path: newPath }); }}>Move</button>
                  <button className="text-sm mr-2" onClick={()=>{ api('lock', { id: i.id, lock: true }); }}>Lock</button>
                  <button className="text-sm mr-2" onClick={()=>{ api('share', { id: i.id, share: true }); }}>Share</button>
                  <button className="text-sm" onClick={()=>{ api('approve', { id: i.id, approve: true }); }}>Approve</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-sm text-gray-500">No files yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
