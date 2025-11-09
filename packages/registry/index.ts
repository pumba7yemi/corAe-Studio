// Post-1.0 we’ll move the real Engine registry here.
// Stub keeps imports stable.
export const REGISTRY = { engines: [], version: "1.0-shim" } as const;
export const buildNav = () => [] as any[];