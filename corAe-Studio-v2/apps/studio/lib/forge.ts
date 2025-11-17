// Forge configuration surface
export const FORGE = {
  workspaceDir: ".corae/forge",
  templatesDir: ".corae/forge/templates",
  env: {
    jobsDir: ".corae/forge/jobs",
    reportsDir: ".corae/forge/reports",
    tagsDir: ".corae/forge/tags",
    homeTiles: ".corae/forge/home.tiles.json"
  }
} as const;

export function ensureLeadingDot(p: string) {
  return p.startsWith(".") ? p : `.${p}`;
}
