// apps/studio/app/lib/ship/store.ts
"use client";

import { atom, useAtom } from "jotai";

/* -------------------------------------------------------------------------- */
/*  core types                                                                */
/* -------------------------------------------------------------------------- */
export type ShipKind = "white-label" | "core";
export type ShipEnv = "prod" | "staging" | "dev";
export type ShipStatus = "ready" | "outdated" | "failed";
export type Scope = "HOME" | "WORK" | "BUSINESS";

export type Ship = {
  id: string;
  name: string;
  kind: ShipKind;
  env: ShipEnv;
  version: string;
  lastBuildId?: string;
  lastBuildAt?: string; // ISO
  status: ShipStatus;
};

/* -------------------------------------------------------------------------- */
/*  in-memory list                                                            */
/* -------------------------------------------------------------------------- */
let SHIPS: Ship[] = [
  {
    id: "ship-core",
    name: "corAe Ship",
    kind: "core",
    env: "prod",
    version: "v1.0.0",
    lastBuildId: "bld-0001",
    lastBuildAt: new Date().toISOString(),
    status: "ready",
  },
  {
    id: "ship-wl-choiceplus",
    name: "Choice Plus",
    kind: "white-label",
    env: "prod",
    version: "v1.0.0-wl.1",
    lastBuildId: "bld-0002",
    lastBuildAt: new Date().toISOString(),
    status: "ready",
  },
  {
    id: "ship-wl-alamba",
    name: "Al Amba Retail",
    kind: "white-label",
    env: "staging",
    version: "v1.0.0-rc.2",
    lastBuildId: "bld-0003",
    lastBuildAt: new Date().toISOString(),
    status: "outdated",
  },
];

/* -------------------------------------------------------------------------- */
/*  exported actions                                                          */
/* -------------------------------------------------------------------------- */
export function listShips() {
  return SHIPS;
}

export function getShip(id: string) {
  return SHIPS.find((s) => s.id === id) || null;
}

export function upsertShip(ship: Ship) {
  const i = SHIPS.findIndex((s) => s.id === ship.id);
  if (i >= 0) SHIPS[i] = ship;
  else SHIPS.unshift(ship);
  return ship;
}

/* -------------------------------------------------------------------------- */
/*  reactive runtime store (hooks)                                            */
/* -------------------------------------------------------------------------- */
export const activeShipIdAtom = atom<string | null>(null);
export const activeScopeAtom = atom<Scope>("BUSINESS");
export const shipsAtom = atom<Ship[]>(SHIPS);

export function useShips() {
  return useAtom(shipsAtom);
}
export function useActiveShip() {
  return useAtom(activeShipIdAtom);
}
export function useActiveScope() {
  return useAtom(activeScopeAtom);
}

/* -------------------------------------------------------------------------- */
/*  toast + event bridge (optional utility)                                  */
/* -------------------------------------------------------------------------- */
export type ShipToast = { id: string; text: string; scope: Scope; ts: number };
export const toastsAtom = atom<ShipToast[]>([]);

export function pushToast(text: string, scope: Scope = "BUSINESS") {
  const id = "t_" + Math.random().toString(36).slice(2, 10);
  const evt = new CustomEvent("ship:toast", {
    detail: { id, text, scope, ts: Date.now() },
  });
  globalThis.dispatchEvent?.(evt);
}

if (typeof window !== "undefined") {
  const handler = (e: any) => {
    const { id, text, scope, ts } = e.detail as ShipToast;
    const upd = (window as any).__ship_set_toasts as
      | ((fn: (cur: ShipToast[]) => ShipToast[]) => void)
      | undefined;
    if (upd) upd((cur) => [{ id, text, scope, ts }, ...cur].slice(0, 50));
  };
  window.addEventListener("ship:toast", handler);
}

export function bindToastsSetter(setter: (fn: (cur: ShipToast[]) => ShipToast[]) => void) {
  (window as any).__ship_set_toasts = setter;
}