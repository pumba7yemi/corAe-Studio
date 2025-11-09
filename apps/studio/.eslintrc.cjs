/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: { ecmaVersion: 2023, sourceType: "module" },
  ignorePatterns: ["**/.next/**", "**/dist/**", "**/generated/**"],
  rules: {
    // keep internal navigation flexible while we clean
    "@next/next/no-html-link-for-pages": "off",
  },
};
