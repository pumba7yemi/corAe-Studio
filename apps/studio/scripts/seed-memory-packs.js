const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const vendor = await p.memoryVendor.upsert({
    where: { id: 'v-caia' },
    update: {},
    create: { id: 'v-caia', name: 'corAe / CAIA', website: 'https://corae.app' }
  });

  const pack = await p.memoryPack.create({
    data: {
      vendorId: vendor.id,
      slug: 'caia-core',
      version: '1.0.0',
      title: 'CAIA Core Persona Pack',
      notes: 'Innate identity, tone, style, core rules',
      signature: null
    }
  });

  await p.memoryPackItem.createMany({
    data: [
      { packId: pack.id, kind: 'identity', subject: 'CAIA', content: 'Persona: calm, warm British; precise and encouraging.', tags: 'persona,style' },
      { packId: pack.id, kind: 'policy',   subject: 'Guidelines', content: 'Be concise, no slang, prioritize 150-logic steps.', tags: 'rules' },
      { packId: pack.id, kind: 'lexicon',  subject: 'Pronunciations', content: 'corAe=CORE-ay; CIMS=SIMZ; OBARI=oh-BAH-ree', tags: 'lexicon' },
    ]
  });

  const tenant = await p.memoryTenant.upsert({
    where: { brandSlug: 'default' },
    update: {},
    create: { name: 'Default Tenant', brandSlug: 'default' }
  });

  await p.memoryInstall.create({
    data: { tenantId: tenant.id, packId: pack.id }
  });

  console.log('Seeded vendor, pack 1.0.0, items, and installed to tenant:default');
  process.exit(0);
})();