// app/lib/brand/config.ts
export type BrandConfig = {
  name: string;
  tagline?: string;
  logo?: string;           // URL/path
  jurisdiction?: string;   // e.g., "UAE"
  immutableLaws?: {
    priceLockChain: boolean;
    corAeConfirmed: boolean;
    governanceRoutes: boolean;
  };
  updatedAt: string;
};

// In-memory for Phase 1 (swap to DB in Phase 2)
let BRAND: BrandConfig = {
  name: "corAe",
  tagline: "Business Consultancy, Software & Management",
  updatedAt: new Date().toISOString(),
};

export const Brand = {
  get: async (): Promise<BrandConfig> => BRAND,
  set: async (partial: Partial<BrandConfig>): Promise<BrandConfig> => {
    BRAND = { ...BRAND, ...partial, updatedAt: new Date().toISOString() };
    return BRAND;
  },
  reset: async () => {
    BRAND = {
      name: "corAe",
      tagline: "Business Consultancy, Software & Management",
      updatedAt: new Date().toISOString(),
    };
    return BRAND;
  },
};
