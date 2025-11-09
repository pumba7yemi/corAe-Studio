import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // The repository's Prisma schema defines a `WorkfocusTask` model (prisma.workfocusTask).
  // Create a compatible WorkfocusTask seed instead of referencing a non-existing
  // `workFocus` model. We store legacy fields inside `meta` so the app can still
  // read `haveYouKey` and `phase` if needed.
  await (prisma as any).workfocusTask.create({
    data: {
      ownerUserId: 'subject1',
      bucket: 'default',
      title: 'Daily Work Pulse',
      status: 'open',
      meta: { haveYouKey: 'HY_DAILY_PULSE', phase: 'Active' },
    },
  }).catch(() => {});
}

main().catch(console.error).finally(() => process.exit(0));
