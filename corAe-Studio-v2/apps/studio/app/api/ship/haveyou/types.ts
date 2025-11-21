export type Scope = "HOME" | "WORK" | "BUSINESS";

export interface HaveYou {
  id?: string;
  text: string;
  schedule: string; // e.g. "DAILY 07:00" or "THU 09:00"
  scope?: Scope;
  enabled?: boolean;
}

export interface EvaluateResult {
  triggered: HaveYou[];
  nextCheck: string; // ISO timestamp of next check window
}