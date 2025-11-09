import { PrismaClient } from "../../apps/studio/generated/db";

type Diff = { steps: any[]; riskCount: Record<string, number> };

function assessRisk(kind:string): "NONE"|"LOW"|"MEDIUM"|"HIGH"|"DESTRUCTIVE" {
  switch (kind) {
    case "ADD_MODEL":
    case "ADD_FIELD":
    case "ADD_ENUM_VALUE":
    case "ADD_INDEX":
    case "ADD_UNIQUE": return "LOW";
    case "SET_NOT_NULL":
    case "ALTER_FIELD_TYPE":
    case "DROP_FIELD":
    case "DROP_MODEL": return "HIGH";
    default: return "MEDIUM";
  }
}

// naive diff (can be extended with rename heuristics, @map hints, etc.)
async function diff(prisma: PrismaClient, fromId: string, toId: string): Promise<Diff> {
  const from = await prisma.sM_Model.findMany({ where: { snapshotId: fromId }, include: { fields: true, indexes: true, uniques: true }});
  const to   = await prisma.sM_Model.findMany({ where: { snapshotId: toId },   include: { fields: true, indexes: true, uniques: true }});
  const steps:any[] = []; const riskCount:Record<string,number> = {};

  const byName = (a:any)=>Object.fromEntries(a.map((m:any)=>[m.name,m]));
  const F = byName(from), T = byName(to);
  // Add/drop models
  for (const name of Object.keys(T)) if (!F[name]) steps.push({ kind:"ADD_MODEL", target:name });
  for (const name of Object.keys(F)) if (!T[name]) steps.push({ kind:"DROP_MODEL", target:name });

  // Fields
  for (const name of Object.keys(T)) {
    if (!F[name]) continue;
    const fBy = Object.fromEntries(F[name].fields.map((x:any)=>[x.name,x]));
    const tBy = Object.fromEntries(T[name].fields.map((x:any)=>[x.name,x]));
    for (const fn of Object.keys(tBy)) if (!fBy[fn]) steps.push({ kind:"ADD_FIELD", target:`${name}.${fn}`, payload:{ type:tBy[fn].type, optional:tBy[fn].isOptional }});
    for (const fn of Object.keys(fBy)) if (!tBy[fn]) steps.push({ kind:"DROP_FIELD", target:`${name}.${fn}`});
    for (const fn of Object.keys(tBy)) {
      const a=fBy[fn], b=tBy[fn]; if (!a||!b) continue;
      if (a.type!==b.type || a.isOptional!==b.isOptional) {
        steps.push({ kind:"ALTER_FIELD_TYPE", target:`${name}.${fn}`, payload:{ from:{type:a.type,opt:a.isOptional}, to:{type:b.type,opt:b.isOptional}}});
      }
    }
  }

  // risk accounting
  for (const s of steps) { const r = assessRisk(s.kind); s.risk = r; riskCount[r]=(riskCount[r]||0)+1; }
  return { steps, riskCount };
}

async function main() {
  const prisma = new PrismaClient();
  const snaps = await prisma.sM_Snapshot.findMany({ orderBy: { createdAt: "asc" }});
  if (snaps.length < 2) { console.log("Need at least 2 snapshots"); return; }
  const from = snaps[snaps.length-2], to = snaps[snaps.length-1];
  const d = await diff(prisma, from.id, to.id);

  const plan = await prisma.sM_Plan.create({
    data: {
      fromSnapshot: from.id, toSnapshot: to.id,
      riskSummary: d.riskCount, steps: { create: d.steps.map((s,i)=>({ ...s, order:i })) },
    }
  });
  console.log("Plan created:", plan.id, d.riskCount);
  await prisma.$disconnect();
}
main().catch(e=>{ console.error(e); process.exit(1); });