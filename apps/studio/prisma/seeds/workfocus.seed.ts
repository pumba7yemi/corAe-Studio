// apps/studio/prisma/seeds/workfocus.seed.ts
import * as PrismaPkg from "@prisma/client";
const prisma = new (PrismaPkg as any).PrismaClient();

/**
 * Seed three workflow templates for a live demo tenant.
 * Re-runnable (upsert). Safe in any environment.
 */
export async function seedWorkfocus() {
  const T = [
    { slug: "retail-daily", name: "Retail Daily Ops", json: { checks: ["Opening float","Expiry scan","Best-sellers restock"] } },
    { slug: "salon-daily",  name: "Salon Daily Ops",  json: { checks: ["Chairs sanitised","Towels count","Stock colourants"] } },
    { slug: "waste-daily",  name: "Waste Brokerage Daily", json: { checks: ["Weighbridge sync","WTNs audit","Routes confirm"] } },
  ];

  for (const t of T) {
    await (prisma as any).workflowTemplate.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, name: t.name, json: t.json as any },
      update: { name: t.name, json: t.json as any },
    });
  }
}

if (require.main === module) {
  seedWorkfocus()
    .then(() => console.log("WorkFocus templates seeded"))
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
}