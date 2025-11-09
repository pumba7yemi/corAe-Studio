// src/lib/specLoader.ts
import fs from "node:fs/promises";
import stripJsonComments from "strip-json-comments";

export async function loadSpec(path: string) {
  const text = await fs.readFile(path, "utf8");
  return JSON.parse(stripJsonComments(text));
}