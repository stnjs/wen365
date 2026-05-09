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
      }),
    ],
  },
});
