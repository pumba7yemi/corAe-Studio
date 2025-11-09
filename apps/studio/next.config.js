/** Next config: keep ESLint enabled during builds (no ignoreDuringBuilds)
 *  We set ignoreDuringBuilds to false so lint errors surface during CI/builds.
 */
/** @type {import('next').NextConfig} */
export default {
  eslint: {
    // Surface lint issues during build rather than ignoring them
    ignoreDuringBuilds: false,
  },
};
