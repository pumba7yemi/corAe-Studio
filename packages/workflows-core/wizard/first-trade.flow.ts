// ────────────────────────────────────────────────
// corAe WorkFocus™ Flow: First Trade (150-logic)
// Named-only exports to avoid interop surprises.
// ────────────────────────────────────────────────

export type FirstTradeState = {
  brand?: string;
  sector?: string;
  audience?: string;
  offer?: string;
  channel?: string;
  progress?: number;
  updatedAt?: string;
};

// ----------------------------------------------
// INITIAL STATE
// ----------------------------------------------
export function initialState(): FirstTradeState {
  return {
    brand: "",
    sector: "",
    audience: "",
    offer: "",
    channel: "",
    progress: 0,
    updatedAt: new Date().toISOString(),
  };
}

// ----------------------------------------------
// PERSISTENCE (browser-only)
// ----------------------------------------------
const KEY = "workfocus:first-trade";

// Safe sync read for initial render (returns initial if SSR or no storage)
export function loadDraftSync(): FirstTradeState {
  try {
    if (typeof window === "undefined") return initialState();
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FirstTradeState) : initialState();
  } catch {
    return initialState();
  }
}

// Async version (if you prefer)
export async function loadDraft(): Promise<FirstTradeState> {
  return loadDraftSync();
}

export async function persistDraft(data: FirstTradeState) {
  try {
    if (typeof window === "undefined") return;
    const next = { ...data, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

// ----------------------------------------------
// PROGRESS & VALIDATION
// ----------------------------------------------
export function calcProgress(d: FirstTradeState) {
  const total = 5;
  let done = 0;
  if (d.brand) done++;
  if (d.sector) done++;
  if (d.audience) done++;
  if (d.offer) done++;
  if (d.channel) done++;
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
}

// ----------------------------------------------
// SUBMISSION hook
// ----------------------------------------------
export async function submitFirstTrade(data: FirstTradeState) {
  const payload = { workflowId: "marketing.loop.v1", data };
  try {
    const res = await fetch("/api/workflows/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json.ok ? { ok: true, runId: json.runId } : { ok: false, error: json.error };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

// ----------------------------------------------
// DOC helpers
// ----------------------------------------------
export function toMarkdown(d: FirstTradeState): string {
  const { done, total, percent } = calcProgress(d);
  return `# First Trade Summary

**Progress:** ${done}/${total} (${percent}%)

| Field | Value |
|-------|-------|
| Brand | ${d.brand || "-"} |
| Sector | ${d.sector || "-"} |
| Audience | ${d.audience || "-"} |
| Offer | ${d.offer || "-"} |
| Channel | ${d.channel || "-"} |

_Last updated: ${d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}_
`;
}

export async function toDocHtml(d: FirstTradeState): Promise<string> {
  const md = toMarkdown(d);
  const html = md
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\| (.*?) \| (.*?) \|/g, "<tr><td>$1</td><td>$2</td></tr>")
    .replace(/\n/g, "<br>");
  return `<article class="prose">${html}</article>`;
}

// ----------------------------------------------
// Next prompt (3³DTD)
// ----------------------------------------------
export function nextStep(d: FirstTradeState): string {
  const seq: (keyof FirstTradeState)[] = ["brand", "sector", "audience", "offer", "channel"];
  const missing = seq.find((k) => !d[k]);
  if (!missing) return "✅ Flow complete — ready to submit.";
  return `Have you defined your ${missing}?`;
}