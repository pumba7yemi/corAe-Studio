// Fallback local type for NextConfig to avoid requiring the 'next' package during type-checking.
// If you install 'next' and its types, you can revert to: import type { NextConfig } from "next";
type NextConfig = {
  reactStrictMode?: boolean;
  swcMinify?: boolean;
  experimental?: Record<string, unknown>;
  eslint?: Record<string, unknown>;
  typescript?: Record<string, unknown>;
  webpack?: (config: any) => any;
};

/**
 * corAe — single source Next config (typed).
 * If you previously had `next.config.mjs`, delete/rename it so this file is used.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Keep the app router predictable and TS-friendly
  experimental: {
    typedRoutes: true,
  },

  // Allow CI builds to pass ESLint separately
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript should block bad builds (we rely on 150.logic)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack passthrough; aliases already handled by tsconfig paths
  webpack(config) {
    // no custom rules required for current stack
    return config;
  },
};

export default nextConfig;