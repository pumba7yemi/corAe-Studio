// apps/shipyard/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",   // used by .btn.primary
          700: "#1d4ed8",   // hover
          800: "#1e40af",
          900: "#1e3a8a",
          950:"#172554",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.04)",
      },
    },
  },
  plugins: [],
};