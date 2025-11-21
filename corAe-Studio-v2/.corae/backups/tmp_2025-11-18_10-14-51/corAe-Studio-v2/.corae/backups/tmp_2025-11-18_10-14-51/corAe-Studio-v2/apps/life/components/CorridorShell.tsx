// apps/life/components/CorridorShell.tsx
"use client";

import React from "react";
import { DoorCard } from "./DoorCard";

export function CorridorShell() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        padding: "1.5rem"
      }}
    >
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
          corAe Life OS
        </h1>
        <p style={{ maxWidth: 520, opacity: 0.8 }}>
          Corridor view. Start in Home, cross into Work, and open the
          Business door when you need the cockpit. CAIA, Diary, and CIMS
          live here in the middle.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem"
        }}
      >
        <DoorCard
          label="Home"
          description="Morning pulse, faith, wellbeing, family, daily living."
        />
        <DoorCard
          label="Work"
          description="WorkFocus, 3³ Diary, tasks, rota, CIMS for your day."
        />
        <DoorCard
          label="Business"
          description="Owner view: OBARI, finance, vendors, issues, strategy."
        />
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: 8 }}>
          Today’s Pulse (stub)
        </h2>
        <p style={{ opacity: 0.8 }}>
          This will become the Life pulse strip: CAIA note, diary snapshot,
          and key signals from Home, Work, and Business.
        </p>
      </section>
    </main>
  );
}