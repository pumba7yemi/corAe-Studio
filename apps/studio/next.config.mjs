/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@corae/caia-core",
    "@corae/ui",
    "@corae/workflows-core",
  ],
  // Remove experimental.esmExternals unless you really need it:
  // experimental: { esmExternals: "loose" }
};

export default nextConfig;