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
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*", "**/*.mockProps.ts", "**/__mocks__/**/*"],
    rules: {
      // Allow any types in test files (needed for test mocks)
      "@typescript-eslint/no-explicit-any": "off",
      // Allow require() style imports in test files (needed for dynamic component loading)
      "@typescript-eslint/no-require-imports": "off",
      // Allow missing display names in test files (common in test mocks)
      "react/display-name": "off",
      // Allow <img> tags in test files (test mocks don't need Next.js Image optimization)
      "@next/next/no-img-element": "off",
      // Allow passing children as props in test files (common in test scenarios)
      "react/no-children-prop": "off",
      // Allow unused variables in test files (common for test setup and mocks)
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
