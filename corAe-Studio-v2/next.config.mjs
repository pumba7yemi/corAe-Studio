import process from 'process';

// Try to load next-pwa if available; fall back to identity wrapper so builds don't break
let withPWA;
try {
  // top-level await isn't necessary here; dynamic import returns a promise but try/catch handles sync error if module not present
  const mod = await import('next-pwa');
  withPWA = mod.default ?? mod;
} catch (e) {
  // If next-pwa isn't installed, we return the config unchanged
  withPWA = (cfg) => cfg;
}

const isProd = process.env.NODE_ENV === 'production';

const baseConfig = {
  experimental: {
    appDir: true,
  },
  // Keep other existing v2 config options in `next.config.ts` in sync.
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack(config) {
    return config;
  },
};

export default withPWA({
  dest: 'public',
  disable: !isProd,
  register: true,
  skipWaiting: true,
})(baseConfig);
