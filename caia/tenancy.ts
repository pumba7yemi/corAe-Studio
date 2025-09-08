export type TenantCtx = { vertical?: string; tenant?: string };
export function resolveContext(ctx?: TenantCtx): TenantCtx { return { ...ctx }; }