/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
      boxShadow: { card: "0 8px 24px rgba(0,0,0,.25)" },
    },
  },
  plugins: [],
};