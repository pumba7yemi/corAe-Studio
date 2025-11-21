declare const require: any;

// Use a runtime require fallback so the file doesn't attempt a module augmentation
// that the TypeScript compiler can't resolve.
let loadRules: () => { allowedFaithRoots?: string[] };

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("caia-core/build-memory");
  loadRules = (mod && typeof mod.loadRules === "function") ? mod.loadRules : () => ({});
} catch {
  loadRules = () => ({});
}

export const allowedFaithRoots = () => (loadRules().allowedFaithRoots ?? []);
