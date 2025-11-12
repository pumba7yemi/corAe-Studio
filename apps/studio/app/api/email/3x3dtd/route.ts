// apps/studio/app/api/email/3x3dtd/route.ts
import type { NextRequest } from "next/server";

type Trio = { id: string; title: string; note?: string };
type ThreeByThree = {
  dateISO: string;
  priority: Trio[]; // top 3
  ongoing: Trio[];  // 3 in progress/recurring
  inbox: Trio[];    // 3 new/unassigned
};

type ObariStage = "order" | "booking" | "active" | "reporting" | "invoice";
type ObariState = { stage: ObariStage; history: { at: string; stage: ObariStage; note?: string }[] };

const SCOPE_DTD = "3x3dtd";
const KEY_DTD = "today";
const SCOPE_OBARI = "obari-demo";
const KEY_OBARI = "state";

// Best-effort dynamic import of @corae/caia-core memory.
// Falls back to in-process Map so this endpoint always works in dev.
const FALLBACK = (() => {
  const bag = new Map<string, Record<string, string>>();
  return {
    async read(scope: string): Promise<Record<string, string>> {
      return bag.get(scope) ?? {};
    },
    async write(scope: string, dict: Record<string, string>): Promise<void> {
      bag.set(scope, dict);
    },
  };
})();

async function mem() {
  try {
    // @ts-ignore optional in some environments
    const core = (await import("@corae/caia-core")).default ?? (await import("@corae/caia-core"));
    return {
      read: core.readShipMemory ?? (core as any).readShipMemory,
      write: core.writeShipMemory ?? (core as any).writeShipMemory,
    };
  } catch {
    return FALLBACK;
  }
}

function sample3x3(): ThreeByThree {
  const today = new Date().toISOString();
  return {
    dateISO: today,
    priority: [
      { id: "p1", title: "Close PO cycle (Week 2 Thu)", note: "Confirm funds & GRV checks" },
      { id: "p2", title: "Staff rota publish", note: "Cover weekend gaps" },
      { id: "p3", title: "Vendor WhatsApp confirmations", note: "Price-lock before delivery" },
    ],
    ongoing: [
      { id: "o1", title: "Expiry sweep (chilled)" },
      { id: "o2", title: "POS best-sellers review" },
      { id: "o3", title: "GRV returns log audit" },
    ],
    inbox: [
      { id: "i1", title: "Customer refund follow-up" },
      { id: "i2", title: "New product sample — review" },
      { id: "i3", title: "Pest control certificate upload" },
    ],
  };
}

function sanitize3(items: Trio[]): Trio[] {
  return (items ?? []).slice(0, 3).map(x => ({ id: String(x.id ?? crypto.randomUUID()), title: String(x.title ?? ""), note: x.note ? String(x.note) : undefined }));
}

function normalize(dto?: Partial<ThreeByThree>): ThreeByThree {
  const base = sample3x3();
  return {
    dateISO: String(dto?.dateISO ?? base.dateISO),
    priority: sanitize3(dto?.priority ?? base.priority),
    ongoing: sanitize3(dto?.ongoing ?? base.ongoing),
    inbox: sanitize3(dto?.inbox ?? base.inbox),
  };
}

