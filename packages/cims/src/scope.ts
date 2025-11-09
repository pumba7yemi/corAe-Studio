export type CorrespondScope = "WORK" | "HOME" | "BUSINESS";

export type TenantContext = {
  scope: CorrespondScope;
  orgId?: string | null;
  householdId?: string | null;
  actorUserId?: string | null;
};

export function resolveTenant(input: {
  headerScope?: string | null;
  queryScope?: string | null;
  bodyScope?: string | null;
  orgId?: string | null;
  householdId?: string | null;
  actorUserId?: string | null;
}): TenantContext {
  const raw = input.headerScope ?? input.queryScope ?? input.bodyScope ?? "WORK";
  const scope = (raw.toUpperCase() as CorrespondScope) ?? "WORK";
  return {
    scope,
    orgId: input.orgId ?? null,
    householdId: input.householdId ?? null,
    actorUserId: input.actorUserId ?? null,
  };
}