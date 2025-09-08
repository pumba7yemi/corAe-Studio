// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        card: "var(--panel)",
        surface: "var(--panel-2)",
        text: "var(--text)",
        muted: "var(--muted)",
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
        // <-- Enables `shadow-card`
        card: "0 8px 24px rgba(0,0,0,.25)",
      },
    },
  },
  plugins: [],
};

export default config;