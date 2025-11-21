import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "corAe-Studio-v2");
const atlas = JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "sil-atlas.json"), "utf8"));

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
