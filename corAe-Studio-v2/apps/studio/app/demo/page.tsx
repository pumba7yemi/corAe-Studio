import React from "react";
import { listCompanies, getSnapshot } from "../lib/shadow/store";

export default function DemoHubPage() {
  const companies = listCompanies();

  return (
    <main style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Shadow Mirror — Demo Hub</h1>
      <p style={{ color: "#666" }}>
        This page surfaces the in-memory Shadow Mirror store for demo purposes. Data is
        ephemeral and stored per-server-process.
      </p>

      {companies.length === 0 ? (
        <div>
          <p>No companies have been ingested yet.</p>
          <p>Use the ingest API at <code>/api/shadow/ingest</code> to push demo events.</p>
        </div>
      ) : (
        <div>
          <h2>Companies ({companies.length})</h2>
          {companies.map((cid) => {
            const snapshot = getSnapshot(cid);
            // safe-escape for inline onclick
            const esc = (s: string) => s.replace(/'/g, "\\'");
            return (
              <section key={cid} style={{ marginBottom: 20, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{cid} — {snapshot.totals.events} events</h3>
                  <div>
                    <button type="button" onClick={undefined} dangerouslySetInnerHTML={{__html: `<!-- interactive button fallback -->`}} />
                    <button
                      type="button"
                      onClick={undefined}
                      // use an inline onclick to avoid creating an extra client file
                      dangerouslySetInnerHTML={{ __html: `<button type="button" onclick="(function(){const p=fetch('/api/shadow/clear',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'clearCompany',companyId:'${esc(cid)}'})}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert('Error: '+(j.error||'unknown'))}).catch(e=>alert('Error:'+e));})();">Clear</button>` }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>By type:</strong>
                  <pre style={{ background: "#fafafa", padding: 8, borderRadius: 6, overflowX: "auto" }}>{JSON.stringify(snapshot.totals.byType, null, 2)}</pre>
                </div>
                <details style={{ marginTop: 8 }}>
                  <summary>Tail samples (last items per category)</summary>
                  <pre style={{ background: "#fafafa", padding: 8, borderRadius: 6, overflowX: "auto" }}>{JSON.stringify(snapshot.tails, null, 2)}</pre>
                </details>
                <div style={{ marginTop: 8, color: "#666" }}>
                  <small>Last updated: {snapshot.updatedAt ?? "-"}</small>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
