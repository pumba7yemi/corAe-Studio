// apps/studio/scripts/seed-memory-packs.cjs
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  // 1) Vendor
  const vendor = await p.memoryVendor.upsert({
    where: { id: 'v-caia' },
    update: {},
    create: { id: 'v-caia', name: 'corAe / CAIA', website: 'https://corae.app' }
  });

  // 2) Pack (versioned)
  const pack = await p.memoryPack.create({
    data: {
      vendorId: vendor.id,
      slug: 'caia-core',
      version: '1.0.0',
      title: 'CAIA Core Persona Pack',
      notes: 'Innate identity, tone, style, and core rules',
      signature: null
    }
  });

  // 3) Pack items (immutable at this version)
  await p.memoryPackItem.createMany({
    data: [
      { packId: pack.id, kind: 'identity', subject: 'CAIA', content: 'Persona: calm, warm British; precise and encouraging.', tags: 'persona,style' },
      { packId: pack.id, kind: 'policy',   subject: 'Guidelines', content: 'Use Baby Steps™ and 150-Logic for clarity; avoid jargon; be kind.', tags: 'rules' },
      { packId: pack.id, kind: 'lexicon',  subject: 'Pronunciations', content: 'corAe=CORE-ay; CIMS=SIMZ; OBARI=oh-BAH-ree', tags: 'lexicon' }
    ]
  });

  // 4) Tenant (white-label brand) + install the pack
  const tenant = await p.memoryTenant.upsert({
    where: { brandSlug: 'default' },
    update: {},
    create: { name: 'Default Tenant', brandSlug: 'default' }
  });

  await p.memoryInstall.upsert({
    where: { tenantId_packId: { tenantId: tenant.id, packId: pack.id } },
    update: {},
    create: { tenantId: tenant.id, packId: pack.id }
  });

  console.log('Seeded vendor, caia-core@1.0.0, items, and installed to tenant:default');
  process.exit(0);
})();