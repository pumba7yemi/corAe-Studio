"use client";
import React from "react";

export default function EthosCard({ className = "" }: { className?: string }) {
  return (
    <section className={`rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 ${className}`}>
      <h3 className="text-lg font-semibold">Ethos</h3>
      <p className="mt-2 text-sm text-zinc-300">“We are corAe — the mother to the mother, the colleague to the worker, the silent partner to the owner.”</p>
    </section>
  );
}
