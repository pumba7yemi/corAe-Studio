import { z } from "zod";

export const SendInput = z.object({
  to: z.string().min(1),
  channel: z.enum(["CIMS", "EMAIL", "PUSH"]).default("CIMS"),
  subject: z.string().optional(),
  body: z.string().min(1),
  meta: z.record(z.string(), z.any()).optional(),
});
export type SendInput = z.infer<typeof SendInput>;

export const MessageItem = z.object({
  id: z.string(),
  to: z.string(),
  channel: z.string(),
  subject: z.string().optional(),
  body: z.string(),
  sentAt: z.string(),
});
export type MessageItem = z.infer<typeof MessageItem>;

export const MessageList = z.array(MessageItem);

export default { SendInput, MessageItem, MessageList };
