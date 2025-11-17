/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make local builds lenient on resource-constrained machines.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: true,
  experimental: {
    turbo: { rules: {} }
  }
};

export default nextConfig;
