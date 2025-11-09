// apps/studio/scripts/seed-caia.cjs
const { PrismaClient, MemoryKind } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  // seed a few learned memories
  await p.caiaMemory.createMany({
    data: [
      { kind: MemoryKind.identity, subject: 'CAIA', content: 'Persona: calm, warm British; precise and encouraging.', importance: 4, source: 'seed' },
      { kind: MemoryKind.preference, subject: 'owner', content: 'Prefers Baby Steps™ and 150-logic instructions.', tags: 'style,onboarding', importance: 5, source: 'seed' },
      { kind: MemoryKind.task, subject: 'Workfocus', content: 'MorningExec: vendor chases at 09:00 daily.', tags: 'workfocus,habit', importance: 3, source: 'seed' }
    ]
  });
  console.log('Seeded CAIA learned memories');
  process.exit(0);
})();