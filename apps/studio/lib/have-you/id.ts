// Stable id helper if you want to mint new items at runtime (ULID-like)
export function mint(prefix = "hy"): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}