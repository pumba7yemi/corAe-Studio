import fs from "fs";
import path from "path";

export interface DecisionMetrics {
  total: number;
  failures: number;
  success: number;
  successRate: number;
  score150: number;
}

function decisionMemoryPath(): string {
  // Assume running from v2 workspace root; fallback to __dirname traversal
  const candidate = path.resolve(process.cwd(), ".corae/decision-memory.json");
  if (fs.existsSync(candidate)) return candidate;
  // try relative to this file (packages/caia-core/src)
  const alt = path.resolve(__dirname, "../../../../.corae/decision-memory.json");
  return alt;
}

export function getDecisionMetrics(subject: string): DecisionMetrics | null {
  try {
    const p = decisionMemoryPath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    const obj = JSON.parse(raw);
    const entries = (obj.entries || []).filter((e: any) => e.subject === subject);
    const total = entries.length;
    const failures = entries.filter((e: any) => e.result && e.result !== "ok" && e.result !== "pass" && e.result !== "success").length;
    const success = total - failures;
    const successRate = total === 0 ? 0 : success / total;
    const score150 = Math.round(successRate * 150);
    return { total, failures, success, successRate, score150 };
  } catch (e) {
    return null;
  }
}

export function getScore150(subject: string): number | null {
  const m = getDecisionMetrics(subject);
  return m ? m.score150 : null;
}

export function isCassandraModeEnabled(subject: string, minScore = 140): boolean {
  const s = getScore150(subject);
  if (s === null) return false; // unknown -> conservative: disabled by default here
  return s < minScore;
}

export function formatCassandraNote(reason?: string) {
  return `[CASSANDRA COMPANION MODE] ${reason || "additional conservative checks required"}`;
}

export default {
  getDecisionMetrics,
  getScore150,
  isCassandraModeEnabled,
  formatCassandraNote,
};
