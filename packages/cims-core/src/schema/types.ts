import { z } from "zod";

// Define allowed message channels
export const Channel = z.enum(["inapp", "email", "whatsapp"]);
export type Channel = z.infer<typeof Channel>;

// Message schema
export const Message = z.object({
  id: z.string(),
  threadId: z.string(),
  tenantId: z.string(),
  senderId: z.string(),
  channel: Channel,
  body: z.string().min(1),
  meta: z.record(z.string(), z.any()).default({}),
  createdAt: z.string(),
  readAt: z.string().nullable().default(null)
});
export type Message = z.infer<typeof Message>;

// Thread schema
export const Thread = z.object({
  id: z.string(),
  tenantId: z.string(),
  subject: z.string().default("")
});
export type Thread = z.infer<typeof Thread>;
