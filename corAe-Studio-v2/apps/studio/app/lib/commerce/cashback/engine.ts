export type CashbackQuote = {
  merchant: string;
  cashbackPct: number;
  terms?: string;
};

export function getCashbackFor(merchant: string): CashbackQuote {
  const table: Record<string, number> = {
    amazon: 2.0,
    noon: 3.5,
    apple: 1.0,
    samsung: 1.2,
    lego: 4.0,
    dyson: 2.2,
    generic: 1.0,
  };
  const key = (merchant || "").toLowerCase();
  const pct = table[key] ?? table["generic"];
  return {
    merchant,
    cashbackPct: pct,
    terms: "Tracked via corAe affiliate cookie. Payout after confirmation.",
  };
}
