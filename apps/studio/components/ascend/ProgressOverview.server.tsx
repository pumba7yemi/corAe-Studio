import React from "react";
import ProgressOverviewClient from "./ProgressOverview.client";
import { readShipMemory } from "@/caia/memory";

const SCOPE = "social-contract-audit";
const KEY = "entries";

export default async function ProgressOverview() {
  try {
  const store = await (readShipMemory as any)(SCOPE);
    const raw = (store as any)?.get ? (store as any).get(KEY) : (store as any)?.[KEY];
    const entries = raw ? JSON.parse(raw) : [];
    const domains = { home: false, work: false, business: false };
    for (const e of entries) {
      const d = String(e?.domain ?? "").toLowerCase();
      if (d === "home") domains.home = true;
      if (d === "work") domains.work = true;
      if (d === "business") domains.business = true;
    }
    return <ProgressOverviewClient initial={domains} />;
  } catch (e) {
    // If memory read fails, render client with all false
    return <ProgressOverviewClient initial={{ home: false, work: false, business: false }} />;
  }
}
