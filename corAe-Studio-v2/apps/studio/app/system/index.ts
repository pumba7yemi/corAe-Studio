// apps/studio/app/system/index.ts
import { ENGINES, ENGINE_MAP } from "./registry/engines";
export { ENGINES, ENGINE_MAP };

export type EngineStatus = {
  id: string;
  name: string;
  version: string;
  status: string;
  lastUpdated: string;
};

export function listEngines(): EngineStatus[] {
  return Object.values(ENGINE_MAP).map((m: any) => ({
    id: m.id,
    name: m.name,
    version: m.version,
    status: m.status?.stage ?? "beta",
    lastUpdated: m.status?.lastUpdated ?? new Date().toISOString(),
  }));
}