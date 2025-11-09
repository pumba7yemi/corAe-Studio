import React from 'react';
import { listCompanies, getSnapshot } from '../lib/shadow/store';

export default function Page() {
  const companies = listCompanies();

  const esc = (s: string) => String(s).replace(/'/g, "\\'");

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Ship Demo Hub — Shadow Mirror</h1>
      <p style={{ color: '#666' }}>In-memory shadow mirror for demo and troubleshooting. Volatile (per server process).</p>

      {companies.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <em>No companies ingested yet.</em>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {companies.map((cid) => {
            const snapshot = getSnapshot(cid);
            return (
              <section key={cid} style={{ marginBottom: 20, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{cid} — {snapshot.totals.events} events</h3>
                  <div>
                    <button
                      data-company={cid}
                      className="shadow-clear"
                      style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>By type:</strong>
                  <pre style={{ background: '#fafafa', padding: 8, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(snapshot.totals.byType, null, 2)}</pre>
                </div>

                <details style={{ marginTop: 8 }}>
                  <summary>Tail samples (last items per category)</summary>
                  <pre style={{ background: '#fafafa', padding: 8, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(snapshot.tails, null, 2)}</pre>
                </details>

                <div style={{ marginTop: 8, color: '#666' }}>
                  <small>Last updated: {snapshot.updatedAt ?? '-'}</small>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Inline script to wire up Clear buttons without adding a client component file */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          function el(sel){return document.querySelectorAll(sel)}
          el('.shadow-clear').forEach(function(btn){
            btn.addEventListener('click', function(){
              var company = btn.getAttribute('data-company');
              if(!confirm('Clear shadow data for "'+company+'"? This cannot be undone.')) return;
              fetch('/api/shadow/clear', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ action: 'clearCompany', companyId: company })
              }).then(function(r){ return r.json() }).then(function(j){
                if(j && j.ok){ location.reload(); } else { alert('Error: '+(j && j.error) || 'unknown'); }
              }).catch(function(e){ alert('Error: '+e) });
            });
          });
        })();
      ` }} />
    </main>
  );
}

// Monkey steps
// 1. Create folder: apps/ship/app/demo/
// 2. Create file page.tsx with the contents above.
// 3. Save and visit /demo in the Ship app to view ingested shadow companies.
