// @ts-ignore: module types are not available at compile time; ignore missing module/type errors
import { readShipMemory } from "@corae/caia-core/dist/memory";

const SCOPE = "social-contract-audit";
const KEY = "entries";

export type AuditEntry = {
  id?: string;
  domain: string; // 'home' | 'work' | 'business'
  checkedPledges: string[];
  note?: string;
  createdAt?: string;
};

/**
 * Checks whether the current ship/user has completed audits across the
 * three domains (home, work, business). This is intentionally permissive:
 * presence of at least one audit per domain counts as aligned.
 */
export async function hasSignedSocialContract(): Promise<boolean> {
  try {
    const store = await readShipMemory(SCOPE);
    const raw = (store as any)?.get ? (store as any).get(KEY) : (store as any)?.[KEY];
    const entries: AuditEntry[] = raw ? JSON.parse(raw) : [];

    const domains = new Set(entries.map((e) => (e.domain || "").toLowerCase()));
    const required = ["home", "work", "business"];
    // simple pass: each required domain must be present with >=1 checked pledge
    for (const d of required) {
      const match = entries.find((e) => (e.domain || "").toLowerCase() === d);
      if (!match || !Array.isArray(match.checkedPledges) || match.checkedPledges.length === 0) return false;
    }
    return true;
  } catch (e) {
    // conservative fallback: if we can't read memory, don't allow ascend
    console.warn("hasSignedSocialContract check failed:", e);
    return false;
  }
}
