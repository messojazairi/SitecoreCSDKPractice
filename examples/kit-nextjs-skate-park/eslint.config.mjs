import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { 
    rules: {
      // Don't force alt for <Image/> (sourced from Sitecore media)
      "jsx-a11y/alt-text": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Rules for test files only
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*", "**/*.mockProps.ts"],
    rules: {
      // Allow any types in test files (needed for test mocks)
      "@typescript-eslint/no-explicit-any": "off",
      // Allow require() style imports in test files (needed for dynamic component loading)
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
