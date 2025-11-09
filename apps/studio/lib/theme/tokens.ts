// lib/theme/tokens.ts
// Design tokens for corAe – central place for colors, spacing, typography, etc.

export type ColorToken =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "surface"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "text";

export type FontToken = "heading" | "body" | "mono";

export type SpacingToken =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export const colors: Record<ColorToken, string> = {
  primary: "#0EA5E9",     // blue-500
  secondary: "#9333EA",   // purple-600
  accent: "#F59E0B",      // amber-500
  background: "#FFFFFF",  // white
  surface: "#F9FAFB",     // gray-50
  error: "#EF4444",       // red-500
  warning: "#FBBF24",     // amber-400
  info: "#3B82F6",        // blue-600
  success: "#22C55E",     // green-500
  text: "#111827"         // gray-900
};

export const fonts: Record<FontToken, string> = {
  heading: "Inter, sans-serif",
  body: "Inter, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace"
};

export const spacing: Record<SpacingToken, string> = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem"
};

/**
 * Convenience bundle for components.
 */
export const tokens = {
  colors,
  fonts,
  spacing
};

export type Tokens = typeof tokens;
