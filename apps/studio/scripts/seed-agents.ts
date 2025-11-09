// apps/studio/scripts/seed-agents.ts
import { PrismaClient } from '@prisma/client'
const db: any = new PrismaClient()

async function main() {
  const tenant = await db.tenant.create({ data: { name: 'corAe Demo' } })
  const user   = await db.user.create({ data: { email: 'founder@demo.local', name: 'Founder', tenantId: tenant.id } })

  await db.aIAgent.create({
    data: {
      key: 'CAIA',
      name: 'CAIA – Chief AI',
      tenantId: tenant.id,
      ownerUserId: user.id,
      capabilities: { read: ['OBARI','FIN'], write: ['OMS.Task'] }
    }
  })
  console.log('Seeded demo tenant, user, agent.')
}
main().finally(()=>db.$disconnect())