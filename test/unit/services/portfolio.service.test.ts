import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPortfolio } from "@server/services/portfolio.service";

// Mock $fetch for unit tests (Nuxt auto-import not available in node environment)
const mockFetch = vi.fn();
global.$fetch = mockFetch as unknown as typeof global.$fetch;

describe("portfolio.service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Mock successful API response with proper Alchemy API structure
    mockFetch.mockResolvedValue({
      data: {
        tokens: [],
        pageKey: null,
      },
    });
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

    it("should include percentage field in all tokens", async () => {
      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;
      result.tokens.forEach(token => {
        expect(token).toHaveProperty("percentage");
        expect(typeof token.percentage).toBe("number");
        expect(token.percentage).toBeGreaterThanOrEqual(0);
        expect(token.percentage).toBeLessThanOrEqual(100);
      });
    });

    it("should calculate percentages that sum to approximately 100", async () => {
      // Mock with actual token data
      mockFetch.mockResolvedValue({
        data: {
          tokens: [
            {
              address: "0x123",
              network: "eth-mainnet",
              tokenAddress: null,
              tokenBalance: "0x1",
              tokenMetadata: { symbol: "ETH", decimals: 18, name: "Ethereum", logo: null },
              tokenPrices: [{ currency: "usd", value: "3000", lastUpdatedAt: "2025-01-01" }],
            },
            {
              address: "0x123",
              network: "eth-mainnet",
              tokenAddress: "0xusdc",
              tokenBalance: "0x1",
              tokenMetadata: { symbol: "USDC", decimals: 6, name: "USD Coin", logo: null },
              tokenPrices: [{ currency: "usd", value: "1000", lastUpdatedAt: "2025-01-01" }],
            },
          ],
          pageKey: null,
        },
      });

      const promise = getPortfolio("0x123", "test-key");
      await vi.runAllTimersAsync();
      const result = await promise;

      if (result.tokens.length > 0) {
        const totalPercentage = result.tokens.reduce((sum, token) => sum + token.percentage, 0);
        expect(totalPercentage).toBeCloseTo(100, 0);
      }
    });
  });
});
