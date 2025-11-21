"use client";

export default function GenerateButton() {
  async function handleClick() {
    const r = await fetch("/api/shipyard/generate", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    alert(j.ok ? "🚀 Build queued" : j.error || "Failed to queue build");
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
    >
      ⚡ Generate New Build
    </button>
  );
}
