// apps/studio/app/system/boot.ts
import { ENGINES } from "./registry/engines";

/**
 * Boot corAe engines at runtime.
 * Returns a summary suitable for diagnostics and UI.
 */
export function bootEngines() {
  return ENGINES.map((e) => ({
    id: e.id,
    name: e.name,
    version: e.version,
    routes: e.paths?.dashboard ? [e.paths.dashboard] : [],
    events: e.events ?? [],
    integrations: e.integrations ?? {},
    status: e.status ?? {},
  }));
}

export default bootEngines;