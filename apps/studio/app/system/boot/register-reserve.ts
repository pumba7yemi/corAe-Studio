// apps/studio/app/system/boot/register-reserve.ts
/**
 * Auto-register corAe Reserve™ Engine at boot.
 * This ensures Reserve always mounts into the system registry before runtime.
 */

import ReserveManifest from "@/app/marketplace/reserve/manifest";
import { registerEngine } from "@/app/system/registry/registry";

export function registerReserve() {
  try {
    registerEngine(ReserveManifest);
  } catch (e) {
    console.warn("[corAe System] Reserve registration failed:", (e as Error).message);
  }
}

// Run immediately on import
registerReserve();