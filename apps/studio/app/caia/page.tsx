import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "corAe — CAIA" };

export default function CAIAPage() {
  return (
    <main className="stack" style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1>corAe — CAIA Control Center</h1>
      <p className="muted">Memory, Workflows, and Dev Agent entry-points.</p>

      <section className="c-card">
        <h2>Memory (demo)</h2>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn" href="/api/caia/memory?scope=demo">List demo/*</a>
          <a className="btn" href="/api/caia/memory?scope=demo&key=hello">Get demo/hello</a>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          To set: <code>PUT /api/caia/memory?scope=demo&key=hello</code> with JSON body.
        </p>
      </section>

      <section className="c-card">
        <h2>Workflows</h2>
        <p className="muted">Core schema at <code>apps/studio/prisma/schema.prisma</code>.</p>
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn" href="/automate/workflows">Open Workflows</Link>
          <a className="btn" href="/api/workflows/self-test">Run self-test</a>
        </div>
      </section>

      <section className="c-card">
        <h2>Dev Agent</h2>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn" href="/api/health">API health</a>
          <Link className="btn" href="/forge">Forge controls</Link>
        </div>
      </section>
    </main>
  );
}