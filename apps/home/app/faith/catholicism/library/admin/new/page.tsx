'use client';
import React, { useState } from 'react';

export default function Page() {
  const [paste, setPaste] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('litany');

  function parsePreview(text: string) {
    // Very small parser: split lines, mark sign of cross or amen
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((t) => ({ kind: 'line', text: t }));
  }

  async function save() {
    alert('Admin importer moved to Studio. Use /ship/home/faith/catholicism/library/admin/new');
  }

  return (
    <div style={{ padding: 12 }}>
      <h1>Import Prayer (Admin)</h1>
      <div>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      </div>
      <div>
        <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="litany">litany</option><option value="novena">novena</option></select></label>
      </div>
      <div>
        <label>Paste content<textarea rows={8} cols={60} value={paste} onChange={(e) => setPaste(e.target.value)} /></label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={save}>Save to Library</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h4>Preview</h4>
        <pre>{parsePreview(paste).map((b:any) => b.text).join('\n')}</pre>
      </div>
    </div>
  );
}
