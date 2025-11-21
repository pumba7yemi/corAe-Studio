export interface ShipConfig {
  id: string;
  name?: string;
  industry?: string;
  region?: string;
  [key: string]: any;
}

export async function loadShipConfig(id: string): Promise<ShipConfig | null> {
  try {
    const res = await fetch(`/api/ships/${encodeURIComponent(id)}/config`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.config ? { id, ...data.config } : { id };
  } catch {
    return null;
  }
}

export async function saveShipConfig(
  id: string,
  config: ShipConfig
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/ships/${encodeURIComponent(id)}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error ?? "Failed to save ship config" };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Network error" };
  }
}
