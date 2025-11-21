// scripts/onebuild/export.mjs
// Tiny CLI to create the ZIP without any route.

import { createShipBundle } from "../../lib/build/ship.js";

// crude arg parse
const args = process.argv.slice(2).join(" ");
const flag = (k) => new RegExp(`--${k}(?:=(\\S+))?`).exec(args)?.[1] ?? null;
const has  = (k) => new RegExp(`\\b--${k}\\b`).test(args);

const brand = flag("brand") || "corae";
const modules = (flag("modules") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const includePublic   = has("include-public");
const includeServices = has("include-services");
const includeScripts  = has("include-scripts");

const extras = (flag("extra") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

(async () => {
  try {
    const path = await createShipBundle({
      brand: { slug: brand, name: brand },
      modules: modules.length ? modules : undefined,
      includePublic,
      includeServices,
      includeScripts,
      extraAppDirs: extras,
    });
    console.log("✅ One-Build created:", path);
  } catch (e) {
    console.error("❌ One-Build failed:", e?.message || e);
    process.exit(1);
  }
})();