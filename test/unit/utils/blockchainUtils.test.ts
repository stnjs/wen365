import { describe, it, expect } from "vitest";
import type { AlchemyToken } from "@server/types";
import {
  convertTokenBalanceToNumber,
  calculateTokenUsdValue,
  calculatePortfolioTotalValue,
} from "@server/utils/blockchainUtils";

// Note: We're testing with real viem formatUnits implementation
// The actual conversion logic is tested through the real implementation

describe("blockchainUtils", () => {
  describe("convertTokenBalanceToNumber", () => {
    it("should convert hex balance with 18 decimals correctly", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH in wei (10^18)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(1);
    });

    it("should convert hex balance with 6 decimals (USDC)", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        tokenBalance: "0x5f5e100", // 100 USDC (100 * 10^6)
        tokenMetadata: {
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(100);
    });

    it("should convert hex balance with 8 decimals (BTC-like)", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xbtc",
        tokenBalance: "0x5f5e100", // 1 BTC (1 * 10^8)
        tokenMetadata: {
          symbol: "BTC",
          decimals: 8,
          name: "Bitcoin",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(1);
    });

    it("should default to 18 decimals when decimals is null", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH in wei (10^18)
        tokenMetadata: {
          symbol: null,
          decimals: null,
          name: null,
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(1);
    });

    it("should handle zero balance", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0x0",
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(0);
    });

    it("should handle large balances", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xd3c21bcecceda1000000", // 1000000 ETH in wei (1000000 * 10^18)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBe(1000000);
    });

    it("should handle fractional balances", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0x38d7ea4c68000", // 0.001 ETH in wei (10^15)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = convertTokenBalanceToNumber(token);
      expect(result).toBeCloseTo(0.001, 10);
    });
  });

  describe("calculateTokenUsdValue", () => {
    it("should calculate USD value correctly (balance × price)", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "3000",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = calculateTokenUsdValue(token);
      expect(result).toBe(3000);
    });

    it("should handle zero price", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "0",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = calculateTokenUsdValue(token);
      expect(result).toBe(0);
    });

    it("should handle missing price (empty array)", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = calculateTokenUsdValue(token);
      expect(result).toBe(0);
    });

    it("should handle fractional prices", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xtoken",
        tokenBalance: "0x5f5e100", // 100 tokens (6 decimals)
        tokenMetadata: {
          symbol: "TOKEN",
          decimals: 6,
          name: "Test Token",
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "0.5",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = calculateTokenUsdValue(token);
      expect(result).toBe(50); // 100 * 0.5
    });

    it("should handle error gracefully and return 0", () => {
      const token: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "invalid-hex", // Invalid hex will cause error
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "3000",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      // Function should return 0 on error without throwing
      const result = calculateTokenUsdValue(token);
      expect(result).toBe(0);
    });
  });

  describe("calculatePortfolioTotalValue", () => {
    it("should calculate total value from multiple tokens", () => {
      const tokens: AlchemyToken[] = [
        {
          address: "0x123",
          network: "eth-mainnet",
          tokenAddress: null,
          tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
          tokenMetadata: {
            symbol: "ETH",
            decimals: 18,
            name: "Ethereum",
            logo: null,
          },
          tokenPrices: [
            {
              currency: "usd",
              value: "3000",
              lastUpdatedAt: "2025-01-01T00:00:00Z",
            },
          ],
        },
        {
          address: "0x123",
          network: "eth-mainnet",
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          tokenBalance: "0x5f5e100", // 100 USDC (6 decimals)
          tokenMetadata: {
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin",
            logo: null,
          },
          tokenPrices: [
            {
              currency: "usd",
              value: "1",
              lastUpdatedAt: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = calculatePortfolioTotalValue(tokens);
      expect(result).toBe(3100); // 3000 + 100
    });

    it("should return 0 for empty array", () => {
      const result = calculatePortfolioTotalValue([]);
      expect(result).toBe(0);
    });

    it("should round to 2 decimals", () => {
      const tokens: AlchemyToken[] = [
        {
          address: "0x123",
          network: "eth-mainnet",
          tokenAddress: null,
          tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
          tokenMetadata: {
            symbol: "ETH",
            decimals: 18,
            name: "Ethereum",
            logo: null,
          },
          tokenPrices: [
            {
              currency: "usd",
              value: "3000.123456",
              lastUpdatedAt: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = calculatePortfolioTotalValue(tokens);
      expect(result).toBe(3000.12);
    });

    it("should handle tokens with zero value", () => {
      const tokens: AlchemyToken[] = [
        {
          address: "0x123",
          network: "eth-mainnet",
          tokenAddress: null,
          tokenBalance: "0xde0b6b3a7640000", // 1 ETH (10^18)
          tokenMetadata: {
            symbol: "ETH",
            decimals: 18,
            name: "Ethereum",
            logo: null,
          },
          tokenPrices: [
            {
              currency: "usd",
              value: "3000",
              lastUpdatedAt: "2025-01-01T00:00:00Z",
            },
          ],
        },
        {
          address: "0x123",
          network: "eth-mainnet",
          tokenAddress: "0xtoken",
          tokenBalance: "0x5f5e100", // 100 tokens (6 decimals)
          tokenMetadata: {
            symbol: "TOKEN",
            decimals: 6,
            name: "Test Token",
            logo: null,
          },
          tokenPrices: [], // No price - should return 0 value
        },
      ];

      const result = calculatePortfolioTotalValue(tokens);
      // First token: 1 ETH * 3000 = 3000
      // Second token: 100 tokens * 0 price = 0
      // Total should be 3000
      expect(result).toBe(3000);
    });
  });
});
