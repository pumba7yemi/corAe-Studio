"use client";

// components/DownloadDtdPdf.tsx
export default function DownloadDtdPdf() {
  const run = async () => {
    const res = await fetch("/api/export/dtd", { method: "GET" });
    if (!res.ok) return console.error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corae-3cDTD.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={run}
      className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-sm"
    >
      Export 3³DTD as PDF
    </button>
  );
}