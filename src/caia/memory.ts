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
export { readDockyardMemory, writeDockyardMemory, readShipMemory, writeShipMemory } from "../../packages/caia-core/src/memory";
// If/when memory-cube exports real functions, re-export them explicitly.