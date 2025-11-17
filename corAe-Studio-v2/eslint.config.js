// eslint.config.js — ESLint v9 Flat Config (Victor Mode)
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/**", ".next/**", "dist/**", "coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tseslint.parser },
    rules: {
      // Victor guardrails
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/*"],
              message:
                "🚫 Victor Mode: '@/lib/*' is forbidden. Use domain imports like '@/caia/...', '@/brand/...', '@/obari/...'."
            }
          ]
        }
      ],
      // noise control
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/require-await": "off"
    }
  }
];