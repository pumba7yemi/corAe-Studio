// src/components/chrome/TopBar.tsx
// corAe — Top Bar (anchor removed, CAIA large + pulsing)
// - No external libs
// - Accessible dropdowns via <details>

"use client";

import React from "react";
import Link from "next/link";

type NavLink = { label: string; href: string };
type NavGroup = { label: string; children: Array<NavLink | NavGroup> };

const nav: NavGroup[] = [
  {
    label: "Business",
    children: [
      {
        label: "OMS",
        children: [
          {
            label: "OBARI",
            children: [
              { label: "Orders", href: "/business/oms/obari/order" },
              { label: "Booking", href: "/business/oms/obari/booking" },
              { label: "Active", href: "/business/oms/obari/active" },
              { label: "Report", href: "/business/oms/obari/report" },
              { label: "Invoice", href: "/business/oms/obari/invoice" },
              { label: "BDO ▸ Ready", href: "/business/oms/obari/bdo/bdo-ready" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Work",
    children: [{ label: "Focus", href: "/work/focus" }, { label: "Pulse", href: "/work/pulse" }],
  },
  {
    label: "Home",
    children: [{ label: "Finance", href: "/home/finance" }, { label: "Planner", href: "/home/planner" }],
  },
];

function isGroup(x: any): x is NavGroup {
  return x && typeof x === "object" && Array.isArray(x.children);
}

export default function TopBar() {
  const today = React.useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }, []);

  return (
    <header
      aria-label="corAe Top Bar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(8px)",
        background: "rgba(6, 11, 18, 0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "#E5E7EB",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        {/* ── CAIA beacon (anchor removed) */}
        <Link href="/" aria-label="corAe Home" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 50% 50%, #34D399 0%, #10B981 60%, #065F46 100%)",
                boxShadow:
                  "0 0 10px rgba(16,185,129,.95), 0 0 28px rgba(16,185,129,.55), inset 0 0 8px rgba(255,255,255,.25)",
                animation: "caiaPulse 1.6s ease-in-out infinite",
              }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  fontSize: 22, // larger label
                  lineHeight: "22px",
                }}
              >
                CAIA
              </span>
              <span style={{ fontWeight: 500, color: "#9CA3AF", fontSize: 13 }}>corAe</span>
            </div>
          </div>
        </Link>

        {/* ── Primary nav */}
        <nav aria-label="Primary" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {nav.map((g) => (
            <DetailsMenu key={g.label} label={g.label} items={g.children} />
          ))}
        </nav>

        {/* ── Right rail */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, color: "#9CA3AF" }}>
          <span style={{ fontSize: 12, border: "1px solid #1F2937", padding: "4px 8px", borderRadius: 999 }}>
            {today}
          </span>
          <Link
            href="/cims"
            style={{
              fontSize: 12,
              color: "#A7F3D0",
              textDecoration: "none",
              border: "1px solid rgba(16,185,129,.35)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            CIMS
          </Link>
        </div>
      </div>

      {/* Keyframes + menu styles */}
      <style>{`
        @keyframes caiaPulse {
          0% { transform: scale(1); opacity: .95; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: .95; }
        }
        .menu { position: relative; }
        .menu > summary {
          list-style: none; cursor: pointer;
          padding: 6px 10px; border-radius: 10px;
          color: #E5E7EB; font-weight: 600; font-size: 13px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .menu[open] > summary { background: rgba(255,255,255,0.06); }
        .dropdown {
          position: absolute; top: 100%; left: 0; min-width: 220px; margin-top: 6px;
          background: #0B1220; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          box-shadow: 0 10px 24px rgba(0,0,0,.35); padding: 8px;
        }
        .item, .subLabel {
          display: block; padding: 8px 10px; border-radius: 8px;
          color: #D1D5DB; text-decoration: none; font-size: 13px;
        }
        .item:hover { background: rgba(255,255,255,0.06); color: #FFFFFF; }
        .subLabel { font-weight: 700; color: #9CA3AF; padding-top: 6px; }
      `}</style>
    </header>
  );
}

function DetailsMenu({ label, items }: { label: string; items: Array<NavLink | NavGroup> }) {
  return (
    <details className="menu">
      <summary role="button" aria-haspopup="menu" aria-expanded="false">
        {label}
      </summary>
      <div className="dropdown" role="menu" aria-label={label}>
        {items.map((x, idx) =>
          isGroup(x) ? (
            <div key={`${label}-${idx}`}>
              <div className="subLabel">{x.label}</div>
              {x.children.map((c, j) =>
                isGroup(c) ? (
                  <div key={`${label}-${idx}-${j}`}>
                    <div className="subLabel" style={{ paddingLeft: 8 }}>{c.label}</div>
                    {c.children.map((leaf, k) =>
                      isGroup(leaf) ? null : (
                        <Link key={`${label}-${idx}-${j}-${k}`} href={leaf.href} className="item" role="menuitem">
                          {leaf.label}
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  <Link key={`${label}-${idx}-${j}`} href={c.href} className="item" role="menuitem">
                    {c.label}
                  </Link>
                )
              )}
            </div>
          ) : (
            <Link key={`${label}-${idx}`} href={x.href} className="item" role="menuitem">
              {x.label}
            </Link>
          )
        )}
      </div>
    </details>
  );
}