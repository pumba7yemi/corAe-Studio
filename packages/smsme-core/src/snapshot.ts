import { Snapshot } from "./types.js";
import { stableHash } from "./hash.js";

export function makeSnapshot(input: Omit<Snapshot, "schemaHash" | "createdAt">): Snapshot {
  const logical = { ...input, schemaHash: "__pending__", createdAt: "__pending__" };
  const hash = stableHash({ models: input.models, enums: input.enums ?? [] });
  return {
    ...logical,
    schemaHash: hash,
    createdAt: new Date().toISOString()
  };
}