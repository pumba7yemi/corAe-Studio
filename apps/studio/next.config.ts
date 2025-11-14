/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true, // moved from experimental.typedRoutes
  transpilePackages: [
    "@corae/caia-core",
    "@corae/ui",
    "@corae/workflows-core",
    "@corae/home"
  ],
  experimental: {
    // Add other experimental features here if needed
  },
};

export default nextConfig;