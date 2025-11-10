import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  // Attempt to dynamically import the optional package at runtime.
  // @ts-ignore - the package may not exist in some environments, so skip type checking here.
  const mod = await import("caia-core/build-memory").catch(() => null);
  const loadRom = mod?.loadRom;
  const loadRam = mod?.loadRam;

  const rom = loadRom ? loadRom() : null;
  const ram = loadRam ? loadRam() : null;
  return new Response(JSON.stringify({ rom: !!rom, ram: !!ram, gitHead: rom?.gitHead || null }), {
    headers: { "Content-Type": "application/json" },
  });
}