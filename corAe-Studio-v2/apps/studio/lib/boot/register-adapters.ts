// Minimal register-adapters shim used by server-side bootstrapping
export async function registerAdapters() {
  // Intentionally minimal: real adapter registration happens at runtime in full env
  return;
}

export default registerAdapters;
