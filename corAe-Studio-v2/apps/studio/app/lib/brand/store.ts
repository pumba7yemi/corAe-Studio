import type { BrandConfig } from "./types";

// 🔁 Replace with DB later. For now, demo tenant only.
const BRANDS: Record<string, BrandConfig> = {
  demo: {
    tenantId: "demo",
    theme: {
      name: "corAe",
      logoText: "corAe",
      primary: "#1C7CF5",
      surface: "#ffffff",
      text: "#0a0a0a",
      muted: "#6b7280",
      radius: "16px",
    },
  },
};

export const getBrand = async (tenantId = "demo") => BRANDS[tenantId];
export const setBrand = async (cfg: BrandConfig) => { BRANDS[cfg.tenantId] = cfg; return cfg; };
