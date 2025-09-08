"use client";
import { useEffect, useState } from "react";

type Ctx = { vertical?: string; brand?: string; tenant?: string; };
const defaultCtx: Ctx = { vertical: "hotel", brand: "sunrise-resorts", tenant: "hotel-123-downtown" };

export default function CubeMemoryPage() {
  const [ctx, setCtx] = useState<Ctx>(defaultCtx);
  const [entries, setEntries] = useState<any[]>([]);
  const [layer, setLayer] = useState<"global"|"vertical"|"brand"|"tenant">("tenant");
  const [note, setNote] = useState("");

  async function load() {
    const q = new URLSearchParams();
    if (ctx.vertical) q.set("vertical", ctx.vertical);
    if (ctx.brand) q.set("brand", ctx.brand);
    if (ctx.tenant) q.set("tenant", ctx.tenant);
    const r = await fetch(`/api/caia/memory-cube?${q.toString()}`);
    const j = await r.json();
    setEntries(j.entries || []);
  }

  async function log() {
    const r = await fetch("/api/caia/memory-cube", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ layer, ctx, entry: { type: "note", note } }),
    });
    if (r.ok) { setNote(""); load(); }
  }

  async function wipe(force = false) {
    if (!confirm(`Wipe ${layer} memory? ${layer !== "tenant" ? "This is DNA; use force carefully." : ""}`)) return;
    const r = await fetch("/api/caia/memory-cube", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ layer, ctx, force }),
    });
    if (r.ok) load();
  }

  useEffect(() => { load(); }, [ctx.vertical, ctx.brand, ctx.tenant]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CAIA Cubed Memory</h1>

      <div className="grid md:grid-cols-4 gap-3">
        <Field label="Vertical">
          <input className="border rounded px-2 py-1 w-full" value={ctx.vertical||""} onChange={e=>setCtx({ ...ctx, vertical: e.target.value })} />
        </Field>
        <Field label="Brand">
          <input className="border rounded px-2 py-1 w-full" value={ctx.brand||""} onChange={e=>setCtx({ ...ctx, brand: e.target.value })} />
        </Field>
        <Field label="Tenant">
          <input className="border rounded px-2 py-1 w-full" value={ctx.tenant||""} onChange={e=>setCtx({ ...ctx, tenant: e.target.value })} />
        </Field>
        <Field label="Layer (for write/wipe)">
          <select className="border rounded px-2 py-1 w-full" value={layer} onChange={e=>setLayer(e.target.value as any)}>
            <option value="tenant">tenant (wipeable)</option>
            <option value="brand">brand DNA</option>
            <option value="vertical">vertical DNA</option>
            <option value="global">global DNA</option>
          </select>
        </Field>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Field label="New note (writes to chosen layer)">
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 w-full" value={note} onChange={e=>setNote(e.target.value)} />
            <button onClick={log} className="px-3 py-1 border rounded">Log</button>
          </div>
        </Field>
        <Field label="Actions">
          <div className="flex gap-2">
            <button onClick={()=>wipe(false)} className="px-3 py-1 border rounded">Wipe</button>
            <button onClick={()=>wipe(true)} className="px-3 py-1 border rounded">Force Wipe (DNA)</button>
            <button onClick={load} className="px-3 py-1 border rounded">Reload</button>
          </div>
        </Field>
      </div>

      <div className="space-y-2">
        {entries.slice().reverse().map((e, i) => (
          <pre key={i} className="text-xs bg-neutral-950/60 text-neutral-100 p-2 rounded">{JSON.stringify(e, null, 2)}</pre>
        ))}
        {!entries.length && <div className="text-sm text-neutral-600">No entries yet.</div>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-neutral-600">{label}</div>{children}</div>;
}