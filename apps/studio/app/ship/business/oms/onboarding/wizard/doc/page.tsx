'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// Use your working long-path UI imports
import { Card, CardContent } from '../../../../../../../../../src/components/ui/card';
import { Button } from '../../../../../../../../../src/components/ui/button';
import { Separator } from '../../../../../../../../../src/components/ui/separator';
import { Input } from '../../../../../../../../../src/components/ui/input';
import ArrowNav from '@/components/navigation/ArrowNav';

// Bridge (single source of truth) — named-only imports
import {
  initialState as makeInitial,
  persistDraft,
  submitFirstTrade,
  type FirstTradeState,
} from '../../../../../../../../../packages/workfocus-core/wizard/first-trade.flow';

/* ------------------------------------------------------------------ */
/* CAIA-ish doc <-> FirstTradeState mappers (local to this page)      */
/* ------------------------------------------------------------------ */

type DocShape = {
  companyMode?: 'sales' | 'procurement';
  counterparty_name?: string;
  counterparty_id?: string;
  site_id?: string;
  site_name?: string;
  our_name?: string;
  our_id?: string;

  schedule_kind?: 'scheduled' | 'ad_hoc';
  schedule_rule?: string;
  schedule_day?: string;
  schedule_window?: string;

  transport_mode?: 'vendor' | 'third_party' | 'client';
  transport_in_quote?: boolean;

  geo_country?: string;
  geo_region?: string;
  geo_postcode?: string;

  ref_client_po?: string;
  ref_quote_id?: string;
  notes?: string;

  [k: `line${number}_${'sku'|'title'|'uom'|'qty'|'sector'|'price_major'}`]: string | number | undefined;
};

const LS_KEY = 'corAe.firstTrade.draft';

// tiny helpers
const toBool = (v?: string) => ['1','true','yes','y','on'].includes(String(v||'').trim().toLowerCase());
const toNum  = (v?: string) => {
  const n = Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : 0;
};

// Local fallback loader for drafts (reads from localStorage).
// The upstream package no longer exports loadDraft, so keep a lightweight client-side loader here.
async function loadDraft(): Promise<FirstTradeState | null> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstTradeState;
  } catch {
    return null;
  }
}
// --- state -> CAIA doc
function stateToDoc(s: FirstTradeState): string {
  const a = s as any;
  const lines: string[] = [];

  lines.push(`# corAe First-Trade (CAIA editable)`);
  lines.push(`companyMode: ${a['companyMode'] ?? 'sales'}`);
  lines.push(`counterparty_name: ${a.counterparty?.name ?? ''}`);
  lines.push(`counterparty_id: ${a.counterparty?.id ?? ''}`);
  if (a.counterparty?.siteId)   lines.push(`site_id: ${a.counterparty.siteId}`);
  if (a.counterparty?.siteName) lines.push(`site_name: ${a.counterparty.siteName}`);
  lines.push(`our_name: ${a.ourParty?.name ?? 'Operations'}`);
  lines.push(`our_id: ${a.ourParty?.id ?? 'OPS'}`);

  const kind = a.schedule?.kind ?? 'scheduled';
  lines.push(`schedule_kind: ${kind}`);
  if (kind === 'scheduled') {
    lines.push(`schedule_rule: ${a.schedule?.rule ?? 'EVERY_4_WEEKS'}`);
    if (a.schedule?.day)    lines.push(`schedule_day: ${a.schedule.day}`);
    if (a.schedule?.window) lines.push(`schedule_window: ${a.schedule.window}`);
  }

  lines.push(`transport_mode: ${a.transport?.mode ?? 'third_party'}`);
  lines.push(`transport_in_quote: ${Boolean(a.transport?.inQuote) ? 'true' : 'false'}`);

  lines.push(`geo_country: ${a.geography?.country ?? 'UK'}`);
  lines.push(`geo_region: ${a.geography?.region ?? 'GEN'}`);
  lines.push(`geo_postcode: ${a.geography?.postcode ?? 'GEN1'}`);

  if (a.references?.clientPO)  lines.push(`ref_client_po: ${a.references.clientPO}`);
  if (a.references?.quoteId)   lines.push(`ref_quote_id: ${a.references.quoteId}`);
  if (a.notes)                 lines.push(`notes: ${a.notes}`);

  const items = a.lines ?? [];
  items.forEach((l: any, i: number) => {
    const idx = i + 1;
    lines.push(`line${idx}_sku: ${l.sku ?? ''}`);
    lines.push(`line${idx}_title: ${l.title ?? ''}`);
    lines.push(`line${idx}_uom: ${l.uom ?? 'EA'}`);
    lines.push(`line${idx}_qty: ${l.qty ?? 1}`);
    lines.push(`line${idx}_sector: ${l.sector ?? 'other'}`);
    lines.push(`line${idx}_price_major: ${Number(l.unitPriceMajor ?? l.unitPrice ?? 0).toFixed(2)}`);
  });

  return lines.join('\n');
}

