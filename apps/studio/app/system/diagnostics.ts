// apps/studio/app/system/diagnostics.ts
/**
 * corAe System Diagnostics
 * Provides runtime introspection, engine status reporting,
 * and health summaries across all mounted modules.
 */

import { ENGINES } from "./registry/engines"
import { bootEngines } from "./boot"

export interface EngineHealth {
  id: string
  name: string
  version: string
  stage: string
  integrations: Record<string, boolean>
  events: string[]
  status: "ok" | "warning" | "error"
  lastUpdated: string
}

/**
 * Perform a full system scan of all registered engines.
 * Returns basic health data (mocked until heartbeat pings are wired in).
 */
export async function systemDiagnostics(): Promise<EngineHealth[]> {
  const engines = bootEngines()
  return engines.map((e) => ({
    id: e.id,
    name: e.name,
    version: e.version,
    stage: e.status?.stage ?? "unknown",
    integrations: e.integrations ?? {},
    events: e.events ?? [],
    status: "ok",
    lastUpdated: e.status?.lastUpdated ?? new Date().toISOString(),
  }))
}

/**
 * Simple string summary for console output or dashboard badges.
 */
export async function printDiagnostics() {
  const report = await systemDiagnostics()
  console.group("⚙️ corAe OS² — Engine Diagnostics")
  report.forEach((r) => {
    console.log(
      `→ ${r.name} [${r.stage}] (${r.version}) :: ${Object.keys(r.integrations)
        .filter((k) => r.integrations[k])
        .join(", ")}`,
    )
  })
  console.groupEnd()
  return report
}