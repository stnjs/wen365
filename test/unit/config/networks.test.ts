import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NETWORKS } from "#shared/config/networks";

const ALL_REGISTRY_SLUGS = NETWORKS.map(n => n.alchemySlug);

describe("networks config", () => {
  const originalEnv = process.env.SUPPORTED_NETWORKS;

  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPPORTED_NETWORKS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SUPPORTED_NETWORKS = originalEnv;
    } else {
      delete process.env.SUPPORTED_NETWORKS;
    }
  });

  async function importNetworks() {
    const mod = await import("@server/config/networks");
    return mod.SUPPORTED_NETWORKS;
  }

  it("falls back to the full registry when SUPPORTED_NETWORKS is unset", async () => {
    const networks = await importNetworks();
    expect(networks).toEqual(ALL_REGISTRY_SLUGS);
  });

  it("parses a valid comma-separated list", async () => {
    process.env.SUPPORTED_NETWORKS = "eth-mainnet,matic-mainnet";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "matic-mainnet"]);
  });

  it("filters out unknown slugs and keeps the rest", async () => {
    process.env.SUPPORTED_NETWORKS = "eth-mainnet,fake-network";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet"]);
  });

  it("falls back to the full registry when no valid slugs remain", async () => {
    process.env.SUPPORTED_NETWORKS = "fake1,fake2";
    const networks = await importNetworks();
    expect(networks).toEqual(ALL_REGISTRY_SLUGS);
  });

  it("trims whitespace around slugs", async () => {
    process.env.SUPPORTED_NETWORKS = " eth-mainnet , base-mainnet ";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "base-mainnet"]);
  });

  it("falls back to the full registry on empty string", async () => {
    process.env.SUPPORTED_NETWORKS = "";
    const networks = await importNetworks();
    expect(networks).toEqual(ALL_REGISTRY_SLUGS);
  });
});
