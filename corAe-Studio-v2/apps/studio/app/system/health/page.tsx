/* eslint-disable */
export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

let Card: any, CardHeader: any, CardTitle: any, CardContent: any;
try {
  ({ Card, CardHeader, CardTitle, CardContent } = require("@/components/ui/card"));
} catch {
  Card = ({ children }: { children: ReactNode }) => <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 }}>{children}</div>;
  CardHeader = ({ children }: { children: ReactNode }) => <div style={{ marginBottom: 8 }}>{children}</div>;
  CardTitle = ({ children }: { children: ReactNode }) => <h2 style={{ fontSize: 18, fontWeight: 600 }}>{children}</h2>;
  CardContent = ({ children }: { children: ReactNode }) => <div>{children}</div>;
}

type Status = "ok" | "warn" | "fail" | "unknown";
type HealthBlock = { name: string; status: Status; meta?: Record<string, any>; error?: string };

function badge(status: Status) {
  const map: Record<Status, { bg: string; fg: string; text: string }> = {
    ok: { bg: "#ecfdf5", fg: "#065f46", text: "OK" },
    warn: { bg: "#fffbeb", fg: "#92400e", text: "WARN" },
    fail: { bg: "#fef2f2", fg: "#991b1b", text: "FAIL" },
    unknown: { bg: "#f3f4f6", fg: "#374151", text: "UNKNOWN" },
  };
  const v = map[status];
  return <span style={{ background: v.bg, color: v.fg, borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{v.text}</span>;
}

async function safeJSON(url: string): Promise<any | { __error: string }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { __error: `HTTP ${res.status}` };
    try {
      return await res.json();
    } catch (e: any) {
      return { __error: `Invalid JSON: ${String(e?.message ?? e)}` };
    }
  } catch (e: any) {
    return { __error: String(e?.message ?? e) };
  }
}

function pickStatus(result: any): Status {
  if (!result) return "unknown";
  if (result && typeof result === "object" && "__error" in result) return "fail";
  // heuristics: responses that include 'ok' true, status:'ok', or version keys are good
  if (result && (result.ok === true || result.status === "ok" || result.version)) return "ok";
  return "warn";
}

export default async function Page() {
  const endpoints: { name: string; url: string }[] = [
    { name: "App health", url: "/api/health" },
    { name: "DB (Prisma)", url: "/api/db/health" },
    { name: "CIMS", url: "/api/cims/version" },
    { name: "Ship API", url: "/api/ship/home/mealprep" },
    { name: "IWant API", url: "/api/ship/home/iwant" },
    { name: "BestPrice API", url: "/api/ship/home/bestprice" },
    { name: "Wish Share API", url: "/api/ship/home/wish/share" },
    { name: "Affiliate Redirect", url: "/api/ship/home/redirect?u=https://example.com" },
  ];

  const checks = await Promise.all(endpoints.map(async (e) => {
    const r = await safeJSON(e.url);
    const status = pickStatus(r);
    return { name: e.name, status, meta: r } as HealthBlock;
  }));

  // chunk wrapper status
  let chunk: { ok: boolean; details: string[]; checkedAt: string } = { ok: false, details: ["not checked"], checkedAt: new Date().toISOString() };
  try {
    // lazy import to avoid server-only import at module evaluation time
    const { getChunkWrapperStatus } = await import("./lib/chunkWrappers");
    chunk = await getChunkWrapperStatus();
  } catch (e: any) {
    chunk = { ok: false, details: [String(e?.message ?? e)], checkedAt: new Date().toISOString() };
  }

  const now = new Date().toISOString();

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>corAe System Health</h1>
      <p style={{ marginBottom: 12, color: "#6b7280" }}>Checked at {now} · dynamic</p>

      <div>
        {checks.map((c) => (
          <Card key={c.name}>
            <CardHeader>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <CardTitle>{c.name}</CardTitle>
                </div>
                <div>{badge(c.status)}</div>
              </div>
            </CardHeader>
            <CardContent>
              <pre style={{ maxHeight: 200, overflow: "auto", background: "#0f172a", color: "#e6eef8", padding: 8, borderRadius: 8 }}>{JSON.stringify(c.meta ?? {}, null, 2)}</pre>
              {c.error && <div style={{ color: "#991b1b", marginTop: 8 }}>{c.error}</div>}
            </CardContent>
          </Card>
        ))}
        <Card key="chunk-wrappers">
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <CardTitle>Chunk Wrappers</CardTitle>
              </div>
              <div>{chunk.ok ? <span style={{ background: "#ecfdf5", color: "#065f46", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>OK</span> : <span style={{ background: "#fffbeb", color: "#92400e", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>MISSING</span>}</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={chunk.ok ? "text-emerald-400" : "text-amber-300"}>{chunk.ok ? "✅ OK" : "⚠️ Missing wrappers"}</p>
            {chunk.details?.length > 0 && (
              <ul style={{ marginTop: 8, listStyleType: "disc", paddingLeft: 20, fontSize: 12, opacity: 0.85 }}>
                {chunk.details.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 8, fontSize: 12, color: "#71717a" }}>Checked: {new Date(chunk.checkedAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
