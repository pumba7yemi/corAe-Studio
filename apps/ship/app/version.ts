// apps/ship/app/version.ts
// Ship semantic version + helpers for update/health APIs.

export const SHIP_VERSION = "1.0.0" as const;

export type Semver = `${number}.${number}.${number}`;

export function parse(v: Semver) {
  const [maj, min, pat] = v.split(".").map((n) => Number(n));
  return { maj, min, pat };
}

export function cmp(a: Semver, b: Semver): -1 | 0 | 1 {
  const A = parse(a), B = parse(b);
  if (A.maj !== B.maj) return A.maj < B.maj ? -1 : 1;
  if (A.min !== B.min) return A.min < B.min ? -1 : 1;
  if (A.pat !== B.pat) return A.pat < B.pat ? -1 : 1;
  return 0;
}

export function isNewerThan(a: Semver, b: Semver) {
  return cmp(a, b) === 1;
}

export function withBuildMeta(v: Semver, meta?: string) {
  return meta ? `${v}+${meta}` : v;
}
