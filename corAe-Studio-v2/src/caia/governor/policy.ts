export type DecisionMode = "EXECUTE" | "ADVISE";

export interface OwnerPolicy {
  id: string;
  name: string;
  decisionMode: DecisionMode;
  allowOptions: boolean;
  maxClarifications: number;
}
