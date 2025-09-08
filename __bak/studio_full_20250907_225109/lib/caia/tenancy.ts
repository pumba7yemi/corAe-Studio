export type MemoryLayer = "global" | "vertical" | "brand" | "tenant";

export type TenantContext = {
  vertical?: string;  // e.g., "hotel"
  brand?: string;     // e.g., "sunrise-resorts"
  tenant?: string;    // e.g., "hotel-123-downtown"
};

// Pull from caller hint or env; replace with real resolver later (domain/auth)
export function resolveContext(hint?: Partial<TenantContext>): TenantContext {
  return {
    vertical: hint?.vertical ?? process.env.CAIA_VERTICAL ?? undefined,
    brand:    hint?.brand    ?? process.env.CAIA_BRAND    ?? undefined,
    tenant:   hint?.tenant   ?? process.env.CAIA_TENANT   ?? undefined,
  };
}

// Read overlay order: least → most specific
export const READ_ORDER: MemoryLayer[] = ["global", "vertical", "brand", "tenant"];

// DNA layers are not wipeable unless force=true
export function isDnaLayer(layer: MemoryLayer) {
  return layer === "global" || layer === "vertical" || layer === "brand";
}