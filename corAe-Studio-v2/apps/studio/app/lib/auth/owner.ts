export async function getOwnerId() {
  try {
    const mod = await import("next/headers");
    const h = await mod.headers();
    const x = h.get("x-corae-owner");
    if (x) return x;
  } catch {}
  return "owner_demo";
}
