// apps/studio/app/ship/work/diary/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Bucket = 'PRIORITY' | 'INBOX' | 'ONGOING';
type Status = 'OPEN' | 'DOING' | 'DONE';

type Entry = {
  id: string;
  title: string;
  notes?: string;
  bucket: Bucket;
  status: Status;
  createdAt: string;   // ISO
  dueAt?: string;      // ISO
  tags?: string[];
};

const STORAGE_KEY = 'work:3c-diary';

const BUCKETS: { key: Bucket; title: string; hint: string; limit?: number }[] = [
  { key: 'PRIORITY', title: 'Top 3', hint: 'Your three most important tasks today', limit: 3 },
  { key: 'INBOX',    title: 'Inbox', hint: 'Everything new goes here first' },
  { key: 'ONGOING',  title: 'Ongoing', hint: 'Longer-running tasks and follow-ups' },
];

export default function DiaryPage() {
  const [list, setList] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<{ title: string; notes: string; bucket: Bucket }>({
    title: '',
    notes: '',
    bucket: 'INBOX',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, [list]);

  const byBucket = useMemo(() => {
    const map: Record<Bucket, Entry[]> = { PRIORITY: [], INBOX: [], ONGOING: [] };
    for (const e of list) map[e.bucket].push(e);
    // light sorting: OPEN first, then DOING, then DONE
    (Object.keys(map) as Bucket[]).forEach((b) => {
      map[b].sort((a, b) => (statusRank(a.status) - statusRank(b.status)) || (a.createdAt > b.createdAt ? 1 : -1));
    });
    return map;
  }, [list]);

  function statusRank(s: Status) { return s === 'OPEN' ? 0 : s === 'DOING' ? 1 : 2; }

  function addOrUpdate() {
    const title = draft.title.trim();
    if (!title) return;
    const now = new Date().toISOString();

    if (editingId) {
      setList((prev) => prev.map(e => e.id === editingId ? { ...e, title, notes: draft.notes, bucket: draft.bucket } : e));
      setEditingId(null);
    } else {
      // enforce Top 3 limit
      if (draft.bucket === 'PRIORITY') {
        const top3Count = list.filter(e => e.bucket === 'PRIORITY' && e.status !== 'DONE').length;
        if (top3Count >= 3) {
          alert('Top 3 already full. Complete or move one out first.');
          return;
        }
      }
      const entry: Entry = {
        id: 't_' + Math.random().toString(36).slice(2, 10),
        title,
        notes: draft.notes.trim() || '',
        bucket: draft.bucket,
        status: 'OPEN',
        createdAt: now,
      };
      setList((prev) => [entry, ...prev]);
    }
    setDraft({ title: '', notes: '', bucket: 'INBOX' });
  }

  function edit(e: Entry) {
    setEditingId(e.id);
    setDraft({ title: e.title, notes: e.notes || '', bucket: e.bucket });
  }

  function remove(id: string) {
    setList((prev) => prev.filter(e => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft({ title: '', notes: '', bucket: 'INBOX' });
    }
  }

  function move(id: string, bucket: Bucket) {
    if (bucket === 'PRIORITY') {
      const top3Count = list.filter(e => e.bucket === 'PRIORITY' && e.status !== 'DONE' && e.id !== id).length;
      if (top3Count >= 3) {
        alert('Top 3 already full. Complete or move one out first.');
        return;
      }
    }
    setList((prev) => prev.map(e => e.id === id ? { ...e, bucket } : e));
  }

  function setStatus(id: string, status: Status) {
    setList((prev) => prev.map(e => e.id === id ? { ...e, status } : e));
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>3³DTD™ — Digital Task Diary</h1>
        <p style={styles.sub}>Top 3 • Inbox • Ongoing — enforced by structure, not memory.</p>
      </header>

      {/* Composer */}
      <section style={styles.composer}>
        <input
          placeholder="Task title…"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          style={styles.input}
        />
        <select
          value={draft.bucket}
          onChange={(e) => setDraft({ ...draft, bucket: e.target.value as Bucket })}
          style={styles.select}
        >
          <option value="INBOX">Inbox</option>
          <option value="PRIORITY">Top 3</option>
          <option value="ONGOING">Ongoing</option>
        </select>
        <button onClick={addOrUpdate} style={styles.btnPrimary}>
          {editingId ? 'Update' : 'Add'}
        </button>
      </section>
      <textarea
        placeholder="Notes (optional)…"
        value={draft.notes}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        style={styles.notes}
        rows={3}
      />

      {/* Buckets */}
      <section style={styles.columns}>
        {BUCKETS.map((b) => (
          <div key={b.key} style={styles.col}>
            <div style={styles.colHead}>
              <h2 style={styles.h2}>{b.title}</h2>
              <span style={styles.hint}>{b.hint}</span>
              {b.limit && <span style={styles.limit}>max {b.limit}</span>}
            </div>

            <div style={styles.list}>
              {byBucket[b.key].map((e) => (
                <article key={e.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <strong>{e.title}</strong>
                    <span style={styles.badge}>{e.status.toLowerCase()}</span>
                  </div>
                  {e.notes && <p style={styles.cardNotes}>{e.notes}</p>}
                  <div style={styles.cardRow}>
                    <label>
                      <span>Status: </span>
                      <select
                        value={e.status}
                        onChange={(ev) => setStatus(e.id, ev.target.value as Status)}
                        style={styles.smallSelect}
                      >
                        <option value="OPEN">Open</option>
                        <option value="DOING">Doing</option>
                        <option value="DONE">Done</option>
                      </select>
                    </label>
                    <label>
                      <span>Move: </span>
                      <select
                        value={e.bucket}
                        onChange={(ev) => move(e.id, ev.target.value as Bucket)}
                        style={styles.smallSelect}
                      >
                        <option value="PRIORITY">Top 3</option>
                        <option value="INBOX">Inbox</option>
                        <option value="ONGOING">Ongoing</option>
                      </select>
                    </label>
                  </div>
                  <div style={styles.cardActions}>
                    <button onClick={() => edit(e)} style={styles.btn}>Edit</button>
                    <button onClick={() => remove(e.id)} style={styles.btnDanger}>Delete</button>
                  </div>
                </article>
              ))}
              {byBucket[b.key].length === 0 && (
                <div style={styles.empty}>No tasks here yet.</div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:{maxWidth:1200,margin:'0 auto',padding:'28px 20px 80px'},
  header:{marginBottom:18},
  h1:{fontSize:22,margin:0},
  sub:{color:'#9CB1C2',marginTop:6},
  composer:{display:'flex',gap:8,alignItems:'center',marginTop:8},
  input:{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.18)'},
  select:{padding:'10px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.18)'},
  btnPrimary:{padding:'10px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,0.22)',cursor:'pointer'},
  notes:{width:'100%',marginTop:8,padding:'10px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.18)'},
  columns:{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:12,marginTop:20},
  col:{display:'flex',flexDirection:'column',minHeight:200},
  colHead:{display:'flex',alignItems:'center',gap:10,marginBottom:8},
  h2:{fontSize:16,margin:0},
  hint:{fontSize:12,color:'#9CB1C2'},
  limit:{marginLeft:'auto',fontSize:11,opacity:0.8},
  list:{display:'grid',gap:10},
  card:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:12},
  cardTop:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6},
  badge:{fontSize:11,border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:'1px 6px',textTransform:'uppercase'},
  cardNotes:{fontSize:13,opacity:0.9,margin:'6px 0 8px'},
  cardRow:{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'},
  smallSelect:{padding:'6px 8px',borderRadius:8,border:'1px solid rgba(255,255,255,0.18)'},
  cardActions:{display:'flex',gap:8,marginTop:10},
  btn:{padding:'6px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.22)',cursor:'pointer'},
  btnDanger:{padding:'6px 10px',borderRadius:8,border:'1px solid rgba(255,80,80,0.4)',cursor:'pointer'},
  empty:{opacity:0.6,fontSize:12,padding:'10px 0'},
}