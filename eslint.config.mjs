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
      // Disable irritating TypeScript rules during development
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      
      // Disable React rules that are annoying during development
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn", // Changed to warn instead of error
      
      // Disable other common development annoyances
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "warn",
      
      // Allow console statements during development
      "no-console": "off",
      
      // Allow empty functions (useful for placeholder handlers)
      "@typescript-eslint/no-empty-function": "off",
      
      // Allow non-null assertions (sometimes needed with APIs)
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
];

export default eslintConfig;