function renderText(dtd: ThreeByThree, obari?: ObariState): string {
  const date = new Date(dtd.dateISO).toLocaleDateString();
  const s = obari?.stage ? obari.stage.toUpperCase() : "UNKNOWN";
  const line = (t: Trio[]) => t.map((x, i) => `  ${i + 1}. ${x.title}${x.note ? ` — ${x.note}` : ""}`).join("\n");
  return [
    `3x3x3 Daily — ${date}`,
    "",
    `OBARI: ${s}`,
    "",
    `Top 3 Priority`,
    line(dtd.priority),
    "",
    `3 Ongoing`,
    line(dtd.ongoing),
    "",
    `3 Inbox`,
    line(dtd.inbox),
    "",
    `— corAe | 3³DTD • OBARI`,
  ].join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>\"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderHtml(dtd: ThreeByThree, obari?: ObariState): string {
  const date = new Date(dtd.dateISO).toLocaleDateString();
  const s = obari?.stage ? obari.stage.toUpperCase() : "UNKNOWN";
  const li = (t: Trio[]) => t.map(x => `<li><strong>${escapeHtml(x.title)}</strong>${x.note ? ` — ${escapeHtml(x.note)}` : ""}</li>`).join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark">
<title>3x3x3 Daily — ${escapeHtml(date)}</title>
</head><body style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;padding:16px">
  <h1 style="margin:0 0 8px">3×3×3 Daily — ${escapeHtml(date)}</h1>
  <p style="margin:0 0 16px;opacity:.75">OBARI: <strong>${escapeHtml(s)}</strong></p>

  <h2 style="margin:16px 0 8px">Top 3 Priority</h2>
  <ol>${li(dtd.priority)}</ol>

  <h2 style="margin:16px 0 8px">3 Ongoing</h2>
  <ol>${li(dtd.ongoing)}</ol>

  <h2 style="margin:16px 0 8px">3 Inbox</h2>
  <ol>${li(dtd.inbox)}</ol>

  <p style="margin-top:24px;opacity:.7">— corAe | 3³DTD • OBARI</p>
</body></html>`;
}

async function loadObari(): Promise<ObariState | null> {
  const m = await mem();
  const bag = await m.read(SCOPE_OBARI);
  const raw = bag[KEY_OBARI];
  if (!raw) return null;
  try { return JSON.parse(raw) as ObariState; } catch { return null; }
}

async function read3x3(): Promise<ThreeByThree> {
  const m = await mem();
  const bag = await m.read(SCOPE_DTD);
  const raw = bag[KEY_DTD];
  if (!raw) return sample3x3();
  try { return normalize(JSON.parse(raw)); } catch { return sample3x3(); }
}

async function write3x3(d: ThreeByThree): Promise<void> {
  const m = await mem();
  const bag = await m.read(SCOPE_DTD);
  bag[KEY_DTD] = JSON.stringify(d);
  await m.write(SCOPE_DTD, bag);
}

// GET => preview { subject, text, html, data }
export async function GET() {
  const dtd = await read3x3();
  const obari = await loadObari();
  const date = new Date(dtd.dateISO).toLocaleDateString();
  const subject = `3×3×3 Daily — ${date} • ${obari?.stage?.toUpperCase() ?? "OBARI"}`;
  const text = renderText(dtd, obari ?? undefined);
  const html = renderHtml(dtd, obari ?? undefined);
  return Response.json({ ok: true, subject, text, html, data: dtd, obari });
}

/**
 * POST body forms:
 *  - { action: "save", data: ThreeByThree }   // save/update list
 *  - { action: "send", to?: string }          // send via SMTP if configured, else log
 * ENV for SMTP:
 *  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, (optional) DEFAULT_TO_EMAIL
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action ?? "");

  if (action === "save") {
    const d = normalize(body?.data ?? {});
    await write3x3(d);
    return Response.json({ ok: true, saved: true });
  }

  if (action === "send") {
    const dtd = await read3x3();
    const obari = await loadObari();
    const date = new Date(dtd.dateISO).toLocaleDateString();
    const subject = `3×3×3 Daily — ${date} • ${obari?.stage?.toUpperCase() ?? "OBARI"}`;
    const text = renderText(dtd, obari ?? undefined);
    const html = renderHtml(dtd, obari ?? undefined);

    const smtp = pickSmtp();
    if (!smtp) {
      // No SMTP configured — emit to server logs as a safe no-op "send".
      console.log("[3x3dtd-email] SEND (dry-run):", { subject, to: body?.to ?? process.env.DEFAULT_TO_EMAIL ?? "(none)" });
      return Response.json({ ok: true, dryRun: true, subject });
    }

    const to = String(body?.to ?? process.env.DEFAULT_TO_EMAIL ?? "");
    if (!to) return Response.json({ ok: false, error: "NO_TO_EMAIL" }, { status: 400 });

  try {
    // nodemailer is optional in some dev setups; do a non-literal dynamic import so the bundler
    // doesn't attempt to resolve the module at build-time when it's not present.
    // @ts-ignore - optional runtime dependency
    let nodemailer: any = null;
    try {
      const _name = String("nodemailer");
      nodemailer = await import(_name);
    } catch {
      nodemailer = null;
    }
    if (!nodemailer) throw new Error("nodemailer-not-available");

    // createTransport may be on the default export or the namespace depending on ESM interop
    const transporter = ((nodemailer as any).createTransport || (nodemailer as any).default?.createTransport)({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    } as any);

      await transporter.sendMail({
        from: smtp.from,
        to,
        subject,
        text,
        html,
      });

      return Response.json({ ok: true, sent: true, to, subject });
    } catch (e: any) {
      console.error("[3x3dtd-email] SEND FAILED:", e?.message || e);
      return Response.json({ ok: false, error: "SEND_FAILED", detail: String(e?.message || e) }, { status: 500 });
    }
  }

  return Response.json({ ok: false, error: "UNKNOWN_ACTION" }, { status: 400 });
}

function pickSmtp():
  | { host: string; port: number; user?: string; pass?: string; from: string }
  | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL;

  if (!host || !port || !from) return null;
  return { host, port, user, pass, from };
}
