// apps/studio/src/caia/memory.ts
// ------------------------------------------------------------------
// corAe CAIA Memory Bridge
// Shim layer for all memory helpers — ensures imports like "@/caia/memory"
// resolve correctly, while actually pointing to @corae/caia-core/memory.
//
// This keeps core logic inside packages/caia-core but lets the Studio app
// access it using its usual alias imports.
// ------------------------------------------------------------------

// Resolve directly to source to avoid package type resolution ambiguity during workspace builds
// `@corae/caia-core` historically used CommonJS-style exports. For ES module
// builds we import the whole module and re-export what we need as named
// exports plus a default export. This avoids `export =` which isn't valid
// when targeting ES modules.
import * as caiaCore from "@corae/caia-core";

// Default export of the upstream module (keeps compatibility for callers
// that expect the module namespace).
export default caiaCore as any;

// Provide named helpers expected by the app. Use `any` to avoid type errors
// if the upstream package doesn't include types in the workspace build.
export const readShipMemory = (caiaCore as any).readShipMemory;
export const writeShipMemory = (caiaCore as any).writeShipMemory;