// --- CAIA doc -> state
function docToState(src: string, prev?: FirstTradeState): { state?: FirstTradeState; error?: string } {
  try {
    const pairs = src
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => {
        const i = l.indexOf(':');
        if (i < 0) return null;
        const k = l.slice(0, i).trim();
        const v = l.slice(i + 1).trim();
        return [k, v] as const;
      })
      .filter(Boolean) as Array<readonly [string, string]>;

    const dict: Record<string, string> = Object.fromEntries(pairs);

    const next: any = prev ? { ...prev } : makeInitial();

    // company / parties
    next.companyMode = (dict.companyMode as any) || next.companyMode;
    next.counterparty = {
      ...(next.counterparty || {}),
      id: dict.counterparty_id || next.counterparty?.id || '',
      name: dict.counterparty_name || next.counterparty?.name || '',
      siteId: dict.site_id || (next.counterparty as any)?.siteId || '',
      siteName: dict.site_name || (next.counterparty as any)?.siteName || '',
    };
    next.ourParty = {
      ...(next.ourParty || {}),
      id: dict.our_id || next.ourParty?.id || 'OPS',
      name: dict.our_name || next.ourParty?.name || 'Operations',
    };

    // schedule
    const sk = (dict.schedule_kind as any) || next.schedule?.kind || 'scheduled';
    if (sk === 'ad_hoc') {
      next.schedule = { kind: 'ad_hoc' };
    } else {
      next.schedule = {
        kind: 'scheduled',
        rule: dict.schedule_rule || next.schedule?.rule || 'EVERY_4_WEEKS',
        day: dict.schedule_day || next.schedule?.day || undefined,
        window: dict.schedule_window || next.schedule?.window || undefined,
      };
    }

    // transport
    next.transport = {
      mode: (dict.transport_mode as any) || next.transport?.mode || 'third_party',
      inQuote: toBool(dict.transport_in_quote) ?? Boolean(next.transport?.inQuote),
    };

    // geography
    next.geography = {
      country: dict.geo_country || next.geography?.country || 'UK',
      region: dict.geo_region || next.geography?.region || 'GEN',
      postcode: dict.geo_postcode || next.geography?.postcode || 'GEN1',
    };

    // refs/notes
    next.references = {
      ...(next.references || {}),
      clientPO: dict.ref_client_po || (next.references as any)?.clientPO || '',
      quoteId: dict.ref_quote_id || (next.references as any)?.quoteId || '',
      productIds: (next.references as any)?.productIds || [],
    };
    next.notes = dict.notes || next.notes || '';

    // lines
    const outLines: any[] = [];
    for (let i = 1; i <= 50; i++) {
      const sku = dict[`line${i}_sku`];
      const title = dict[`line${i}_title`];
      const qty = dict[`line${i}_qty`];
      const uom = dict[`line${i}_uom`];
      const sector = dict[`line${i}_sector`];
      const price = dict[`line${i}_price_major`];
      const present = [sku, title, qty, uom, sector, price].some(v => v !== undefined);
      if (!present) continue;
      outLines.push({
        sku: sku || `Product${String(i).padStart(4, '0')}`,
        title: title || sku || 'Product',
        qty: toNum(qty || '1'),
        uom: uom || 'EA',
        sector: sector || 'other',
        unitPriceMajor: Number.isFinite(Number(price)) ? Number(price) : 0,
      });
    }
    next.lines = outLines.length ? outLines : (next.lines?.length ? next.lines : [
      { sku: 'Product0001', title: 'Seed Item', qty: 1, uom: 'EA', unitPriceMajor: 0, sector: 'other' },
    ]);

    return { state: next as FirstTradeState };
  } catch (e: any) {
    return { error: e?.message || 'Failed to parse document' };
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function FirstTradeDocumentPage() {
  const router = useRouter();

  // Safe initial (SSR-ok), then optional client rehydrate
  const [draft, setDraft] = useState<FirstTradeState>(() => makeInitial());
  useEffect(() => {
    (async () => {
      try {
        const d = typeof loadDraft === 'function' ? await loadDraft() : null;
        if (d) {
          setDraft(d);
          setDoc(stateToDoc(d));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // bind to textarea
  const [doc, setDoc] = useState<string>(() => stateToDoc(draft));
  const [parseErr, setParseErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // keep textarea in sync if an external save happened
  useEffect(() => {
    setDoc(stateToDoc(draft));
  }, [draft]);

  // live parse preview
  const preview = useMemo(() => {
    const res = docToState(doc, draft);
    setParseErr(res.error ?? null);
    return res.state;
  }, [doc]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFromWizard() {
    const s = await loadDraft().catch(() => null);
    if (s) {
      setDraft(s);
      setDoc(stateToDoc(s));
      setMsg('Loaded draft from Wizard.');
    } else {
      setMsg('No saved Wizard draft found.');
    }
  }

  function saveToWizard() {
    const res = docToState(doc, draft);
    if (!res.state) {
      setParseErr(res.error || 'Invalid document');
      return;
    }
    persistDraft(res.state);
    setDraft(res.state);
    setMsg('Saved to Wizard draft.');
  }

  async function submit() {
    const res = docToState(doc, draft);
    if (!res.state) {
      setParseErr(res.error || 'Invalid document');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const out = await submitFirstTrade(res.state);
      if ('snapshot_id' in out) {
        const id = out.snapshot_id;
        const order = out.order_numbers
          ? (out.order_numbers.po_no ? `PO ${out.order_numbers.po_no}` : out.order_numbers.so_no ? `SO ${out.order_numbers.so_no}` : '')
          : '';
        setMsg(`✅ Workflow started • ${id}${order ? ' • ' + order : ''}`);
      } else if ('ok' in out) {
        // fallback for legacy shape
        const o = out as any;
        setMsg(o.ok ? `✅ Workflow started • ${o.runId || ''}` : `❌ ${o.error || 'Submit failed'}`);
      } else {
        // unknown shape — show raw info
        setMsg(`✅ Workflow started • ${JSON.stringify(out)}`);
      }
    } catch (e: any) {
      setMsg(`❌ ${e?.message || 'Submit failed'}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">First-Trade — CAIA Document</h1>
        <p className="muted">Edit as a structured document. This syncs with the Wizard draft.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={loadFromWizard}>Load from Wizard</Button>
            <Button onClick={saveToWizard}>Save to Wizard</Button>
            <Button variant="outline" onClick={() => router.push('/wizard')}>Open Wizard</Button>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="default" onClick={submit} disabled={busy || !!parseErr}>
                {busy ? 'Submitting…' : 'Submit to OBARI'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Editor */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-sm font-semibold mb-2">Document</div>
              <textarea
                className="w-full h-[520px] border rounded-lg p-3 bg-surface font-mono text-sm"
                spellCheck={false}
                value={doc}
                onChange={(e) => setDoc(e.target.value)}
              />
              {parseErr && <div className="mt-2 text-sm text-red-400">Parse error: {parseErr}</div>}
            </div>

            <div className="rounded-xl border p-3 bg-card">
              <div className="text-sm font-semibold mb-2">Preview (key fields)</div>
              {preview ? (
                <div className="grid gap-2 text-sm">
                  <Row k="Mode" v={(preview as any).companyMode === 'procurement' ? 'We Buy' : 'We Sell'} />
                  <Row k="Counterparty" v={`${(preview as any).counterparty?.name ?? '—'}${(preview as any).counterparty?.siteName ? ' • ' + (preview as any).counterparty?.siteName : ''}`} />
                  <Row
                    k="Schedule"
                    v={
                      (preview as any).schedule?.kind === 'ad_hoc'
                        ? 'Ad-hoc'
                        : `${(preview as any).schedule?.rule ?? 'EVERY_4_WEEKS'}${(preview as any).schedule?.day ? ' • ' + (preview as any).schedule.day : ''}`
                    }
                  />
                  <Row
                    k="Transport"
                    v={`${String((preview as any).transport?.mode || 'third_party')}${
                      (preview as any).transport?.inQuote ? ' • in-quote' : ''
                    }`}
                  />
                  <Row
                    k="Geography"
                    v={`${(preview as any).geography?.country ?? 'UK'} • ${(preview as any).geography?.region ?? 'GEN'} • ${(preview as any).geography?.postcode ?? 'GEN1'}`}
                  />
                  <div className="mt-2 rounded-xl border p-2">
                    <div className="text-xs text-muted mb-1">Lines</div>
                    <div className="grid gap-1">
                      {((preview as any).lines ?? []).map((l: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="font-mono">{l.sku}</span>
                          <span className="opacity-80">{l.title}</span>
                          <span className="opacity-80">
                            {l.qty} × £{Number(l.unitPriceMajor ?? l.unitPrice ?? 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {((preview as any).lines ?? []).length === 0 && (
                        <div className="text-xs text-muted">No lines.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted">No preview (parse error).</div>
              )}
            </div>
          </div>

          {msg && (
            <>
              <Separator />
              <div className="text-sm">{msg}</div>
            </>
          )}
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/wizard"
        nextHref="/ship/business/oms/obari/thedeal/bdo/bdo-ready"
        nextLabel="BDO Ready"
      >
        CAIA Document
      </ArrowNav>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-muted">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}