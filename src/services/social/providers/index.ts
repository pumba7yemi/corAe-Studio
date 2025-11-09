import { debugProvider } from "./debug";
import type { Platform, Provider } from "../types";

const providers: Record<Platform, Provider> = {
  debug: debugProvider,
  instagram: debugProvider,
  tiktok: debugProvider,
  youtube: debugProvider,
  facebook: debugProvider,
  linkedin: debugProvider,
  threads: debugProvider,
  x: debugProvider,
};

export function getProvider(p: Platform): Provider {
  const prov = providers[p];
  if (!prov) throw new Error(`No provider for ${p}`);
  return prov;
}