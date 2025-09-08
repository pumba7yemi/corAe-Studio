/* Victor Mode™ ESLint config */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    // --- noise reduction ---
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/require-await": "off",

    // --- Victor Mode™ ban ---
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["@/lib/*"],
          "message": "🚫 Victor Mode: '@/lib/*' is forbidden. Use real domain paths like '@/caia/...', '@/brand/...', '@/obari/...'"
        }
      ]
    }]
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: ["plugin:@typescript-eslint/recommended"],
    }
  ],
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "coverage/",
    "**/*.d.ts"
  ]
};