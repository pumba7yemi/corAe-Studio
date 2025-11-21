#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const V2 = path.resolve(process.cwd());
const healthFile = path.join(V2, '.corae', 'caia-health.json');
const dailyFile = path.join(V2, '.corae', 'user-daily-check.json');
const cassFile = path.join(V2, '.corae', 'cassandra-meta.json');

function safeRead(file, fallback = null) {
  try { if (!fs.existsSync(file)) return fallback; return JSON.parse(fs.readFileSync(file,'utf8')); } catch(e){ return fallback; }
}

const health = safeRead(healthFile, null);
const daily = safeRead(dailyFile, []);
const cass = safeRead(cassFile, { entries: [] });

function assessAlignment() {
  if (!health) return { aligned: false, issue: 'no-health', recommendation: 'Run caia health to generate snapshot.' };
  // simple rules: if mood is DEGRADED or score150 < 100 -> misaligned
  if (health.mood === 'DEGRADED' || (typeof health.score150 === 'number' && health.score150 < 100)) {
    return { aligned: false, issue: 'health-degraded', recommendation: 'Investigate failing checks and Cassandra patterns; consider pausing risky actions.' };
  }

  // if recent daily check is unwell or stressed and mood is CLEAR -> misalignment
  const lastDaily = Array.isArray(daily) && daily.length ? daily[daily.length-1] : null;
  if (lastDaily && lastDaily.payload && (lastDaily.payload.feeling === 'unwell' || lastDaily.payload.feeling === 'stressed')) {
    if (health.mood === 'CLEAR') {
      return { aligned: false, issue: 'user-stress-mismatch', recommendation: 'CAIA suggests a human check-in; consider reducing automation.' };
    }
  }

  // Cassandra: if many new patterns (>10) consider misaligned
  const newPatterns = Array.isArray(cass.entries) ? cass.entries.length : 0;
  if (newPatterns > 10) return { aligned: false, issue: 'cassandra-churn', recommendation: 'Review newly detected patterns.' };

  return { aligned: true };
}

const result = assessAlignment();
if (!result.aligned) {
  console.log('MISALIGNED', JSON.stringify(result, null, 2));
  process.exit(1);
} else {
  console.log('ALIGNED');
  process.exit(0);
}
