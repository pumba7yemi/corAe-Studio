// apps/studio/app/ship/work/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { buildNav } from '../../../src/caia/nav-builder';

/* ScrollInbox module not found at '@/src/components/ScrollInbox'; using local inline stub below */
/* TaskSheetsMini module not found at ../../src/components/TaskSheetsMini; using local inline stub below */

const ScrollInbox = ({ scope, orgId, userId, maxItems, href }: { scope: string; orgId: string; userId: string; maxItems?: number; href?: string }) => {
  return (
    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
      <div style={{ fontSize: 13, marginBottom: 6 }}>Inbox (preview)</div>
      <div style={{ fontSize: 12, color: '#9CB1C2' }}>
        {maxItems ? `No items (showing up to ${maxItems})` : 'No items'} — local stub for {scope}
      </div>
      {href && (
        <a href={href} style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#B8FFDA', textDecoration: 'none' }}>
          Open
        </a>
      )}
    </div>
  );
};

/**
 * Order: CAIA → Pulse → Diary → CIMS → Workflow
 * Use string hrefs (not objects) for consistency across cards.
 */
const MODULES = [
  { id: 'caia',    title: 'CAIA™',   subtitle: 'Always-on assistant',        href: '/ship/work/caia',   badge: 'online' },
  { id: 'pulse',   title: 'Pulse™',  subtitle: 'Live metrics & mood',        href: '/ship/work/pulse' },
  { id: 'diary',   title: '3³DTD™',  subtitle: 'Top 3 · Inbox · Ongoing',    href: '/ship/work/diary' },
  { id: 'cims',    title: 'CIMS™',   subtitle: 'Internal Messaging System',  href: '/ship/work/cims',   badge: 'beta' },
  { id: 'workflow',title: 'Workflow™',subtitle: 'Your dept automations',     href: '/ship/work/workflow' },
];

export default function WorkHubPage() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const username = 'Workflow Partner';
  const orgId = 'demo-org';
  const userId = 'demo-user';

  return (
    <main style={styles.page}>
      <nav style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {buildNav().work.map((n: any) => (
          <Link key={n.href} href={n.href as unknown as any} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>{n.label}</Link>
        ))}
      </nav>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>corAe • Work</div>
        <div style={styles.right}>
          <button type="button" style={styles.username} onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <span>{username}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" style={{ marginLeft: 6 }}>
              <path fill="currentColor" d="M0 0l5 6 5-6z" />
            </svg>
          </button>
          {userMenuOpen && (
            <div style={styles.dropdown}>
              <Link href={"/ship/home" as unknown as any} style={styles.dropItem}>🏠 Go to Home OS</Link>
              <Link href={"/ship/business" as unknown as any} style={styles.dropItem}>🏢 Switch to Business</Link>
              <hr style={styles.hr} />
              <button style={styles.dropItemBtn}>⚙️ Settings</button>
              <button style={styles.dropItemBtn}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </header>

      {/* Greeting */}
      <section style={styles.welcome}>
        <h1 style={styles.h1}>Good morning, {username.split(' ')[0]} 👋</h1>
        <p style={styles.sub}>Your workday hub — CAIA™, Pulse™, 3³DTD™, CIMS™, Workflow™.</p>
      </section>

      {/* Top modules scroller */}
      <section>
        <div style={styles.scroller} className="no-scrollbar">
          {MODULES.map((m) => (
            <article key={m.id} style={styles.card}>
              <h2 style={styles.cardTitle}>
                {m.title}{' '}
                {m.badge && <span style={styles.badge}>{m.badge}</span>}
              </h2>
              <p style={styles.cardSub}>{m.subtitle}</p>
              <div style={styles.cardFooter}>
                <Link href={m.href as unknown as any} style={styles.btn}>Open</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Live panes: Diary quick view + Task Sheets mini */}
      <section style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr', alignItems: 'start' }}>
        <div>
          <ScrollInbox scope="WORK" orgId={orgId} userId={userId} maxItems={10} href="/ship/work/diary" />
        </div>
        <div>
          <TaskSheetsMini scope="WORK" orgId={orgId} userId={userId} href="/ship/work/task-sheets" limit={3} />
        </div>
      </section>

      <style>{hideScrollbarCss}</style>
    </main>
  );
}

/* ─────────── Styles ─────────── */
const styles: Record<string, React.CSSProperties> = {
  page:{maxWidth:1280,margin:'0 auto',padding:'28px 20px 80px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,position:'relative'},
  logo:{fontWeight:600,fontSize:14,color:'#8BA3B7',textTransform:'uppercase'},
  right:{position:'relative'},
  username:{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:13},
  dropdown:{position:'absolute',right:0,top:'110%',background:'rgba(20,20,20,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,minWidth:180,zIndex:100,display:'flex',flexDirection:'column'},
  dropItem:{color:'#fff',textDecoration:'none',fontSize:13,padding:'8px 12px'},
  dropItemBtn:{background:'none',border:'none',color:'#fff',fontSize:13,textAlign:'left',padding:'8px 12px',cursor:'pointer'},
  hr:{margin:'4px 0',border:'none',borderTop:'1px solid rgba(255,255,255,0.1)'},
  welcome:{marginBottom:24},
  h1:{fontSize:24,margin:0},
  sub:{color:'#9CB1C2',marginTop:6},
  scroller:{display:'grid',gridAutoFlow:'column',gridAutoColumns:'minmax(260px, 300px)',gap:14,overflowX:'auto',paddingBottom:8,scrollSnapType:'x mandatory'},
  card:{scrollSnapAlign:'start',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:18,display:'flex',flexDirection:'column',justifyContent:'space-between',minHeight:140},
  cardTitle:{fontSize:16,margin:0},
  cardSub:{fontSize:13,color:'#9CB1C2',marginTop:6},
  cardFooter:{marginTop:12,display:'flex',justifyContent:'flex-end'},
  btn:{padding:'8px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',textDecoration:'none',fontSize:13},
  badge:{marginLeft:6,padding:'2px 6px',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,fontSize:10,textTransform:'uppercase',color:'#B8FFDA'},
};

const TaskSheetsMini = ({ scope, orgId, userId, href, limit }: { scope: string; orgId: string; userId: string; href?: string; limit?: number }) => {
  return (
    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
      <div style={{ fontSize: 13, marginBottom: 6 }}>Task Sheets (preview)</div>
      <div style={{ fontSize: 12, color: '#9CB1C2' }}>No data — local stub for {scope}</div>
      {href && (
        <a href={href} style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#B8FFDA', textDecoration: 'none' }}>
          Open
        </a>
      )}
    </div>
  );
};

const hideScrollbarCss = `
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
`;