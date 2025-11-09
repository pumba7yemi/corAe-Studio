import { readFileSync } from "fs";
import { createHash } from "crypto";
import { getDMMF } from "@prisma/internals";
import { PrismaClient } from "../../apps/studio/prisma/data/db";

async function main() {
  const prisma = new PrismaClient();
  const schemaPath = "apps/studio/prisma/schema.prisma";
  const ddl = readFileSync(schemaPath, "utf8");
  const hash = createHash("sha256").update(ddl).digest("hex");
  const dmmf = await getDMMF({ datamodel: ddl });

  // Upsert snapshot
  const snap = await prisma.sM_Snapshot.upsert({
    where: { schemaHash: hash },
    update: {},
    create: { schemaHash: hash, prismaVer: process.env.npm_package_dependencies_prisma },
  });

  // Models
  for (const m of dmmf.datamodel.models) {
    const model = await prisma.sM_Model.create({
      data: {
        snapshotId: snap.id,
        name: m.name,
        dbName: m.dbName ?? null,
        fields: {
          create: m.fields.map((f) => ({
            name: f.name,
            dbName: (f as any).dbName ?? null,
            type: typeof f.type === "string" ? String(f.type) : "object",
            isList: !!f.isList,
            isOptional: !!f.isNullable || !!f.isOptional,
            defaultJson: f.default ? JSON.parse(JSON.stringify(f.default)) : undefined,
            attributes: JSON.parse(JSON.stringify({
              isId: !!f.isId,
              isUpdatedAt: !!f.isUpdatedAt,
              isUnique: !!f.isUnique,
              native: (f as any).native ?? null,
            })),
            relation: f.relationName
              ? JSON.parse(JSON.stringify({
                  relationName: f.relationName,
                  relationFromFields: (f as any).relationFromFields ?? [],
                  relationToFields: (f as any).relationToFields ?? [],
                  relationOnDelete: (f as any).relationOnDelete ?? null,
                }))
              : undefined,
          })),
        },
        indexes: {
          create: (m.indexes ?? []).map(idx => ({
            name: idx.name ?? null,
            fields: idx.fields.map(f=>f),
            isUnique: !!idx.isUnique,
            raw: idx.name ? undefined : undefined
          })),
        },
        uniques: {
          create: (m.uniqueFields ?? []).map(ufs => ({ fields: ufs })),
        },
      },
    });
  }

  // Enums
  for (const e of dmmf.datamodel.enums) {
    await prisma.sM_Enum.create({
      data: { snapshotId: snap.id, name: e.name, values: e.values.map(v=>v.name) },
    });
  }

  console.log("Snapshot stored:", snap.schemaHash);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });