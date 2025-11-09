// packages/workfocus-core/chrono/engine.ts
// Chrono™ — sequencing & dependency bus (MVP stub)

export type ChronoTick = {
  id: string;           // same as eventId
  ts: string;           // ISO
  orgId: string;
  userId?: string;
  kind: string;
  sourceRef?: string;
};

export function chronoTick(t: ChronoTick) {
  // TODO: replace with Prisma/event-store publish
  try {
    const key = `chrono:${t.orgId}`;
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const list: ChronoTick[] = raw ? JSON.parse(raw) : [];
    list.unshift(t);
    localStorage?.setItem(key, JSON.stringify(list.slice(0, 500)));
  } catch {}
}