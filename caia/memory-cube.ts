import type { TenantCtx } from "./tenancy";
export function logToLayer(layer: string, _ctx: TenantCtx, entry: unknown){ return { ok:true, layer, entry }; }
export function readOverlay(_ctx?: TenantCtx, _limit?: number){ return [] as unknown[]; }
export function wipeLayer(_layer: string, _ctx: TenantCtx, _force?: boolean){ return true; }