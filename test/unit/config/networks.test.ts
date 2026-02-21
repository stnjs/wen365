import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

  it("should return defaults when SUPPORTED_NETWORKS is not set", async () => {
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "base-mainnet"]);
  });

  it("should parse valid comma-separated networks", async () => {
    process.env.SUPPORTED_NETWORKS = "eth-mainnet,matic-mainnet";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "matic-mainnet"]);
  });

  it("should filter out invalid network IDs", async () => {
    process.env.SUPPORTED_NETWORKS = "eth-mainnet,fake-network";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet"]);
  });

  it("should fall back to defaults when all networks are invalid", async () => {
    process.env.SUPPORTED_NETWORKS = "fake1,fake2";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "base-mainnet"]);
  });

  it("should handle whitespace in network values", async () => {
    process.env.SUPPORTED_NETWORKS = " eth-mainnet , base-mainnet ";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "base-mainnet"]);
  });

  it("should return defaults for empty string", async () => {
    process.env.SUPPORTED_NETWORKS = "";
    const networks = await importNetworks();
    expect(networks).toEqual(["eth-mainnet", "base-mainnet"]);
  });
});
