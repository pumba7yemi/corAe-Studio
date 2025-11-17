// app/obari/layout.tsx
import React from "react";
import type { ReactNode } from "react";

// NOTE: EventsProvider is client-only; keep the wrapper below as "use client".
import { EventsProvider } from "@/components/obari/EventsStore";

function Providers({ children }: { children: ReactNode }) {
  "use client";
  return <EventsProvider>{children}</EventsProvider>;
}

export default function ObariLayout({ children }: { children: ReactNode }) {
  // This file stays a Server Component; only the small Providers wrapper is client.
  return <Providers>{children}</Providers>;
}
