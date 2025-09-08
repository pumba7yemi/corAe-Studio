'use client';
import React from 'react';
type Item = { id:string; subject?:string; channel?:string; to?:string; _risk?:number };
function useLoad<T>(url:string, deps:any[]=[]){
  const [data,setData]=React.useState<T|null>(null);
  React.useEffect(()=>{ fetch(url).then(r=>r.json()).then(setData as any); }, deps);
  return data;
}
export default function CIMS(){
  const state = useLoad<any>('/cims/api/queue', []);
  async function seed(){ await fetch('/cims/api/seed',{method:'POST'}); location.reload(); }
  async function approve(id:string){ await fetch('/cims/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); location.reload(); }
  return (<main className="mx-auto max-w-5xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">CIMS — Auto-Comms (AI-first, Overseer-gated)</h1>
    <p>All comms are AI-drafted; high-risk items require overseer approval. Low-risk auto-send permitted by policy.</p>
    <button onClick={seed} className="px-3 py-2 rounded bg-black text-white">Generate Sample Draft</button>

    {!state && <div className="text-sm text-zinc-500">Loading…</div>}
    {state && (<div className="grid md:grid-cols-3 gap-4">
      {['drafts','outbox','sent'].map((lane)=>(
        <div key={lane} className="border rounded-xl p-4">
          <div className="font-semibold capitalize">{lane}</div>
          <div className="mt-2 space-y-2">
            {state[lane].length===0 && <div className="text-xs text-zinc-500">Empty</div>}
            {state[lane].map((it:Item)=>(
              <div key={it.id} className="text-sm border rounded p-2">
                <div className="font-medium">{it.subject||it.id}</div>
                <div className="text-xs text-zinc-500">{it.channel} → {it.to} {it._risk!=null && <span>• risk {it._risk}</span>}</div>
                {lane==='outbox' && <button onClick={()=>approve(it.id)} className="mt-2 text-xs px-2 py-1 rounded bg-emerald-600 text-white">Approve & Send</button>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>)}
  </main>);
}
