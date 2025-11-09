import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await (prisma as any).homeTaskTemplate.upsert({
    where: { key: 'timesense-leave-home' },
    update: {},
    create: { key: 'timesense-leave-home', title: 'Prepare to leave (shower, breakfast, keys, car)', haveYouKey: 'HY_TIMESENSE_LEAVE', defaultMins: 25 }
  });
}

main().catch(console.error).finally(() => process.exit(0));
