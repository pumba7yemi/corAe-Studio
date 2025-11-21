/** Next config: keep ESLint enabled during builds (no ignoreDuringBuilds)
 *  We set ignoreDuringBuilds to false so lint errors surface during CI/builds.
 */
/** @type {import('next').NextConfig} */
export default {
  eslint: {
    // Surface lint issues during build rather than ignoring them
    ignoreDuringBuilds: false,
  },
  // When running inside a monorepo/workspace and using external Next executors
  // (eg. `pnpm dlx next dev`) Turbopack can infer the wrong root when
  // multiple lockfiles exist. Set `turbopack.root` to the workspace root so
  // Next resolves files and packages from the correct directory.
  turbopack: {
    // Use an absolute workspace root so Turbopack can resolve packages
    // correctly when running external Next executors (eg. `pnpm dlx next`).
    root: "C:\\corAe\\corAe-Studio",
  },
};
