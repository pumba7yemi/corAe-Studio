// apps/studio/app/ship/business/oms/obari/deals/[dealId]/equals/page.tsx
// ship ▸ business ▸ oms ▸ obari — "=" Snapshot Viewer (server-rendered)
// Fetches immutable BDO snapshot from Studio API using STUDIO_BASE_URL.

type EqualsOk = {
  ok: true;
  dealId: string;
  at: string;
  stage: "BDO";
  number: string;
  currency: string;
  hash: string;
  version: number;
  payload: string; // canonical JSON
};

type EqualsErr = { error: string };

type Params = { params: Promise<{ dealId: string }> };

function studioBase(): string | null {
  const env =
    process.env.STUDIO_BASE_URL ??
    process.env.NEXT_PUBLIC_STUDIO_BASE_URL ??
    null;
  return env && env.trim().length > 0 ? env.replace(/\/+$/, "") : null;
}

async function fetchEqualsFromStudio(dealId: string): Promise<EqualsOk | null> {
  const base = studioBase();
  if (!base) return null; // missing base handled by page
  const url = `${base}/api/obari/deals/${encodeURIComponent(dealId)}/equals`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as EqualsOk | EqualsErr;
  return "ok" in data && data.ok ? (data as EqualsOk) : null;
}

function tryParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}

export default async function Page({ params }: Params) {
  const p = await params;
  const dealId = p.dealId;

  const base = studioBase();
  if (!base) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Configuration Required
        </h1>
        <p style={{ color: "#555" }}>
          <code>STUDIO_BASE_URL</code> is not set for the ship app. Set it to the Studio URL (e.g.
          <code> http://localhost:3000</code>) and refresh this page.
        </p>
      </main>
    );
  }

  const snap = await fetchEqualsFromStudio(dealId);

  if (!snap) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          “=” Snapshot Not Found
        </h1>
        <p style={{ color: "#555" }}>
          No snapshot found for <code>{dealId}</code> at Studio base{" "}
          <code>{base}</code>. Finalize BTDO→BDO in Studio, then reload.
        </p>
      </main>
    );
  }

  const payloadObj = tryParse(snap.payload);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        business ▸ oms ▸ obari &ldquo;=&rdquo; Snapshot
      </h1>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "8px 16px",
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fafafa",
          marginBottom: 16,
        }}
      >
        <div style={{ color: "#6b7280" }}>Deal ID</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          {snap.dealId}
        </div>

        <div style={{ color: "#6b7280" }}>Hash</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          {snap.hash}
        </div>

        <div style={{ color: "#6b7280" }}>Stage</div>
        <div>{snap.stage}</div>

        <div style={{ color: "#6b7280" }}>Number</div>
        <div>{snap.number}</div>

        <div style={{ color: "#6b7280" }}>Currency</div>
        <div>{snap.currency}</div>

        <div style={{ color: "#6b7280" }}>Timestamp</div>
        <div>{new Date(snap.at).toLocaleString()}</div>

        <div style={{ color: "#6b7280" }}>Version</div>
        <div>{snap.version}</div>

        <div style={{ color: "#6b7280" }}>Integrity</div>
        <div>
          {snap.hash && snap.stage === "BDO" ? (
            <span style={{ color: "#065f46", fontWeight: 600 }}>OK</span>
          ) : (
            <span style={{ color: "#991b1b", fontWeight: 600 }}>INVALID</span>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Payload</h2>
        <pre
          style={{
            padding: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#111827",
            color: "#f9fafb",
            overflowX: "auto",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
{JSON.stringify(payloadObj, null, 2)}
        </pre>
      </section>
    </main>
  );
}