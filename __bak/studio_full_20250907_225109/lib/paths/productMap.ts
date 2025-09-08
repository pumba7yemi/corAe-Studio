// server-only helpers for file paths (do NOT import from client components)

import fs from "node:fs";
import path from "node:path";

function firstExisting(paths: string[]) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore and continue
    }
  }
  return paths[0];
}

// Prefer repo root; fall back to in-app locations (works on your structure)
export const PRODUCT_MAP_PATH = firstExisting([
  path.join(process.cwd(), "product-map.json"),
  path.join(process.cwd(), "apps", "studio", "product-map.json"),
  path.join(process.cwd(), "corAe-Studio", "product-map.json")
]);

export const BUILD_STATUS_PATH = firstExisting([
  path.join(process.cwd(), "build-status.json"),
  path.join(process.cwd(), "apps", "studio", "build-status.json"),
  path.join(process.cwd(), "corAe-Studio", "build-status.json")
]);