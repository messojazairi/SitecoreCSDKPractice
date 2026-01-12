import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // Global ignores
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
            ".generated/**",
            "**/*.d.ts",
            "**/*.js",
            "**/__tests__/**/*",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.mockProps.ts",
        ],
    },
    // Main config with rules
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:prettier/recommended",
    ),
    {
        rules: {
            // Don't force alt for <Image/> (sourced from Sitecore media)
            "jsx-a11y/alt-text": ["warn", { elements: ["img"] }],
            // Don't force next/image
            "@next/next/no-img-element": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    caughtErrorsIgnorePattern: ".",
                },
            ],
            "@typescript-eslint/no-explicit-any": "error",
            "jsx-quotes": ["error", "prefer-double"],
        },
    },
    // Override rules for test files (even though they're ignored, this ensures they're not checked if they slip through)
    {
        files: [
            "**/__tests__/**/*",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.mockProps.ts",
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "react/no-children-prop": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "react/display-name": "off",
            "@next/next/no-img-element": "off",
        },
    },
];

export default eslintConfig;
