// Prefer a shared Prisma singleton exported by the workspace memory-core package
// (falls back to a local PrismaClient when not available).
import { PrismaClient } from '@prisma/client';
let prisma: PrismaClient;
try {
  // try to reuse shared singleton if package present
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const memCore = require('@corae/memory-core');
  prisma = memCore?.prisma ?? new PrismaClient();
} catch (e) {
  prisma = new PrismaClient();
}

/** Install a specific pack version for a tenant (idempotent) */
export async function installPack(tenantSlug: string, packSlug: string, version: string) {
  const tenant = await (prisma as any).memoryTenant.findUnique({ where: { brandSlug: tenantSlug }, select: { id: true } });
  if (!tenant) throw new Error('Unknown tenant');

  const pack = await (prisma as any).memoryPack.findFirst({ where: { slug: packSlug, version }, select: { id: true } });
  if (!pack) throw new Error('Unknown pack/version');

  await (prisma as any).memoryInstall.upsert({
    where: { tenantId_packId: { tenantId: tenant.id, packId: pack.id } },
    update: {},
    create: { tenantId: tenant.id, packId: pack.id }
  });

  return { ok: true, packId: pack.id };
}

/** Update path: move tenant from old -> new version of same slug (simple strategy) */
export async function updatePack(tenantSlug: string, packSlug: string, newVersion: string) {
  const tenant = await (prisma as any).memoryTenant.findUnique({ where: { brandSlug: tenantSlug }, select: { id: true } });
  const newPack = await (prisma as any).memoryPack.findFirst({ where: { slug: packSlug, version: newVersion }, select: { id: true } });
  if (!tenant || !newPack) throw new Error('Tenant or pack not found');

  // Find existing installs for same slug, then replace with new pack
  const vendorPacks = await (prisma as any).memoryPack.findMany({ where: { slug: packSlug }, select: { id: true } });
  const installed = await (prisma as any).memoryInstall.findMany({
    where: { tenantId: tenant.id, packId: { in: vendorPacks.map((p: any) => p.id) } },
    select: { id: true }
  });

  // remove old installs (keep override table intact) and install new
  if (installed.length) {
  await (prisma as any).memoryInstall.deleteMany({ where: { id: { in: installed.map((i: any) => i.id) } } });
  }
  await (prisma as any).memoryInstall.create({ data: { tenantId: tenant.id, packId: newPack.id } });

  return { ok: true, newPackId: newPack.id };
}

/** Learned memory (experience) */
export async function remember(tenantSlug: string, data: {
  userId?: string, kind: 'fact'|'preference'|'task'|'note'|'identity',
  subject?: string, content: string, tags?: string[], importance?: number, ttlDays?: number, source?: string
}) {
  const tenant = await (prisma as any).memoryTenant.findUnique({ where: { brandSlug: tenantSlug }, select: { id: true } });
  if (!tenant) throw new Error('Unknown tenant');

  const expireAt = data.ttlDays ? new Date(Date.now() + data.ttlDays*86400000) : null;

  const importance = Math.min(5, Math.max(1, Number.isFinite((data as any).importance) ? (data.importance as number) : 1));

  return (prisma as any).learnedMemory.create({
    data: {
      tenantId: tenant.id,
      userId: data.userId ?? null,
      kind: data.kind as any,
      subject: data.subject ?? null,
      content: data.content,
      tags: data.tags?.join(',') ?? null,
      importance,
      source: data.source ?? 'chat',
      expireAt
    }
  });
}

