"use client";

import { useEffect, useState } from "react";

export default function Subject1Editor() {
  const [files, setFiles] = useState<string[]>([]);
  const [file, setFile] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    setLoading(true);
    const r = await fetch("/api/governance/subject1");
    const j = await r.json();
    if (j.ok) {
      setFiles(j.files);
      if (j.files[0]) selectFile(j.files[0]);
    }
    setLoading(false);
  }

  async function selectFile(f: string) {
    setFile(f);
    setLoading(true);
    const r = await fetch(`/api/governance/subject1-file?file=${encodeURIComponent(f)}`);
    const j = await r.json();
    if (j.ok) setContent(j.content ?? "");
    setLoading(false);
  }

  async function save() {
    if (!file) return;
    setSaving(true);
    const r = await fetch("/api/governance/subject1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, content }),
    });
    await r.json();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select
          value={file}
          onChange={(e) => selectFile(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          {files.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {loading && <div className="text-sm text-zinc-400">Loading…</div>}

      <textarea
        className="w-full min-h-[420px] rounded-2xl border p-3 text-sm font-mono"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
