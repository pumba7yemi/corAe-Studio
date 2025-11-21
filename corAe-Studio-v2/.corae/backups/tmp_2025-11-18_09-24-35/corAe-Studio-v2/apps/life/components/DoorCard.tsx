// apps/life/components/DoorCard.tsx
"use client";

import React from "react";

interface DoorCardProps {
  label: string;
  description: string;
}

export function DoorCard({ label, description }: DoorCardProps) {
  return (
    <article
      style={{
        borderRadius: 16,
        padding: "1rem 1.25rem",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
      }}
    >
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </h3>
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>{description}</p>
    </article>
  );
}