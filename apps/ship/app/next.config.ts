// apps/ship/next.config.ts
// Next type exports changed across versions; keep this file untyped to avoid
// build issues in mixed TS setups.
const nextConfig = {
  // `swcMinify` is default in Next 15 — remove it
  // `experimental.typedRoutes` moved — use `typedRoutes` at the top level
  typedRoutes: true,
};

export default nextConfig;