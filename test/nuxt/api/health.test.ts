import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import pkg from "../../../package.json";

// Tier 3 starter (per testing.mdc §7): boot a real Nitro instance and call
// the route via $fetch. This is the cheapest legitimate route test — no
// upstream services to mock for /health, so it doubles as a smoke test that
// the test harness itself works.

await setup({
  // Start the test Nuxt server fresh for this suite.
  server: true,
});

describe("/api/health", () => {
  it("returns a healthy status payload with the package version", async () => {
    const res = await $fetch<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
    }>("/api/health");

    expect(res.status).toBe("healthy");
    expect(res.version).toBe(pkg.version);
    expect(typeof res.timestamp).toBe("string");
    expect(new Date(res.timestamp).toString()).not.toBe("Invalid Date");
  });
});
