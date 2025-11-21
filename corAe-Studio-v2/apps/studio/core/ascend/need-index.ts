// Ascend Need Index — predicts user's monthly shortfall (+/- AED)
export type NeedSnapshot = {
  currency: "AED";
  monthlyDelta: number; // negative = shortfall, positive = surplus
  confidence: number; // 0..1
  factors: { key: string; weight: number; note?: string }[];
};

export function estimateNeedIndex(input: {
  incomeAED?: number; // monthly take-home
  fixedCostsAED?: number; // rent, utilities, loans
  variableCostsAED?: number; // food, fuel, misc
  savingsGoalAED?: number; // optional target allocation
}): NeedSnapshot {
  const income = input.incomeAED ?? 0;
  const fixed = input.fixedCostsAED ?? 0;
  const variable = input.variableCostsAED ?? 0;
  const savings = input.savingsGoalAED ?? 0;
  const monthlyDelta = Math.round((income - fixed - variable - savings) * 100) / 100;
  const factors = [
    { key: "income", weight: income ? 0.35 : 0 },
    { key: "fixed", weight: fixed ? 0.30 : 0 },
    { key: "variable", weight: variable ? 0.25 : 0 },
    { key: "savings", weight: savings ? 0.10 : 0 },
  ];
  const confidence = Math.min(1, factors.reduce((a, b) => a + b.weight, 0));
  return { currency: "AED", monthlyDelta, confidence, factors };
}

export function needBadge(delta: number) {
  if (delta < 0) return { tone: "down", label: `-${Math.abs(delta)} AED / mo` };
  if (delta > 0) return { tone: "up", label: `+${delta} AED / mo` };
  return { tone: "even", label: "Break-even" };
}
