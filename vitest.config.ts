import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/{e2e,unit}/**/*.{test,spec}.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "@server": resolve(__dirname, "server"),
            "~~": resolve(__dirname, "."),
            "#shared": resolve(__dirname, "shared"),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
        },
        // @nuxt/test-utils ≥3.18 (still in 4.0.3) does an unconditional
        // `import('bun:test')` that Vite v7's import-analysis tries to bundle
        // and fails on, since `bun:test` is a Bun-only built-in. The setup
        // function is never executed under Vitest, so externalize the
        // specifier and Vite stops trying to resolve it.
        // Track upstream: https://github.com/nuxt/test-utils/issues/1490
        plugins: [
          {
            name: "ignore-bun-test",
            enforce: "pre",
            resolveId(id) {
              if (id === "bun:test") {
                return { id: "bun:test", external: true };
              }
            },
          },
        ],
      }).then(withoutNitroSsrConditions),
    ],
  },
});

// Nuxt ≥4.4 (`@nuxt/nitro-server`) adds a Vite plugin that sets the SSR
// environment's resolve conditions to Nitro's export conditions plus "import".
// Vitest forwards those to its worker as Node `--conditions`, which also apply
// to CJS `require()`: `@vue/compiler-sfc` then loads magic-string's ESM build
// via require(esm) and crashes with "MagicString is not a constructor".
// The conditions only matter for the Nitro server bundle, so drop the plugin
// from the test project. Not excluded upstream as of @nuxt/test-utils 4.3.2.
function withoutNitroSsrConditions<T extends { plugins?: unknown[] }>(config: T): T {
  config.plugins = config.plugins?.filter(
    plugin => (plugin as { name?: string } | null)?.name !== "nuxt:nitro:ssr-conditions",
  );
  return config;
}
