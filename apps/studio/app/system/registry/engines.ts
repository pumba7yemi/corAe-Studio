// apps/studio/app/system/registry/engines.ts
import ReserveManifest from "@/app/marketplace/reserve/manifest";

export type EngineManifest = typeof ReserveManifest;

export const ENGINES: EngineManifest[] = [
  ReserveManifest,
];

export const ENGINE_MAP = Object.fromEntries(
  ENGINES.map((e) => [e.id, e])
);

export default ENGINES;