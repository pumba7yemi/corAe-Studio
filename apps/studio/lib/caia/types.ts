export type Channel = "cims" | "email";
export type Persona = "daily_brief" | "nudge" | "owner_update";

export type CaiaMessage = {
  to: string | string[];     // "ops@company" or ["owner@..."]
  subject?: string;
  text: string;
  html?: string;
  channel: Channel;
  persona: Persona;
};