/** Recall merged view: (Overrides ⟶ Pack Items ⟶ Learned), ranked */
export async function recall(tenantSlug: string, query: string, limit = 12) {
  const tenant = await (prisma as any).memoryTenant.findUnique({ where: { brandSlug: tenantSlug }, select: { id: true } });
  if (!tenant) throw new Error('Unknown tenant');

  // 1) Pack items installed for tenant
  const installs = await (prisma as any).memoryInstall.findMany({ where: { tenantId: tenant.id }, select: { packId: true } });
  const packIds = installs.map((i: any) => i.packId);

  // Rank: FTS hits from pack + learned, then boost overrides & importance, then recency
  let packRows: any[] = [];
  // If no installs, skip pack query to avoid SQL `IN ()` syntax error
  if (packIds.length > 0) {
    const escapedQuery = query.replace(/"/g,'""');
    packRows = await prisma.$queryRawUnsafe(`
      SELECT mpi.id as id, mpi.kind as kind, mpi.subject as subject, mpi.content as content, mpi.tags as tags,
             0 as importance, null as lastUsedAt,
             (1.0 / (1.0 + bm25(memory_pack_fts))) as bm25Score,
             'pack' as source
      FROM memory_pack_fts f
      JOIN MemoryPackItem mpi ON mpi.id = f.packItemId
      WHERE memory_pack_fts MATCH ?
        AND mpi.packId IN (${packIds.map(() => '?').join(',')})
      LIMIT ?;
    `, escapedQuery, ...packIds, limit);
  }

  const learnedRows: any[] = await prisma.$queryRawUnsafe(`
    SELECT lm.id as id, CAST(lm.kind as TEXT) as kind, lm.subject, lm.content, lm.tags,
           lm.importance as importance, lm.lastUsedAt as lastUsedAt,
           (1.0 / (1.0 + bm25(learned_memory_fts))) as bm25Score,
           'learned' as source
    FROM learned_memory_fts f
    JOIN LearnedMemory lm ON lm.id = f.memoryId
    WHERE learned_memory_fts MATCH ?
      AND lm.tenantId = ?
    LIMIT ?;
  `, query.replace(/"/g,'""'), tenant.id, limit);

  // Apply overrides on top of pack results
  const overrideRows = await (prisma as any).memoryOverride.findMany({ where: { tenantId: tenant.id } });
  const overrideMap = new Map(overrideRows.map((o: any) => [o.packItemId, o]));

  const merged = [...packRows.map(r => {
      const ov = overrideMap.get(r.id);
      if (ov) return { ...r, content: (ov as any).content, tags: (ov as any).tags ?? r.tags, source: 'override' };
      return r;
    }),
    ...learnedRows
  ];

  // Re-rank
  const ranked = merged.map(r => {
    const importance = Number(r.importance ?? 1);
    const recencyBoost = r.lastUsedAt ? (1 / (1 + (Date.now() - new Date(r.lastUsedAt).getTime())/86400000)) : 1;
    const base = Number(r.bm25Score ?? 0.5);
    const srcBoost = r.source === 'override' ? 1.4 : (r.source === 'pack' ? 1.2 : 1.0);
    return { ...r, finalScore: base * (1 + 0.2*(importance-1)) * srcBoost * (1 + 0.3*recencyBoost) };
  }).sort((a,b) => b.finalScore - a.finalScore).slice(0, limit);

  // Touch learned lastUsedAt
  const learnedIds = ranked.filter(r => r.source === 'learned').map(r => r.id);
  if (learnedIds.length) {
    await (prisma as any).learnedMemory.updateMany({ where: { id: { in: learnedIds } }, data: { lastUsedAt: new Date() } });
  }
  return ranked;
}

// Lightweight in-process RAM store used by some runtime modules during build/dev.
// This is a minimal compatibility shim: consumers expect an async get/set/del
// keyed by an id (e.g. workflow run id) and a secondary key string.
const _ram = new Map<string, any>();

export const RAM = {
  async get<T = any>(id: string, key: string): Promise<T | null> {
    const v = _ram.get(`${id}:${key}`);
    return (v === undefined) ? null : (v as T);
  },
  async set(id: string, key: string, value: any) {
    _ram.set(`${id}:${key}`, value);
    return { ok: true };
  },
  async del(id: string, key: string) {
    _ram.delete(`${id}:${key}`);
    return { ok: true };
  }
};
