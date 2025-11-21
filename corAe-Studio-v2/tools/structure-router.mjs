import fs from "node:fs";
import path from "node:path";

// Prefer resolving the v2 root from the current working directory so tooling
// that runs from the workspace root or from the v2 root resolves the same path.
const V2_ROOT = path.resolve(process.cwd());
const ATLAS_PATH = path.join(V2_ROOT, 'tools', 'sil-atlas.json');

function loadAtlas() {
  try {
    if (!fs.existsSync(ATLAS_PATH)) return { domains: {} };
    const raw = fs.readFileSync(ATLAS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { domains: {} };
    return parsed;
  } catch (e) {
    return { domains: {} };
  }
}

const atlas = loadAtlas();

function norm(s) {
  return String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function routeIntent(raw) {
  const input = norm(raw);
  let best = null;
  let bestScore = 0;

  for (const [domain, meta] of Object.entries(atlas.domains || {})) {
    for (const syn of meta.synonyms || []) {
      const s = norm(syn);
      // match only whole words to avoid false positives inside longer identifiers
      const re = new RegExp("\\b" + escapeRegex(s) + "\\b", "i");
      if (re.test(input)) {
        const score = (meta.priority || 0) + s.length;
        if (score > bestScore) {
          bestScore = score;
          best = { domain, meta, synonym: s };
        }
      }
    }
  }

  if (best) {
    return {
      found: true,
      targetDomain: best.domain,
      certainty: bestScore,
      healing: best.meta?.heal || [],
      reason: `Matched synonym '${best.synonym}' with priority ${best.meta?.priority || 0}`
    };
  }

  return {
    found: false,
    targetDomain: null,
    certainty: 0,
    healing: [],
    reason: "No domain match in SIL atlas"
  };
}
