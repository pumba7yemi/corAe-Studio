// FILE: prisma/seed.ts
/**
 * Seeds a single Health row. Keeps DB table named `_Health` via @@map in schema.
 * Exit codes matter for CI.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.health.create({
    data: { note: 'ok' },
  });
  console.log('Seeded Health:', row.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Seed failed:', e?.message ?? e);
    await prisma.$disconnect();
    process.exit(1);
  });
