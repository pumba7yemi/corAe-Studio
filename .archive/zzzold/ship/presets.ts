export type Vertical = "supermarket" | "grocery" | "fashion" | "electronics" | "default";
export type ShipBuildConfig = { vertical: Vertical; modules?: Array<{ id: string }> };
export const PRESETS: Record<Vertical, { label: string; modules: Array<{ id: string }> }> = {
  supermarket: { label: "Supermarket", modules: [] },
  grocery: { label: "Grocery", modules: [] },
  fashion: { label: "Fashion", modules: [] },
  electronics: { label: "Electronics", modules: [] },
  default: { label: "Default", modules: [] }
};