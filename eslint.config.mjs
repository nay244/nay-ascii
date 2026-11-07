import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Images are plain lazy <img> tags; the default optimizer isn't available in an export.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // mockData() runs the mockups' scripts and returns whatever they define.
    files: ["tests/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The local-only mockups, which never ship.
    ".superpowers/**",
    // Wrangler's scratch files from the local preview.
    ".wrangler/**",
    // Copies of approved files; they must stay byte for byte as they are.
    "src/lib/art/pieces/**",
    "src/lib/art/vendor/**",
  ]),
]);

export default eslintConfig;
