import { NextResponse } from 'next/server';

type ScriptStep = {
  id: string;
  time?: string | null; // ISO timestamp when available
  text: string;
  source?: string;
};

async function fetchWizardLatest(originalRequest: Request) {
  try {
    const url = new URL('/api/wizard/latest', originalRequest.url).toString();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

function buildFromSnapshot(snapshot: any): ScriptStep[] {
  const out: ScriptStep[] = [];

  if (!snapshot) {
    // fallback example script
    return [
      { id: 'ex-1', time: new Date().toISOString(), text: 'Have you confirmed the client billing address?', source: 'example' },
      { id: 'ex-2', time: null, text: 'If no → Capture billing address and validate with CIMS.', source: 'example' },
      { id: 'ex-3', time: null, text: 'If yes → Proceed to order validation (OBARI).', source: 'example' },
    ];
  }

  // Prefer ordered plan entries if present
  if (Array.isArray(snapshot.plan) && snapshot.plan.length) {
    snapshot.plan.forEach((p: any, i: number) => {
      out.push({ id: `plan-${i}`, time: p?.time ?? null, text: String(p?.text ?? p), source: 'plan' });
    });
  }

  // Include haveYou prompts
  if (Array.isArray(snapshot.haveYou)) {
    snapshot.haveYou.forEach((h: any, i: number) => {
      out.push({ id: `haveyou-${i}`, time: h?.time ?? null, text: String(h?.question ?? h), source: 'haveYou' });
      if (h?.ifNo) out.push({ id: `haveyou-${i}-no`, time: null, text: `If No → ${String(h.ifNo)}`, source: 'haveYou' });
      if (h?.ifYes) out.push({ id: `haveyou-${i}-yes`, time: null, text: `If Yes → ${String(h.ifYes)}`, source: 'haveYou' });
    });
  }

  // pulse.next small actions
  if (snapshot.pulse && Array.isArray(snapshot.pulse.next)) {
    snapshot.pulse.next.forEach((p: any, i: number) => {
      out.push({ id: `pulse-${i}`, time: p?.time ?? null, text: String(p?.text ?? p), source: 'pulse' });
    });
  }

  // If nothing was collected, add a tiny fallback from snapshot.summary or title
  if (!out.length) {
    const t = snapshot.title || snapshot.summary || 'Review wizard snapshot';
    out.push({ id: 'fallback-1', time: null, text: String(t), source: 'snapshot' });
  }

  // Normalize text and ensure unique ids
  return out.map((s, i) => ({ ...s, id: s.id || `s-${i}`, text: (s.text || '').toString() }));
}

export async function GET(request: Request) {
  const snapshot = await fetchWizardLatest(request);
  const script = buildFromSnapshot(snapshot);

  return NextResponse.json({ ok: true, script });
}

export const dynamic = 'force-dynamic';
