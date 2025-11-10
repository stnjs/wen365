// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  name: "custom/rules",
  rules: {
    // Vue rules
    "vue/multi-word-component-names": "off",
    "vue/no-v-html": "warn", // Security warning for v-html
    "vue/require-default-prop": "off", // TypeScript makes this redundant
    "vue/require-explicit-emits": "error", // Better type safety for emits

    // TypeScript rules (only rules that don't require type information)
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off", // Too strict for Vue
    "@typescript-eslint/no-non-null-assertion": "warn",
    // Note: prefer-nullish-coalescing and prefer-optional-chain require type info
    // They may already be enabled in Nuxt's base config with proper parser setup

    // General rules
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off", // Use TypeScript version instead
    "prefer-const": "error",
    "no-var": "error",
  },
});
