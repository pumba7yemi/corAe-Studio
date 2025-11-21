"use client";

import React, { useEffect, useState } from 'react';

type ShipConfig = {
  id: string;
  name: string;
  profile: 'STRICT'|'STANDARD'|'LAB';
  allowSensitiveCategories: boolean;
  allowedSensitiveCategories?: string[];
  overrides?: Record<string, number> | null;
};

export default function ShipGovernanceConsolePage(){
  const [shipId, setShipId] = useState('demo-ship');
  const [config, setConfig] = useState<ShipConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ fetchConfig(); }, []);

  async function fetchConfig(){
    setLoading(true);
    try{
      const r = await fetch(`/api/ships/${shipId}/config`);
      const j = await r.json();
      if(j.ok) setConfig(j.config ?? { id: shipId, name: shipId, profile: 'STRICT', allowSensitiveCategories:false, allowedSensitiveCategories:[] });
    }catch(e){ console.warn(e); }
    setLoading(false);
  }

  async function save(){
    if(!config) return;
    setSaving(true);
    try{
      const r = await fetch(`/api/ships/${shipId}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      const j = await r.json();
      if(j.ok) setConfig(j.saved);
    }catch(e){ console.warn(e); }
    setSaving(false);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Ship Governance Console (Studio)</h1>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs">Ship ID</label>
          <input value={shipId} onChange={e=>setShipId(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={fetchConfig} className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2">Load</button>
        </div>
      </div>

      {loading && <div className="text-sm text-zinc-400">Loading…</div>}

      {config && (
        <div className="space-y-3">
          <div>
            <label className="text-xs">Name</label>
            <input value={config.name} onChange={e=>setConfig({...config, name: e.target.value})} className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs">Profile</label>
            <select value={config.profile} onChange={e=>setConfig({...config, profile: e.target.value as any})} className="w-full rounded-xl border px-3 py-2 text-sm">
              <option value="STRICT">STRICT</option>
              <option value="STANDARD">STANDARD</option>
              <option value="LAB">LAB</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.allowSensitiveCategories} onChange={e=>setConfig({...config, allowSensitiveCategories: e.target.checked})} />
            <span className="text-sm">Allow sensitive categories</span>
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 text-white px-4 py-2">{saving? 'Saving…':'Save'}</button>
            <button onClick={fetchConfig} className="rounded-xl border px-4 py-2">Reload</button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">Creation is template-first and capped to prevent uncontrolled growth.</div>
    </div>
  );
}
