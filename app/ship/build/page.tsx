'use client';

import { useEffect, useMemo, useState } from 'react';
import { PRESETS } from '@/ship/presets';
import CaiaCard from '@/components/CaiaCard';

type Config = {
  brandType: 'corae' | 'white-label';
  vertical: keyof typeof PRESETS;
  brandName?: string;
  modules: string[];
  ts: string;
} | null;

export default function ShipBuildPage() {
  const [brandType, setBrandType] = useState<'corae' | 'white-label'>('corae');
  const [vertical, setVertical] = useState<keyof typeof PRESETS>('supermarket');
  const [brandName, setBrandName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Config>(null);
  const [err, setErr] = useState<string>('');

  const modules = useMemo(() => PRESETS[vertical].modules, [vertical]);

  useEffect(() => {
    fetch('/api/ship/build/apply')
      .then(r => r.json())
      .then(d => {
        const cfg = d?.config as Config;
        if (cfg) {
          setBrandType(cfg.brandType);
          setVertical(cfg.vertical);
          setBrandName(cfg.brandName || '');
          setSaved(cfg);
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/ship/build/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandType, vertical, brandName }),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'Failed to save');
      setSaved(out.config as Config);
    } catch (e: any) {
      setErr(e?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <a href="/ship" className="text-sm underline">← Ship</a>
      <h1 className="text-3xl font-semibold">🚢 Ship Build</h1>
      <p className="opacity-70">
        Choose brand type and vertical. We’ll preset all modules (POS, Bookings,
        Inventory, etc.) and log the selection.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Brand Type</div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="brandType"
                  value="corae"
                  checked={brandType === 'corae'}
                  onChange={() => setBrandType('corae')}
                />
                corAe
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="brandType"
                  value="white-label"
                  checked={brandType === 'white-label'}
                  onChange={() => setBrandType('white-label')}
                />
                White label
              </label>
            </div>
          </div>

          {brandType === 'white-label' && (
            <label className="grid gap-1">
              <span className="text-sm">White-label Name</span>
              <input
                className="border rounded-lg p-2"
                placeholder="e.g., Choice Plus Supermarket"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
              />
            </label>
          )}

          <div>
            <div className="text-sm font-medium mb-1">Vertical</div>
            <select
              className="border rounded-lg p-2"
              value={vertical}
              onChange={e =>
                setVertical(e.target.value as keyof typeof PRESETS)
              }
            >
              {Object.values(PRESETS).map(p => (
                <option key={p.vertical} value={p.vertical}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl border shadow px-4 py-2 hover:bg-gray-100"
          >
            {saving ? 'Saving…' : 'Apply Preset'}
          </button>

          {err && <div className="text-sm text-red-600">{err}</div>}
          {saved && (
            <div className="text-xs opacity-70">
              Saved: {new Date(saved.ts).toLocaleString()}
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-4 shadow">
          <div className="text-sm font-medium">
            Preset Modules for{' '}
            <span className="font-semibold">{PRESETS[vertical].label}</span>
          </div>
          <ul className="mt-2 list-disc ml-5 text-sm space-y-1">
            {modules.map(m => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="mt-4 text-xs opacity-70">
            After applying, run your One-Build to scaffold the selected modules,
            or wire your runner to consume{' '}
            <code>build/.data/ship/build.json</code>.
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CaiaCard
          href="/ship/caia"
          label="🧠 CAIA (Ship)"
          subtitle="Ask setup questions"
        />
        <a
          href="/ship/business"
          className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold">🏢 Business</h2>
          <p className="text-sm text-gray-600 mt-2">Go to OMS/OBARI flows</p>
        </a>
        <a
          href="/dockyard/build/log"
          className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold">📜 Build Log</h2>
          <p className="text-sm text-gray-600 mt-2">
            See the recorded apply event
          </p>
        </a>
      </div>
    </div>
  );
}