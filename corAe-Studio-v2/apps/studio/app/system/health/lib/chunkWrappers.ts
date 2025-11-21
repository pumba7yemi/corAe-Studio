export type ChunkWrapperStatus = { ok: boolean; details: string[]; checkedAt: string };

export async function getChunkWrapperStatus(): Promise<ChunkWrapperStatus> {
  try {
    const res = await fetch(process.env.INTERNAL_HEALTH_CHUNKS_URL ?? "/api/system/health/chunks", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { ok: false, details: [String(e?.message ?? e)], checkedAt: new Date().toISOString() };
  }
}
