import stringify from "fast-json-stable-stringify";
import { createHash } from "crypto";

export function stableHash(obj: unknown): string {
  const s = stringify(obj);
  return createHash("sha256").update(s).digest("hex");
}