// src/components/TaskSheetsMini.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/* Local type definitions to satisfy the TypeScript compiler when the external package
   does not ship its own types. We avoid module augmentation inside this module file
   (which causes "module cannot be found" errors) and instead declare local types and
   import only the runtime value. */
type TaskSheet = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  frequency?: string;
};

// runtime import is done inside useEffect to avoid TypeScript resolving missing types for the external package

type Props = {
  scope?: 'WORK' | 'HOME';
  orgId?: string;
  userId?: string;
  href?: string; // link to full page
  limit?: number;
};

/**
 * corAe • TaskSheetsMini (shared)
 * Small, reusable preview widget showing active Task Sheets.
 * Place anywhere (Work/Home). Pulls from the shared Task Sheets engine.
 */
export default function TaskSheetsMini({
  scope = 'WORK',
  orgId = 'demo-org',
  userId = 'demo-user',
  href = scope === 'WORK' ? '/ship/work/task-sheets' : '/ship/home/task-sheets',
  limit = 3,
}: Props) {
  const [sheets, setSheets] = useState<TaskSheet[]>([]);

  useEffect(() => {
    // Try to require the runtime module if available; fall back to a local seeded default.
    let data: { sheets: TaskSheet[] } = { sheets: [] };
    try {
      // @ts-ignore - the external package may not provide TS types in this repo
      const engine = require('@workfocus-core/tasksheets/engine');
      if (engine && typeof engine.ensureSeededSheets === 'function') {
        data = engine.ensureSeededSheets(scope, orgId, userId);
      }
    } catch (e) {
      // module not available at build time/runtime, provide a sensible demo fallback
      data = {
        sheets: [
          { id: 'demo-1', title: 'Demo Tasksheet', status: 'ACTIVE', frequency: 'DAILY' },
        ],
      };
    }
    setSheets(data.sheets);
  }, [scope, orgId, userId]);

  interface ActiveTaskSheet extends TaskSheet {
    status: 'ACTIVE';
  }

  const active: ActiveTaskSheet[] = sheets.filter(function (s: TaskSheet): s is ActiveTaskSheet {
    return s.status === 'ACTIVE';
  });

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <h3 style={styles.h3}>Task Sheets</h3>
        <Link href={href as any} legacyBehavior><a style={styles.link}>View</a></Link>
      </div>

      <div style={styles.grid}>
        {active.length > 0 ? (
          active.slice(0, limit).map((s) => (
            <div key={s.id} style={styles.card}>
              <strong style={styles.title}>{s.title}</strong>
              <span style={styles.meta}>{s.frequency?.toLowerCase() || 'daily'}</span>
            </div>
          ))
        ) : (
          <div style={styles.empty}>No active sheets.</div>
        )}
      </div>
    </div>
  );
}

/* ─────────── Styles (no external deps) ─────────── */
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  h3: { margin: 0, fontSize: 16 },
  link: {
    fontSize: 12,
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 999,
    padding: '4px 8px',
    textDecoration: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 8,
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 10,
    display: 'grid',
    gap: 6,
  },
  title: { fontSize: 13 },
  meta: { fontSize: 11, opacity: 0.8 },
  empty: { opacity: 0.6, fontSize: 12 },
}