export type Platform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "threads" | "x" | "debug";

export type Media =
  | { kind: "image"; url: string }
  | { kind: "video"; url: string }
  | { kind: "none" };

export interface PostSpec {
  id?: string;
  platform: Platform;
  account?: string;       // handle or internal id
  text: string;           // caption / body
  media?: Media;
  scheduledAt?: string;   // ISO when scheduling
  tags?: string[];
  campaign?: string;
  source?: string;        // e.g., "marketing.loop.v1"
}

export interface ProviderResult {
  ok: boolean;
  externalId?: string;
  url?: string;
  error?: string;
}

export interface Provider {
  name: Platform;
  postNow: (spec: PostSpec) => Promise<ProviderResult>;
  schedule?: (spec: PostSpec) => Promise<ProviderResult>;
  handleWebhook?: (payload: any) => Promise<void>;
}