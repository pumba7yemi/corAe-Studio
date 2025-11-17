export type MemoryLayer = "global" | "vertical" | "brand" | "tenant";
export type TenantContext = { vertical?: string; brand?: string; tenant?: string; };

export function resolveContext(hint?: Partial<TenantContext>): TenantContext {
  return {
    vertical: hint?.vertical ?? process.env.CAIA_VERTICAL ?? "default-vertical",
    brand:    hint?.brand    ?? process.env.CAIA_BRAND    ?? "default-brand",
    tenant:   hint?.tenant   ?? process.env.CAIA_TENANT   ?? "default-tenant",
  };
}

export const READ_ORDER: MemoryLayer[] = ["global", "vertical", "brand", "tenant"];
export function isDnaLayer(layer: MemoryLayer) { return layer !== "tenant"; }
