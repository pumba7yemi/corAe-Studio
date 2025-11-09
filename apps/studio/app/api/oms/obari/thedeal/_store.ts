// Lightweight proto store. Replace with Prisma in production.
type DealFlags = {
  id: string;
  pricelockConfirmed: boolean;
  slaBound: boolean;
};

const _db = new Map<string, DealFlags>();

export function getDeal(id: string): DealFlags {
  const cur = _db.get(id);
  if (cur) return cur;
  const seeded: DealFlags = {
    id,
    // If the page already confirmed Pricelock earlier, your real DB will reflect it.
    // For the prototype we start false and let the UI/API flip these.
    pricelockConfirmed: false,
    slaBound: false,
  };
  _db.set(id, seeded);
  return seeded;
}

export function setDealFlags(id: string, flags: Partial<DealFlags>): DealFlags {
  const cur = getDeal(id);
  const next = { ...cur, ...flags, id };
  _db.set(id, next);
  return next;
}