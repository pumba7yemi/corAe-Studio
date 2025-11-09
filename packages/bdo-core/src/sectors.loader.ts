import { join } from "path";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import type { BDOBlueprint } from "./sector.types";

export function loadSectorTemplates(baseDir: string) {
  // baseDir should point to packages/bdo-core/templates
  const sectors: Record<string, { files: BDOBlueprint[] }> = {};
  const sectorDirs = existsSync(baseDir) ? readdirSync(baseDir) : [];
  for (const dir of sectorDirs) {
    const dirPath = join(baseDir, dir);
    if (!statSync(dirPath).isDirectory()) continue;
    const files = readdirSync(dirPath).filter(f => f.endsWith(".json"));
    for (const f of files) {
      const raw = readFileSync(join(dirPath, f), "utf8");
      const bp = JSON.parse(raw) as BDOBlueprint;
      if (!sectors[dir]) sectors[dir] = { files: [] };
      sectors[dir].files.push(bp);
    }
  }
  return sectors;
}


