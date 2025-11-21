import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertShipWithinLimits, ShipGovernanceConfig } from '../../packages/core-governance/src/ship-governance';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const V2_ROOT = path.resolve(__dirname, '..', '..');

export interface ShipUsageSnapshot {
  activeFlows: number;
  activeDashboards: number;
}

export function loadShipGovernanceConfig(shipId: string): ShipGovernanceConfig | null {
  const primary = path.join(V2_ROOT, 'GOVERNANCE', 'ships', shipId, 'ship.config.json');
  const fallback = path.join(V2_ROOT, '.corae', 'ships', shipId, 'ship.config.json');
  try {
    if (fs.existsSync(primary)) {
      const raw = fs.readFileSync(primary, 'utf8');
      return JSON.parse(raw) as ShipGovernanceConfig;
    }
    if (fs.existsSync(fallback)) {
      const raw = fs.readFileSync(fallback, 'utf8');
      return JSON.parse(raw) as ShipGovernanceConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function enforceShipGrowthGuard(opts: { shipId: string; usage: ShipUsageSnapshot; }) {
  const config = loadShipGovernanceConfig(opts.shipId);
  if (!config) {
    assertShipWithinLimits({
      profile: 'STRICT',
      activeFlows: opts.usage.activeFlows,
      activeDashboards: opts.usage.activeDashboards,
      overrides: { maxActiveFlows: 5, maxActiveDashboards: 3 },
    });
    return;
  }

  assertShipWithinLimits({
    profile: config.profile,
    activeFlows: opts.usage.activeFlows,
    activeDashboards: opts.usage.activeDashboards,
    overrides: config.overrides,
  });
}
