import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  // Attempt to dynamically import the optional package at runtime.
  // Use the package main entry (@corae/caia-core) rather than a deep subpath so
  // bundlers don't fail to resolve missing optional sub-exports during build.
  // @ts-ignore - the package may not exist in some environments, so skip type checking here.
  const mod = await import("@corae/caia-core").catch(() => null);

  // The caia-core package exposes memory helpers; we only need to detect presence
  // (boolean) for the lightweight probe used by the UI. If more detailed ROM/RAM
  // shapes are added later, this can call those helpers.
  const hasDockyard = typeof mod?.readDockyardMemory === "function";
  const hasShip = typeof mod?.readShipMemory === "function";

  const rom = hasDockyard ? { gitHead: null } : null;
  const ram = hasShip ? {} : null;

  return new Response(JSON.stringify({ rom: !!rom, ram: !!ram, gitHead: rom?.gitHead || null }), {
    headers: { "Content-Type": "application/json" },
  });
}