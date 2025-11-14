import fs from 'fs/promises';
import path from 'path';

export type ModuleEntry = { id: string; label: string; path: string };
export interface CaiaModules {
  version: string;
  homeCore: ModuleEntry[];
  workCore: ModuleEntry[];
  businessCore: ModuleEntry[];
  businessFront: ModuleEntry[];
}

const MODULES_PATH = path.join(process.cwd(), '.corae', 'caia.modules.json');

export async function loadModules(): Promise<CaiaModules> {
  const txt = await fs.readFile(MODULES_PATH, 'utf-8');
  return JSON.parse(txt) as CaiaModules;
}

export async function HOME_CORE(): Promise<ModuleEntry[]> {
  return (await loadModules()).homeCore;
}

export async function WORK_CORE(): Promise<ModuleEntry[]> {
  return (await loadModules()).workCore;
}

export async function BUSINESS_CORE(): Promise<ModuleEntry[]> {
  return (await loadModules()).businessCore;
}

export async function BUSINESS_FRONT(): Promise<ModuleEntry[]> {
  return (await loadModules()).businessFront;
}
