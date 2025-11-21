const DENY_PATTERNS = [
  /\bOBARI\b/i, /\bPricelock Chain\b/i, /\bFileLogic\b/i, /\bTrust Vault\b/i,
  /\bWorkFocus\b/i, /\bCIMS\b/i, /\bWorkflow Credit Score\b/i,
  // Secrets/IDs/URLs
  /sk-[A-Za-z0-9_-]{20,}/, /(postgres|mysql):\/\/[^ \n]+/, /bearer\s+[A-Za-z0-9._-]+/i
];

const REDACT_PATTERNS: Array<[RegExp,string]> = [
  [/\bChoice Plus\b/gi, "RetailClient"],               // brand swap
  [/\bAED\s?\d[\d,\.]*/gi, "AED [REDACTED]"],          // money figures
  [/\b(\+971|0)\d{8,}\b/g, "[PHONE REDACTED]"],        // phones
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL REDACTED]"]
];

export function filterOutboundPrompt(raw: string) {
  for (const rx of DENY_PATTERNS) {
    if (rx.test(raw)) throw new Error(`Prompt blocked by policy: ${rx}`);
  }
  let text = raw;
  for (const [rx, repl] of REDACT_PATTERNS) text = text.replace(rx, repl);
  // Canary marker to trace leaks
  text += `\n\n[CANARY: corAe-DA-${Date.now()}]`;
  return text;
}