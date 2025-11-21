// lib/build/artifacts.ts
import fs from "node:fs/promises";
import path from "node:path";

export type Artifact = {
  name: string;      // file name (e.g., ship-corae-2025-09-10T09-42.zip)
  path: string;      // absolute path
  size: number;      // bytes
  mtime: number;     // epoch ms
};

export async function listArtifacts(): Promise<Artifact[]> {
  const distDir = path.join(process.cwd(), "dist");
  try {
    const entries = await fs.readdir(distDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.endsWith(".zip"));
    const stats = await Promise.all(
      files.map(async (f) => {
        const p = path.join(distDir, f.name);
        const s = await fs.stat(p);
        return <Artifact>{
          name: f.name,
          path: p,
          size: s.size,
          mtime: s.mtimeMs
        };
      })
    );
    // newest first
    return stats.sort((a, b) => b.mtime - a.mtime);
  } catch {
    return [];
  }
}
