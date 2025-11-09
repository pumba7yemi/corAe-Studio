// src/components/ScrollInbox.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Local lightweight stub for '@workfocus-core/diary/engine' to avoid missing-module errors.
// Replace these with the real implementations or proper package import in production.
type Scope = 'WORK' | 'HOME';
type DiaryEntry = {
  id: string;
  title: string;
  notes?: string;
  bucket?: 'INBOX' | 'ONGOING' | string;
  createdAt: string | number;
  source?: string;
};

function ensureSeeded(scope: Scope, orgId?: string, userId?: string) {
  // Returns an object with an entries array; real implementation should provide actual data.
  const demo: DiaryEntry[] = [
    { id: 'seed-1', title: 'Welcome', notes: 'Demo inbox item', bucket: 'INBOX', createdAt: Date.now(), source: 'ORG_SEED' },
    { id: 'seed-2', title: 'Ongoing sample', notes: 'Demo ongoing item', bucket: 'ONGOING', createdAt: Date.now() - 1000 * 60, source: 'ORG_SEED' },
  ];
  return { entries: demo };
}

function chronoOrder(entries: DiaryEntry[]) {
  return [...entries].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

type Props = {
  scope?: Scope;        // 'WORK' | 'HOME' (default: WORK)
  orgId?: string;       // current org
  userId?: string;      // current user
  maxItems?: number;    // limit shown in scroll window
  href?: string;        // link to full diary page
};

/**
 * corAe • ScrollInbox (shared)
 * Displays the user's Inbox and Ongoing entries from 3³DTD™ Diary.
 * Used inside Work Hub, Home Hub, or any summary page.
 */
export default function ScrollInbox({
  scope = 'WORK',
  orgId = 'demo-org',
  userId = 'demo-user',
  maxItems = 12,
  href = scope === 'WORK' ? '/ship/work/diary' : '/ship/home/diary',
}: Props) {
  const [list, setList] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const s = ensureSeeded(scope, orgId, userId);
    setList(s.entries);
  }, [scope, orgId, userId]);

  const inbox = useMemo(
    () => chronoOrder(list.filter((e: DiaryEntry) => e.bucket === 'INBOX')).slice(0, maxItems),
    [list, maxItems]
  );
  const ongoing = useMemo(
    () => chronoOrder(list.filter((e: DiaryEntry) => e.bucket === 'ONGOING')).slice(0, maxItems),
    [list, maxItems]
  );

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.rowHead}>
        <h3 style={styles.h3}>Diary — Quick View</h3>
        <Link href={href as any} style={styles.linkBtn}>
          Open full diary
        </Link>
      </div>

      {/* Scroll area */}
      <div style={styles.scroller} className="no-scrollbar">
        {/* Inbox */}
        <section style={styles.column}>
          <header style={styles.colHead}>
            <span style={styles.pill}>Inbox</span>
          </header>
          <div style={styles.list}>
            {inbox.length > 0 ? (
              inbox.map((item: DiaryEntry): JSX.Element => (
                <Link key={item.id} href={href as any} style={styles.card}>
                  <strong style={styles.title}>{item.title}</strong>
                  {item.notes && <p style={styles.notes}>{item.notes}</p>}
                  <div style={styles.meta}>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    {item.source === 'ORG_SEED' && (
                      <span style={styles.seed}>seed</span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div style={styles.empty}>No inbox items.</div>
            )}
          </div>
        </section>

        {/* Ongoing */}
        <section style={styles.column}>
          <header style={styles.colHead}>
            <span style={styles.pillAlt}>Ongoing</span>
          </header>
          <div style={styles.list}>
            {ongoing.length > 0 ? (
                ongoing.map((item: DiaryEntry) => (
                    <Link key={item.id} href={href as any} style={styles.card}>
                        <strong style={styles.title}>{item.title}</strong>
                        {item.notes && <p style={styles.notes}>{item.notes}</p>}
                        <div style={styles.meta}>
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                            {item.source === 'ORG_SEED' && (
                                <span style={styles.seed}>seed</span>
                            )}
                        </div>
                    </Link>
                ))
            ) : (
                <div style={styles.empty}>No ongoing items.</div>
            )}
          </div>
        </section>
      </div>

      <style>{hideScrollbarCss}</style>
    </div>
  );
}

/* ─────────── Styles ─────────── */
const styles: Record<string, React.CSSProperties> = {
  wrap:{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 },
  rowHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  h3:{ margin:0, fontSize:16 },
  linkBtn:{ fontSize:12, border:'1px solid rgba(255,255,255,0.18)', borderRadius:999, padding:'6px 10px', textDecoration:'none' },
  scroller:{ display:'grid', gridAutoFlow:'column', gridAutoColumns:'minmax(260px, 360px)', gap:12, overflowX:'auto', paddingBottom:6, scrollSnapType:'x mandatory' },
  column:{ scrollSnapAlign:'start' as any, display:'flex', flexDirection:'column', gap:8 },
  colHead:{ display:'flex', alignItems:'center', gap:8, marginBottom:4 },
  pill:{ fontSize:11, textTransform:'uppercase', border:'1px solid rgba(255,255,255,0.18)', padding:'2px 8px', borderRadius:999 },
  pillAlt:{ fontSize:11, textTransform:'uppercase', border:'1px solid rgba(255,255,255,0.18)', padding:'2px 8px', borderRadius:999 },
  list:{ display:'grid', gap:8 },
  card:{ display:'grid', gap:6, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:12, textDecoration:'none', color:'inherit', background:'rgba(255,255,255,0.04)' },
  title:{ fontSize:14 },
  notes:{ fontSize:12, opacity:0.9, margin:0 },
  meta:{ display:'flex', gap:8, fontSize:11, opacity:0.8 },
  seed:{ marginLeft:'auto', border:'1px solid rgba(255,255,255,0.18)', padding:'0 6px', borderRadius:999, fontSize:10, textTransform:'uppercase' },
  empty:{ opacity:0.6, fontSize:12, padding:'6px 0' },
};

const hideScrollbarCss = `
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
`;