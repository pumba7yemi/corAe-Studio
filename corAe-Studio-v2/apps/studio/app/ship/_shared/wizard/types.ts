export type Scope = "home" | "work" | "business";

export interface WizardSnapshot {
  scope: Scope;
  haveYou: Array<{ id: string; title: string; when?: string }>;
  pulse: { wins: string[]; risks: string[]; next: string[] };
  plan: Array<{ id: string; title: string; when: string }>;
}

export interface AutomateResponse {
  ok: boolean;
  id?: string;
}
