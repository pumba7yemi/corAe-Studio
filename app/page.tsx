import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="stack">
        <h1>corAe Mothership</h1>
        <p className="muted">
          Clean baseline. Single navigation. Build upwards from here.
        </p>
      </header>

      <section className="grid grid-auto">
        <div className="card">
          <h3>CAIA</h3>
          <div className="subtitle">System brain • Signals & briefings</div>
          <p className="small muted">Cross-system pulse: OMS, Comms, 3³DTD, CIMS.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn primary" href="/caia">Open CAIA</Link>
          </div>
        </div>

        <div className="card">
          <h3>CIMS</h3>
          <div className="subtitle">Comms & Intelligence</div>
          <p className="small muted">OMNI comms; inbox/outbox; operational intel.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href="/cims">Open CIMS</Link>
          </div>
        </div>

        <div className="card">
          <h3>Dockyard</h3>
          <div className="subtitle">Build space</div>
          <p className="small muted">Scaffold pages, run dev agents, manage builds.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href="/dockyard">Open Dockyard</Link>
          </div>
        </div>

        <div className="card">
          <h3>Ship</h3>
          <div className="subtitle">Deployed surface</div>
          <p className="small muted">What the world sees. Stable, clean, consistent.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href="/ship">Open Ship</Link>
          </div>
        </div>
      </section>
    </>
  );
}