export type TenantCtx = {
  vertical?: string;
  tenant?: string;
  brand?: string;   // ← add this
};
export function resolveContext(ctx?: TenantCtx): TenantCtx { return { ...ctx }; }