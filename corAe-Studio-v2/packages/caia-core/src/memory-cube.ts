// If you had `import type { TenantCtx } from "tenancy";` remove it.
// Define a minimal local shape for now:
export type TenantCtx = {
  tenantId?: string;
  brandSlug?: string;
  userId?: string;
};

// Sanity helpers for layering (stubbed)
export function zedLayer(layer: string, _ctx?: TenantCtx, _limit?: number) {
  // e.g., normalize known layers: "dockyard" | "ship" | "seed"
  const ok = ["dockyard", "ship", "seed"].includes(layer);
  return ok ? layer : "dockyard";
}

export function mapLayer(layer: string, _ctx?: TenantCtx, _force?: boolean) {
  // Right now we just confirm the layer exists.
  return ["dockyard", "ship", "seed"].includes(layer);
}