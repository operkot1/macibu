// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";

export default tseslint.config(
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
