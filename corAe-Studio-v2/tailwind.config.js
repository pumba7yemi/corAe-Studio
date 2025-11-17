// root/tailwind.config.ts

/**
/**
 * Reconciled config:
 * - Ensures Tailwind scans Ship (apps/ship/**) and Studio (apps/studio/**)
 * - Keeps your theme tokens (CSS variables) + radii + shadows
 * - Scans shared src/components/lib/packages as before
 */
/** @type {import('tailwindcss').Config} */
const config = {
  // Files to scan for class names
  content: [
    // Explicit TypeScript scan entries (ensure Ship and Studio are covered)
    "./apps/studio/app/**/*.{ts,tsx}",
    "./apps/ship/app/**/*.{ts,tsx}",
    "./apps/**/components/**/*.{ts,tsx}",
    "./packages/**/*.{ts,tsx}",

    // Ship app (source of truth)
    "./apps/ship/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/ship/components/**/*.{js,ts,jsx,tsx,mdx}",

    // Studio app (mirror via junction)
    "./apps/studio/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/studio/components/**/*.{js,ts,jsx,tsx,mdx}",

    // Broad apps fallback (other app packages, if any)
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",

    // Shared workspaces
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        card: "var(--panel)",
        surface: "var(--panel-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        ring: "var(--border)",
        primary: "var(--accent)",
        secondary: "var(--secondary, #22c55e)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,.25)",
      },
    },
  },
  plugins: [],
};

export default config;