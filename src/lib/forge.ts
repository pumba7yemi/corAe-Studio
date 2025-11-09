export const FORGE = {
  env: {
    jobsDir: process.env.FORGE_JOBS_DIR!,
    reportsDir: process.env.FORGE_REPORTS_DIR!,
    tagsDir: process.env.FORGE_TAGS_DIR!,
    homeTiles: process.env.FORGE_HOME_TILES!,
  },
} as const;
