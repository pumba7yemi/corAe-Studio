'use client';

import { useEffect, useState } from 'react';

type Preset = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: number;
  fontFamily: string;
};

const DEFAULT: Preset = {
  name: 'corAe Clean',
  primary: '#7c5cff',
  secondary: '#22c55e',
  background: '#0b0c10',
  surface: '#111217',
  text: '#eaeaf0',
  muted: '#9aa0aa',
  radius: 14,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'",
};

export default function BrandPage() {
  const [p, setP] = useState<Preset>(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    setMsg('');
  }, [p]);

  async function applyBrand() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/brand/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'apply failed');
      setMsg(`Applied: ${data.applied}. Reload the page to see full effect.`);
    } catch (e: any) {
      setMsg(`Error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  function on<K extends keyof Preset>(key: K, val: Preset[K]) {
    setP((s) => ({ ...s, [key]: val }));
  }

  return (
    <div className="wrap">
      <h1>Brand Refresh</h1>
      <p className="muted">
        Tune the corAe identity. Saving writes tokens to <code>app/globals.css</code> and stores a preset under <code>.data/brand/presets</code>.
      </p>

      <div className="grid2">
        <section className="panel">
          <h3>Colors</h3>
          <div className="fields">
            <Field label="Name">
              <input value={p.name} onChange={(e) => on('name', e.target.value)} />
            </Field>

            <Field label="Primary">
              <input type="color" value={p.primary} onChange={(e) => on('primary', e.target.value)} />
              <code>{p.primary}</code>
            </Field>

            <Field label="Secondary">
              <input type="color" value={p.secondary} onChange={(e) => on('secondary', e.target.value)} />
              <code>{p.secondary}</code>
            </Field>

            <Field label="Background">
              <input type="color" value={p.background} onChange={(e) => on('background', e.target.value)} />
              <code>{p.background}</code>
            </Field>

            <Field label="Surface">
              <input type="color" value={p.surface} onChange={(e) => on('surface', e.target.value)} />
              <code>{p.surface}</code>
            </Field>

            <Field label="Text">
              <input type="color" value={p.text} onChange={(e) => on('text', e.target.value)} />
              <code>{p.text}</code>
            </Field>

            <Field label="Muted">
              <input type="color" value={p.muted} onChange={(e) => on('muted', e.target.value)} />
              <code>{p.muted}</code>
            </Field>
          </div>

          <h3 className="mt">Shape & Font</h3>
          <div className="fields">
            <Field label={`Radius (${p.radius}px)`}>
              <input
                type="range"
                min={0}
                max={24}
                value={p.radius}
                onChange={(e) => on('radius', Number(e.target.value))}
              />
            </Field>
            <Field label="Font family">
              <input
                value={p.fontFamily}
                onChange={(e) => on('fontFamily', e.target.value)}
                placeholder="CSS font-family"
              />
            </Field>
          </div>

          <div className="row mt">
            <button className="btn primary" onClick={applyBrand} disabled={busy}>
              {busy ? 'Applying…' : 'Apply'}
            </button>
            {msg && <div className="msg">{msg}</div>}
          </div>
        </section>

        <section className="panel preview">
          <h3>Live preview</h3>
          <div
            className="preview-card"
            style={{
              ['--preview-bg' as any]: p.background,
              ['--preview-surface' as any]: p.surface,
              ['--preview-text' as any]: p.text,
              ['--preview-muted' as any]: p.muted,
              ['--preview-primary' as any]: p.primary,
              ['--preview-secondary' as any]: p.secondary,
              ['--preview-radius' as any]: `${p.radius}px`,
              ['--preview-font' as any]: p.fontFamily,
            }}
          >
            <div className="prev-head">corAe • Preview</div>
            <div className="prev-body">
              <div className="chip">Primary</div>
              <div className="chip alt">Secondary</div>
              <p>
                Text &mdash; Lorem ipsum dolor sit amet. <span className="muted">Muted</span>
              </p>
              <div className="row">
                <button className="btn primary">Do the thing</button>
                <button className="btn ghost">Maybe later</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .wrap { padding: 24px; display: grid; gap: 16px; }
        .muted { opacity: .7; }
        .grid2 { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        .panel { background: var(--surface); border: 1px solid #1f2230; border-radius: var(--radius); padding: 16px; }
        .fields { display: grid; gap: 12px; }
        .row { display: flex; gap: 12px; align-items: center; }
        .mt { margin-top: 16px; }

        input[type="color"] { width: 42px; height: 32px; border: none; background: transparent; }
        input[type="range"] { width: 200px; }
        input:not([type="color"]) {
          background: #0d0f16; color: var(--text); border: 1px solid #232636; border-radius: 10px; padding: 8px 10px;
          width: 100%;
        }

        .btn { padding: 10px 14px; border-radius: 12px; border: 1px solid #272a3a; background: #0f1118; color: var(--text); }
        .btn.primary { background: var(--primary); border-color: var(--primary); color: white; }
        .btn.ghost { background: transparent; }
        .msg { font-size: 12px; opacity: .8; }

        /* preview */
        .preview-card {
          --bg: var(--preview-bg);
          --sf: var(--preview-surface);
          --tx: var(--preview-text);
          --mu: var(--preview-muted);
          --pr: var(--preview-primary);
          --se: var(--preview-secondary);
          --ra: var(--preview-radius);
          --fo: var(--preview-font);

          background: var(--bg);
          color: var(--tx);
          border-radius: var(--ra);
          overflow: hidden;
          border: 1px solid #1f2230;
          font-family: var(--fo);
        }
        .prev-head { background: #0c0e15; padding: 12px 14px; border-bottom: 1px solid #1f2230; }
        .prev-body { padding: 14px; display: grid; gap: 10px; }
        .chip {
          display: inline-block; padding: 6px 10px; border-radius: 999px;
          background: var(--pr); color: #fff; font-size: 12px; margin-right: 8px;
        }
        .chip.alt { background: var(--se); }
      `}</style>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{props.label}</div>
      {props.children}
    </label>
  );
}
