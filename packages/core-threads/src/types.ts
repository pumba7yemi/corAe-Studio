// packages/core-threads/src/types.ts
import { Pipeline, HomeFlowKind } from "../../shared/utils/threadToken";

export interface EmailEvent {
  domain?: string;
  threadId?: string;
  stage?: string;
  direction: "inbound" | "outbound";
  messageId?: string;
  date: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; contentBase64: string; mime?: string }[];
  meta?: Record<string, unknown>;
  obariHint?: boolean;
  serviceType?: string;
  clientId?: string | null;            // explicit link if known
}

export interface ThreadCore {
  threadId: string;
  pipeline: "OBARI" | "HomeFlow" | "WorkFlow";                   // OBARI | HomeFlow | WorkFlow
  domain: string;
  stage?: string;                        // OBARI
  homeFlowKind?: HomeFlowKind | string;          // HomeFlow
  workFlowKind?: string;                // WorkFlow
  status: "Open" | "In Progress" | "Awaiting Response" | "Completed";
  subject: string;
  participants: string[];
  lastUpdateISO: string;
  relatedTasks: string[];
  messages: Array<Pick<EmailEvent, "direction"|"messageId"|"date"|"from"|"to"|"cc"|"subject">>;
  attachments: Array<{ filename: string; path: string; mime?: string }>;
}
