import React from "react";

/** OBARI landing — token-only styling (no palette classes)
 *  Works in dark (default) and body.theme-light via your CSS variables.
 */
export default function ObariLanding() {
  return (
    <section className="relative overflow-hidden bg-card text-text rounded-2xl border border-ring shadow-card">
      {/* token blur accents */}
      <div className="hero-accent" />

      <div className="container">
        {/* Eyebrow */}
        <p className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>
          corAe • OBARI™
        </p>

        {/* Headline */}
        <h1>
          Structure. Rhythm. Precision.
          <span className="block muted">
            Meet <strong style={{ color: "var(--text)" }}>OBARI™</strong> — the Flow Engine of corAe.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="small" style={{ fontSize: "1.05rem" }}>
          A system that doesn’t run away with itself — it <em>flows</em>. Everything you do stays fenced, timed, and
          calm. <strong>Pulse</strong> is your window to all of it.
        </p>

        {/* OBARI chain pill */}
        <div className="pill" style={{ marginTop: "16px" }}>
          <strong>OBARI™</strong>
          <span className="muted">=</span>
          <span>Order</span>
          <span className="muted">→</span>
          <span>Booking</span>
          <span className="muted">→</span>
          <span>Active</span>
          <span className="muted">→</span>
          <span>Reporting</span>
          <span className="muted">→</span>
          <span>Invoice</span>
        </div>

        {/* 28-day + Pulse */}
        <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: "28px", gap: "var(--gap-4)" }}>
          <div className="c-card">
            <h2>The 28-Day Advantage</h2>
            <p className="small">
              • Predictable 4-week heartbeat for orders, deliveries, and cashflow<br />
              • POS-driven forecasting with automatic stock logic<br />
              • AI oversight that observes everything so you can focus on what matters<br />
              • FileLogic™ archives each week in its own digital fence
            </p>
          </div>

          <div className="c-card">
            <h2>Pulse</h2>
            <p className="small">
              One calm window into your entire operation. Movement without motion — the heartbeat of your business,
              steady and clear.
            </p>
          </div>
        </div>

        {/* Differentiation */}
        <div className="c-card" style={{ marginTop: "28px" }}>
          <div className="grid grid-auto">
            <div>
              <div className="badge" style={{ marginBottom: "10px" }}>Others rely on</div>
              <ul className="small">
                <li>Continuous noise & manual checking</li>
                <li>Sprawl across departments</li>
                <li>Fragmented order → payment</li>
                <li>Reactive firefighting</li>
              </ul>
            </div>
            <div>
              <div className="badge" style={{ marginBottom: "10px" }}>OBARI™ delivers</div>
              <ul className="small">
                <li>Quiet AI observation & structured flow</li>
                <li>Fenced 28-day rhythm</li>
                <li>One chain: POS → OBARI → Finance</li>
                <li>Predictable, governed rhythm</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <blockquote className="c-card" style={{ marginTop: "28px" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
            <strong>OBARI™</strong> keeps the world moving while giving you space to think. Every sale triggers a plan.
            Every delivery has proof. Every payment has purpose.
          </p>
        </blockquote>

        {/* CTAs */}
        <div className="row" style={{ marginTop: "20px" }}>
          <a href="#how-obari-works" className="btn btn-primary">See the Flow</a>
          <a href="#pulse-demo" className="btn">Experience Pulse</a>
          <a href="#join" className="btn">Join the Rhythm</a>
        </div>
      </div>
    </section>
  );
}
