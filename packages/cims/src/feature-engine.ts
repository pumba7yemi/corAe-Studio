import type { EmailLike, FeatureVector } from "./types";

export function extractFeatures(email: EmailLike): FeatureVector {
  const vec: number[] = [];
  const text = (email.subject + "\n" + email.bodyText).toLowerCase();

  // Structure (10)
  vec.push(clamp01(email.to.length / 10));
  vec.push(clamp01((email.cc?.length ?? 0) / 10));
  vec.push(clamp01((email.bcc?.length ?? 0) / 10));
  vec.push(clamp01((email.attachments?.length ?? 0) / 10));
  vec.push(clamp01(email.headers ? Object.keys(email.headers).length / 50 : 0));
  vec.push(clamp01(email.subject.length / 120));
  vec.push(clamp01(email.bodyText.length / 2000));
  vec.push(/\?$/.test(email.subject) ? 1 : 0);
  vec.push(/urgent|asap|immediately/.test(text) ? 1 : 0);
  vec.push(/invoice|payment|quote|price|cost/.test(text) ? 1 : 0);

  // Keyword buckets (40)
  const buckets = new Array(40).fill(0);
  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  for (const w of words) {
    const h = hash32(w) % 40;
    buckets[h] = Math.min(1, buckets[h] + 1 / 10);
  }
  vec.push(...buckets);

  // Domain/sender (10)
  const domain = (email.fromEmail.split("@")[1] || "").toLowerCase();
  vec.push(hash01(domain));
  vec.push(/gmail\.com$/.test(domain) ? 1 : 0);
  vec.push(/outlook\.com$|hotmail\.com$/.test(domain) ? 1 : 0);
  vec.push(/edu|ac\./.test(domain) ? 1 : 0);
  vec.push(/gov|\.ae$/.test(domain) ? 1 : 0);
  vec.push(/support|noreply|no-reply/.test(email.fromEmail) ? 1 : 0);
  vec.push(/[\u0600-\u06FF]/.test(text) ? 1 : 0);
  vec.push(/[\u0400-\u04FF]/.test(text) ? 1 : 0);
  vec.push(/[\u4E00-\u9FFF]/.test(text) ? 1 : 0);
  vec.push(/[\u00C0-\u017F]/.test(text) ? 1 : 0);

  // Intent cues (15)
  vec.push(/meeting|schedule|call|zoom|teams/.test(text) ? 1 : 0);
  vec.push(/job|cv|resume|candidate|hire/.test(text) ? 1 : 0);
  vec.push(/complaint|issue|problem|escalate/.test(text) ? 1 : 0);
  vec.push(/thanks|thank you|much appreciated/.test(text) ? 1 : 0);
  vec.push(/deadline|due|cutoff/.test(text) ? 1 : 0);
  vec.push(/contract|agreement|terms/.test(text) ? 1 : 0);
  vec.push(/refund|return|grv|goods return voucher/.test(text) ? 1 : 0);
  vec.push(/stock|inventory|purchase order|po|vendor/.test(text) ? 1 : 0);
  vec.push(/price lock|pricelock|quote/.test(text) ? 1 : 0);
  vec.push(/hr|leave|rota|payroll|insurance/.test(text) ? 1 : 0);
  vec.push(/legal|notice|complaince|compliance/.test(text) ? 1 : 0);
  vec.push(/marketing|campaign|content|post|ad/.test(text) ? 1 : 0);
  vec.push(/billing|invoice|vat|tax/.test(text) ? 1 : 0);
  vec.push(/shipping|logistics|delivery|pickup/.test(text) ? 1 : 0);
  vec.push(/salon|gym|property|waste|broker/.test(text) ? 1 : 0);

  // Sentiment proxy (5)
  vec.push(/great|happy|pleased|glad|delighted/.test(text) ? 1 : 0);
  vec.push(/angry|upset|frustrated|disappointed/.test(text) ? 1 : 0);
  vec.push(/urgent|immediately|asap/.test(text) ? 1 : 0);
  vec.push(/sorry|apolog/.test(text) ? 1 : 0);
  vec.push(/please/.test(text) ? 1 : 0);

  while (vec.length < 90) vec.push(0);
  return vec.slice(0, 90);
}

export function similarity(a: FeatureVector, b: FeatureVector): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function signatureOf(vec: FeatureVector): string {
  const q = vec.map(v => Math.round(v * 10));
  return hashHex(q.join(","));
}

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function hash32(s: string): number { let h = 2166136261 >>> 0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h = Math.imul(h, 16777619);} return h >>> 0; }
function hash01(s: string): number { return (hash32(s) % 1000) / 1000; }
function hashHex(s: string): string { return (hash32(s).toString(16) + hash32("x"+s).toString(16)).slice(0,16); }