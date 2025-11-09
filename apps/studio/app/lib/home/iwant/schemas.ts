import { z } from "zod";

export const WantStatus = z.enum(["WISHLIST", "ORDERED", "RECEIVED", "CANCELLED"]);
export type WantStatus = z.infer<typeof WantStatus>;

export const WantItem = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.string().default("General"),
  estimate: z.number().nonnegative().default(0),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  targetDate: z.string().optional(),
  link: z.string().url().optional(),
  notes: z.string().optional(),
  status: WantStatus.default("WISHLIST"),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WantItem = z.infer<typeof WantItem>;

export const WantCreate = WantItem.pick({
  title: true,
  category: true,
  estimate: true,
  priority: true,
  targetDate: true,
  link: true,
  notes: true,
  tags: true,
}).partial({ category: true, estimate: true, priority: true, tags: true });

export const WantList = z.array(WantItem);
export type WantList = z.infer<typeof WantList>;

export default { WantItem, WantCreate, WantList };
