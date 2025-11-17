/**
 * Tailwind config for v2 Studio app — include extension files so
 * VS Code Tailwind Intellisense recognizes extension CSS/JS/TS files.
 */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../extensions/**/*.{html,js,ts,jsx,tsx,css}",
    "../../corAe-Studio/extensions/**/*.{html,js,ts,jsx,tsx,css}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
