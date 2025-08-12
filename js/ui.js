document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("out");
  const log = (m) => out && (out.textContent = m);

  document.addEventListener("corAe:core:ready", (e) => {
    log(`corAe core ready v${e.detail.version}`);
  });

  const btn = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", async () => {
      el.disabled = true;
      try { await fn(); } finally { el.disabled = false; }
    });
  };

  btn("btn-start", async () => {
    corAe.store.set("runId", Math.random().toString(36).slice(2));
    log("Kickstart: runId = " + corAe.store.get("runId"));
  });

  btn("btn-diagnose", async () => {
    log("Diagnostics OK • boot " + new Date(corAe.booted).toLocaleTimeString());
  });

  btn("btn-preview", async () => {
    log("Preview launched (stub) — routes coming next.");
  });
});
