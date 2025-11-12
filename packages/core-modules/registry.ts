export type ModuleKey = "Business" | "Work" | "Home";

export interface ModuleRegistry {
  Business: boolean;
  Work: boolean;
  Home: boolean;
}

let REGISTRY: ModuleRegistry = {
  Business: true,
  Work: true,
  Home: true,
};

// In real app, drive this from DB / JWT claims / tenant config.
export function getModuleRegistry(): ModuleRegistry {
  return REGISTRY;
}
export function setModuleRegistry(next: Partial<ModuleRegistry>) {
  REGISTRY = { ...REGISTRY, ...next };
}
