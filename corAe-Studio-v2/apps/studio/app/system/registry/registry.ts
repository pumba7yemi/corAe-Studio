// apps/studio/app/system/registry/register.ts
/**
 * corAe System Registry — Dynamic Engine Registration
 * Allows new engines (modules) like Reserve™, Finance™, or CIMS™
 * to self-register during build or runtime discovery.
 */

import { ENGINES, ENGINE_MAP } from "./engines";
import type { EngineManifest } from "./engines";

/**
 * Register a new engine manifest dynamically.
 * Ensures uniqueness by engine ID and updates ENGINE_MAP at runtime.
 */
export function registerEngine(manifest: EngineManifest) {
  const exists = ENGINES.find((e) => e.id === manifest.id);
  if (!exists) {
    ENGINES.push(manifest);
    ENGINE_MAP[manifest.id] = manifest;
    console.info(`[corAe System] Registered engine → ${manifest.name}`);
  } else {
    console.info(`[corAe System] Engine already registered → ${manifest.name}`);
  }
}

/**
 * Retrieve an engine manifest by ID.
 */
export function getEngine(id: string): EngineManifest | null {
  return ENGINE_MAP[id] ?? null;
}

/**
 * Diagnostic summary of all registered engines.
 */
export function engineSummary() {
  return ENGINES.map((e) => ({
    id: e.id,
    name: e.name,
    version: e.version,
    status: e.status?.stage ?? "unknown",
    category: e.category ?? "generic",
    lastUpdated: e.status?.lastUpdated ?? new Date().toISOString(),
  }));
}