import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { eslintIgnores } from "./shared/config/eslint.config.mjs";

// eslint-config-next ships flat configs natively — no FlatCompat needed.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(eslintIgnores),
]);
