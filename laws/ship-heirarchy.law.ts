// /laws/ship-hierarchy.law.ts
/**
 * corAe Constitutional Law — Ship Hierarchy
 *
 * 1. Ship = Live runtime (business/work/home)
 * 2. Dockyard = Internal dev/test environment for new modules
 * 3. Shipyard = Blueprint and template factory used by Studio to generate new Ships
 * 4. Studio = Overseer and orchestrator that connects all
 *
 * Import & Responsibility Rules:
 * ───────────────────────────────────────────────
 * - Shipyard → exports → @corae/ship-ui  ✅
 * - Dockyard → tests Shipyard exports ✅
 * - Studio → imports from Shipyard (for editing/templates) ✅
 * - Ship → imports from @corae/ship-ui only ✅
 *
 * ❌ No file in Ship may import from Studio, Dockyard, or Shipyard.
 * ❌ Dockyard may not be deployed to production.
 *
 * Path summary:
 * apps/
 *   ├─ studio/      → /apps/studio/app/
 *   │   ├─ shipyard/   → blueprint factory
 *   │   ├─ dockyard/   → dev & QA playground
 *   │   └─ ship/       → proxy or preview of live ships
 *   └─ ship/         → live runtime
 *
 * packages/
 *   └─ ship-ui/      → shared components used by both Ship & Studio
 *
 * Goal: One source of truth. One direction of flow. No circular imports.
 */
export const SHIP_HIERARCHY_LAW = {
  studio: {
    purpose: "Oversees all ships and manages templates",
    mayImport: ["shipyard", "ship-ui"],
    mayNotImport: ["ship"]
  },
  shipyard: {
    purpose: "Defines and maintains blueprint components/templates",
    exportsTo: ["ship-ui"],
    mayImport: []
  },
  dockyard: {
    purpose: "Testing ground for Shipyard modules",
    mayImport: ["shipyard"],
    mayNotExport: ["ship-ui"]
  },
  ship: {
    purpose: "Live runtime (Business, Work, Home)",
    mayImport: ["ship-ui"],
    mayNotImport: ["studio", "dockyard", "shipyard"]
  }
} as const;