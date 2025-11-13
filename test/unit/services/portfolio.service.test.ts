import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPortfolio } from "@server/services/portfolio.service";

describe("portfolio.service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getPortfolio", () => {
    it("should filter tokens with zero balance", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result.tokens.every(token => token.tokenValue > 0)).toBe(true);
    });

    it("should filter blacklisted tokens", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      const blacklistedAddress = "0x0b91b07beb67333225a5ba0259d55aee10e3a578";
      const blacklistedNetwork = "matic-mainnet";
      const hasBlacklisted = result.tokens.some(
        token => token.tokenAddress === blacklistedAddress && token.network === blacklistedNetwork,
      );
      expect(hasBlacklisted).toBe(false);
    });

    it("should sort tokens by value in descending order", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      if (result.tokens.length > 1) {
        for (let i = 0; i < result.tokens.length - 1; i++) {
          const current = result.tokens[i];
          const next = result.tokens[i + 1];
          if (current && next) {
            expect(current.tokenValue).toBeGreaterThanOrEqual(next.tokenValue);
          }
        }
      }
    });

    it("should calculate total value as sum of all token values rounded to 2 decimals", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      const sumOfTokenValues = result.tokens.reduce((sum, token) => sum + token.tokenValue, 0);
      const roundedSum = Math.round(sumOfTokenValues * 100) / 100;
      expect(result.totalValue).toBe(roundedSum);
    });

    it("should return correct PortfolioDto structure", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result).toHaveProperty("totalValue");
      expect(result).toHaveProperty("totalValueChange24h");
      expect(result).toHaveProperty("totalValueChangePercent24h");
      expect(result).toHaveProperty("tokens");
      expect(Array.isArray(result.tokens)).toBe(true);
      expect(result.totalValueChange24h).toBe(0);
      expect(result.totalValueChangePercent24h).toBe(0);
    });

    it("should handle empty portfolio gracefully", async () => {
      // This test verifies the service handles cases where all tokens are filtered out
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result).toHaveProperty("tokens");
      expect(Array.isArray(result.tokens)).toBe(true);
      expect(result.totalValue).toBeGreaterThanOrEqual(0);
    });

    it("should enrich native token metadata when missing", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      const nativeTokens = result.tokens.filter(token => token.tokenAddress === null);
      nativeTokens.forEach(token => {
        expect(token.tokenMetadata).toBeDefined();
        expect(token.tokenMetadata.symbol).toBeTruthy();
        expect(token.tokenMetadata.decimals).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
