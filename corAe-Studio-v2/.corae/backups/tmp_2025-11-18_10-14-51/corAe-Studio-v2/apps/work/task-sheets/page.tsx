// apps/studio/app/work/task-sheets/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { ensureSeededSheets, setItemStatus, syncSheetToDiary, TaskSheet, ItemStatus } from './helpers';
/**
 * Local in-file fallback implementations for the tasksheets engine to avoid module resolution errors.
 * Replace these with the real package import when the monorepo/package path is correctly configured.
 */

// Helpers moved to ./helpers.ts to avoid exporting non-page symbols from the page module

const ORG_ID = 'demo-org';
const USER_ID = 'demo-user';

export default function TaskSheetsPage() {
  const [sheets, setSheets] = useState<TaskSheet[]>([]);

  useEffect(() => {
    const s = ensureSeededSheets('WORK', ORG_ID, USER_ID);
    setSheets(s.sheets);
    // initial mirror to diary
    s.sheets.forEach(sheet => syncSheetToDiary({ scope: 'WORK', orgId: ORG_ID, userId: USER_ID, sheetId: sheet.id }));
  }, []);

  function toggle(sheetId: string, itemId: string, checked: boolean) {
    const status: ItemStatus = checked ? 'DONE' : 'PENDING';
    setItemStatus({ scope: 'WORK', orgId: ORG_ID, userId: USER_ID, sheetId, itemId, status });
    const s = ensureSeededSheets('WORK', ORG_ID, USER_ID);
    setSheets([...s.sheets]);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Task Sheets</h1>
        <p style={styles.sub}>Repeatable checklists that **feed your 3Â³DTDâ„¢ Diary** automatically.</p>
      </header>

      <section style={styles.scroller} className="no-scrollbar">
        {sheets.filter(s => s.status === 'ACTIVE').map((sheet) => (
          <article key={sheet.id} style={styles.card}>
            <div style={styles.cardHead}>
              <h2 style={styles.h2}>{sheet.title}</h2>
              <span style={styles.tag}>{sheet.frequency.toLowerCase()}</span>
            </div>
            <ul style={styles.list}>
              {sheet.items.map((it) => (
                <li key={it.id} style={styles.item}>
                  <label style={styles.row}>
                    <input
                      type="checkbox"
                      checked={it.status === 'DONE'}
                      onChange={(e) => toggle(sheet.id, it.id, e.target.checked)}
                    />
                    <span style={styles.title}>{it.title}</span>
                    {it.required && <span style={styles.req}>required</span>}
                  </label>
                  {it.notes && <div style={styles.notes}>{it.notes}</div>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <style>{hideScrollbarCss}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:{maxWidth:1200,margin:'0 auto',padding:'28px 20px 80px'},
  header:{marginBottom:18},
  h1:{fontSize:22,margin:0},
  sub:{color:'#9CB1C2',marginTop:6},
  scroller:{display:'grid',gridAutoFlow:'column',gridAutoColumns:'minmax(320px, 420px)',gap:14,overflowX:'auto',paddingBottom:8},
  card:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:16,display:'grid',gap:10},
  cardHead:{display:'flex',alignItems:'center',justifyContent:'space-between'},
  h2:{fontSize:16,margin:0},
  tag:{fontSize:11,border:'1px solid rgba(255,255,255,0.18)',borderRadius:999,padding:'2px 8px',textTransform:'uppercase'},
  list:{listStyle:'none',margin:0,padding:0,display:'grid',gap:8},
  item:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:10},
  row:{display:'flex',alignItems:'center',gap:8},
  title:{fontSize:14},
  req:{marginLeft:'auto',fontSize:11,border:'1px solid rgba(255,255,255,0.18)',borderRadius:999,padding:'0 6px',textTransform:'uppercase'},
  notes:{fontSize:12,opacity:0.9,marginTop:6},
};

const hideScrollbarCss = `
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
`;
