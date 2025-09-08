import Link from 'next/link';

export default function Dockyard() {
  return (
    <div className="stack">
      <h1>Dockyard</h1>
      <p className="muted small">Builder space for scaffolding, agents, and pipelines.</p>

      <div className="grid grid-auto">
        <div className="card">
          <h3>Dev Agent</h3>
          <div className="subtitle">Scaffold pages & tasks</div>
          <p className="small muted">Automate repetitive build steps safely.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href="/agent">Open Dev Agent</Link>
          </div>
        </div>

        <div className="card">
          <h3>Build Queue</h3>
          <div className="subtitle">Queue & worker</div>
          <p className="small muted">Run one-by-one to keep state clean.</p>
        </div>
      </div>
    </div>
  );
}