"use client";
import { useEffect, useState } from "react";

export default function UploadPanel({
  bucket = "uploads",
  accept = ".json,.sql,.csv,.txt",
  title = "Upload file",
  onUploaded,
}: {
  bucket?: string;
  accept?: string;
  title?: string;
  onUploaded?: (info: { path: string; filename: string; bucket: string }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<{name:string; size:number; mtime:string}[]>([]);

  async function refresh() {
    const res = await fetch(`/api/files/${bucket}/list`);
    const data = await res.json();
    if (data.ok) setList(data.items || []);
  }
  useEffect(() => { refresh(); }, [bucket]);

  async function handleFile(f: File) {
    const fd = new FormData();
    fd.append("file", f);
    fd.append("filename", f.name);
    setBusy(true);
    try {
      const res = await fetch(`/api/files/${bucket}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "upload failed");
      onUploaded?.({ path: data.path, filename: data.filename, bucket: data.bucket });
      await refresh();
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) handleFile(f);
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>

      <label className="block rounded-xl border border-dashed p-4 text-center cursor-pointer hover:bg-slate-50">
        <div className="text-xs text-slate-600">
          Drag & drop or click to choose a file ({accept})
        </div>
        <input type="file" accept={accept} className="hidden" onChange={onInputChange} />
      </label>

      {busy && <div className="text-xs text-slate-500">Uploading…</div>}

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="px-2 py-1">Name</th><th className="px-2 py-1">Size</th><th className="px-2 py-1">Modified</th></tr>
          </thead>
          <tbody>
            {list.map((x,i)=>(
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{x.name}</td>
                <td className="px-2 py-1">{(x.size/1024).toFixed(1)} KB</td>
                <td className="px-2 py-1">{new Date(x.mtime).toLocaleString()}</td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="px-2 py-2 text-slate-500" colSpan={3}>No files yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}