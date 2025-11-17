import fs from "node:fs/promises";
import path from "node:path";
import type { MemoryBackend, MemoryValue } from "../types.js";

export class FSJsonBackend implements MemoryBackend {
  constructor(private rootDir: string) {}
  private file(scope: string) {
    return path.join(this.rootDir, `${scope}.json`);
  }
  private async read(scope: string) {
    try {
      const p = this.file(scope);
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw) as Record<string, MemoryValue>;
    } catch {
      return {};
    }
  }
  private async write(scope: string, data: Record<string, MemoryValue>) {
    const p = this.file(scope);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf8");
  }
  async get(scope: string, key: string) {
    const data = await this.read(scope);
    return data[key];
  }
  async set(scope: string, key: string, value: MemoryValue) {
    const data = await this.read(scope);
    data[key] = value;
    await this.write(scope, data);
  }
  async list(scope: string) {
    return this.read(scope);
  }
  async del(scope: string, key: string) {
    const data = await this.read(scope);
    delete data[key];
    await this.write(scope, data);
  }
}