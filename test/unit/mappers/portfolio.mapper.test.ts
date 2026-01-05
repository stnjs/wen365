import { describe, it, expect } from "vitest";
import type { AlchemyToken } from "@server/schemas/alchemy";
import { TokenDtoFromAlchemySchema } from "@server/schemas/alchemy";
import { mapToPortfolioDto } from "@server/mappers/portfolio.mapper";

describe("portfolio.mapper", () => {
  describe("TokenDtoFromAlchemySchema (Zod transform)", () => {
    it("should transform token with USD price correctly", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        tokenBalance: "0x5f5e100", // 100000000 (100 USDC with 6 decimals)
        tokenMetadata: {
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
          logo: "https://example.com/logo.png",
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "1.0",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.network).toBe("eth-mainnet");
      expect(result.tokenAddress).toBe("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      expect(result.tokenMetadata.symbol).toBe("USDC");
      expect(result.tokenMetadata.decimals).toBe(6);
      expect(result.tokenMetadata.name).toBe("USD Coin");
      expect(result.tokenMetadata.logo).toBe("https://example.com/logo.png");
      expect(result.tokenPrice).toBe(1.0);
      expect(result.tokenBalance).toBe(100); // 100000000 / 10^6 = 100
      expect(result.tokenValue).toBe(100); // 100 * 1.0 = 100
    });

    it("should fall back to first price when USD not found", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xtoken",
        tokenBalance: "0xde0b6b3a7640000", // 1 ETH (18 decimals)
        tokenMetadata: {
          symbol: "TOKEN",
          decimals: 18,
          name: "Test Token",
          logo: null,
        },
        tokenPrices: [
          {
            currency: "eur",
            value: "0.9",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.tokenPrice).toBe(0.9);
    });

    it("should handle token with no prices", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0xtoken",
        tokenBalance: "0xde0b6b3a7640000",
        tokenMetadata: {
          symbol: "TOKEN",
          decimals: 18,
          name: "Test Token",
          logo: null,
        },
        tokenPrices: [],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.tokenPrice).toBe(0);
      expect(result.tokenValue).toBe(0);
    });

    it("should transform native token (null tokenAddress)", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0x2386f26fc10000", // 0.01 ETH
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: "https://example.com/eth.png",
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "3000",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.tokenAddress).toBeNull();
      expect(result.network).toBe("eth-mainnet");
      expect(result.tokenMetadata.symbol).toBe("ETH");
    });

    it("should transform ERC-20 token correctly", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: "0x4d224452801aced8b2f0aebe155379bb5d594381",
        tokenBalance: "0xde0b6b3a7640000", // 1 token
        tokenMetadata: {
          symbol: "APE",
          decimals: 18,
          name: "ApeCoin",
          logo: "https://example.com/ape.png",
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "2.5",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.tokenAddress).toBe("0x4d224452801aced8b2f0aebe155379bb5d594381");
      expect(result.tokenMetadata.symbol).toBe("APE");
      expect(result.tokenMetadata.name).toBe("ApeCoin");
      expect(result.tokenPrice).toBe(2.5);
    });

    it("should transform all metadata fields correctly", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "matic-mainnet",
        tokenAddress: "0xtoken",
        tokenBalance: "0xde0b6b3a7640000",
        tokenMetadata: {
          symbol: "MATIC",
          decimals: 18,
          name: "Polygon",
          logo: "https://example.com/matic.png",
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "0.8",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.network).toBe("matic-mainnet");
      expect(result.tokenMetadata.symbol).toBe("MATIC");
      expect(result.tokenMetadata.decimals).toBe(18);
      expect(result.tokenMetadata.name).toBe("Polygon");
      expect(result.tokenMetadata.logo).toBe("https://example.com/matic.png");
    });

    it("should handle null metadata fields", () => {
      const alchemyToken: AlchemyToken = {
        address: "0x123",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000",
        tokenMetadata: {
          symbol: null,
          decimals: null,
          name: null,
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "1000",
            lastUpdatedAt: "2025-01-01T00:00:00Z",
          },
        ],
      };

      const result = TokenDtoFromAlchemySchema.parse(alchemyToken);

      expect(result.tokenMetadata.symbol).toBeNull();
      expect(result.tokenMetadata.decimals).toBeNull();
      expect(result.tokenMetadata.name).toBeNull();
      expect(result.tokenMetadata.logo).toBeNull();
    });

    it("should throw on invalid input", () => {
      const invalidToken = {
        address: "0x123",
        network: "invalid-network", // Invalid network
        tokenAddress: null,
        tokenBalance: "0xde0b6b3a7640000",
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: null,
        },
        tokenPrices: [],
      };

      expect(() => TokenDtoFromAlchemySchema.parse(invalidToken)).toThrow();
    });
  });

  describe("mapToPortfolioDto", () => {
    it("should map to PortfolioDto with correct structure", () => {
      const totalValue = 5000.5;
      const tokens: TokenDto[] = [
        {
          network: "eth-mainnet",
          tokenAddress: null,
          tokenBalance: 1,
          tokenMetadata: {
            symbol: "ETH",
            decimals: 18,
            name: "Ethereum",
            logo: null,
          },
          tokenPrice: 3000,
          tokenValue: 3000,
          percentage: 60,
        },
        {
          network: "eth-mainnet",
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          tokenBalance: 2000,
          tokenMetadata: {
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin",
            logo: null,
          },
          tokenPrice: 1,
          tokenValue: 2000,
          percentage: 40,
        },
      ];

      const result = mapToPortfolioDto(totalValue, tokens);

      expect(result.totalValue).toBe(5000.5);
      expect(result.totalValueChange24h).toBe(0);
      expect(result.totalValueChangePercent24h).toBe(0);
      expect(result.tokens).toEqual(tokens);
      expect(result.tokens).toHaveLength(2);
    });

    it("should handle empty tokens array", () => {
      const result = mapToPortfolioDto(0, []);

      expect(result.totalValue).toBe(0);
      expect(result.tokens).toEqual([]);
      expect(result.tokens).toHaveLength(0);
    });

    it("should pass through total value correctly", () => {
      const totalValue = 12345.67;
      const tokens: TokenDto[] = [];

      const result = mapToPortfolioDto(totalValue, tokens);

      expect(result.totalValue).toBe(12345.67);
    });

    it("should set 24h change fields to 0", () => {
      const result = mapToPortfolioDto(1000, []);

      expect(result.totalValueChange24h).toBe(0);
      expect(result.totalValueChangePercent24h).toBe(0);
    });
  });
});
