 'use client';
import React, { useEffect, useState, useRef } from 'react';

type Item = { name: string; type: 'dir' | 'file' };

export default function ExplorerClient() {
  const [path, setPath] = useState('');
  const [tree, setTree] = useState<Item[]>([]);
  const [file, setFile] = useState<string>('');
  const [code, setCode] = useState<string>('// Select a file');
  const [filter, setFilter] = useState('');
  const [focused, setFocused] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const LS_KEY_LAST_FILE = 'dev-explorer:lastFile';
  const lsScrollKey = (p: string) => `dev-explorer:scroll:${encodeURIComponent(p)}`;

  async function loadDir(p: string) {
    try {
      const r = await fetch(`/api/dev/fs/list?path=${encodeURIComponent(p)}`);
      const j = await r.json();
      if (j.items) {
        setTree(j.items);
        setPath(j.path || '');
        setFile('');
        setCode('// Select a file');
        setFocused(-1);
      } else {
        setTree([]);
        setPath('');
      }
    } catch (e) {
      setTree([]);
      setPath('');
    }
  }

  async function loadFile(p: string) {
    try {
      const r = await fetch(`/api/dev/fs/read?path=${encodeURIComponent(p)}`);
      if (r.ok) {
        const t = await r.text();
        setFile(p);
        setCode(t);
        // persist last-selected file
        try {
          localStorage.setItem(LS_KEY_LAST_FILE, p);
        } catch (e) {
          // ignore
        }
        // restore scroll for this file after content sets
        setTimeout(() => {
          try {
            const scrollVal = localStorage.getItem(lsScrollKey(p));
            if (viewerRef.current && scrollVal) {
              viewerRef.current.scrollTop = Number(scrollVal) || 0;
            }
          } catch (e) {
            // ignore
          }
        }, 30);
      } else {
        const j = await r.json();
        setFile(p);
        setCode(`// Error: ${j?.error || 'unknown'}`);
      }
    } catch (e: any) {
      setCode(`// Read failed: ${e?.message || String(e)}`);
    }
  }

  useEffect(() => {
    loadDir('');
  }, []);

  // After tree loads, restore last-selected file if it exists and belongs here
  useEffect(() => {
    try {
      const last = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY_LAST_FILE) : null;
      if (last) {
        // If the last file is under current path or path is root, attempt to load it
        // We only load if the file path is non-empty and not equal to current file
        if (last && last !== file) {
          // attempt to load; server will return error if not allowed
          loadFile(last);
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  const joinPath = (a: string, b: string) => (a ? `${a}/${b}` : b);

  const visible = tree.filter((it) => it.name.toLowerCase().includes(filter.trim().toLowerCase()));

  useEffect(() => {
    // ensure focused index is in bounds
    if (focused >= visible.length) setFocused(visible.length - 1);
  }, [visible, focused]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused((f) => Math.min((visible.length - 1) || 0, Math.max(0, f + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocused((f) => Math.max(-1, f - 1));
    } else if (e.key === 'Enter') {
      if (focused >= 0 && visible[focused]) {
        const it = visible[focused];
        const p = joinPath(path, it.name);
        if (it.type === 'dir') loadDir(p);
        else loadFile(p);
      }
    }
  }

  const segments = path ? path.split('/').filter(Boolean) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: 'calc(100vh - 64px)' }}>
      <aside style={{ borderRight: '1px solid var(--border,#e5e7eb)', overflow: 'auto', padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--muted,#6b7280)' }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>apps/studio/{path}</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => loadDir('')} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}>root</button>
              {segments.map((seg, idx) => (
                <button
                  key={idx}
                  onClick={() => loadDir(segments.slice(0, idx + 1).join('/'))}
                  style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                >
                  /{seg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              aria-label="Filter files"
              placeholder="Filter…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          </div>

          <div>
            <button onClick={() => loadDir(path.split('/').slice(0, -1).join('/'))} style={{ fontSize: 13, textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              ‹ Up
            </button>
          </div>
        </div>

        <ul
          ref={listRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {visible.map((it, i) => {
            const isFocused = i === focused;
            return (
              <li key={it.name}>
                <div
                  onMouseEnter={() => setFocused(i)}
                  onClick={() => {
                    const p = joinPath(path, it.name);
                    if (it.type === 'dir') loadDir(p);
                    else loadFile(p);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isFocused ? 'rgba(14,165,233,0.08)' : 'transparent',
                    border: isFocused ? '1px solid rgba(14,165,233,0.18)' : '1px solid transparent',
                  }}
                >
                  <span style={{ width: 22 }}>{it.type === 'dir' ? '📁' : '📄'}</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{it.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <main style={{ padding: 12, overflow: 'auto' }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--muted,#6b7280)' }}>{file || 'No file selected'}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{code.length} chars</div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: 'var(--card,#fff)', borderRadius: 8, padding: 12 }}>
            <div
              ref={viewerRef}
              onScroll={() => {
                try {
                  if (file) {
                    localStorage.setItem(lsScrollKey(file), String(viewerRef.current?.scrollTop || 0));
                  }
                } catch (e) {
                  // ignore
                }
              }}
              style={{ flex: 1, overflow: 'auto', background: 'var(--card,#fff)', borderRadius: 8, padding: 12 }}
            >
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, monospace', fontSize: 13, margin: 0 }}>
                {code}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
