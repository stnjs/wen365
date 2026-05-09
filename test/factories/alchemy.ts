import type { AlchemyToken, AlchemyTokenMetadata } from "@server/types/alchemy";

/**
 * Server-side Alchemy DTO factory. Per ADR-0003 these shapes stay server-side
 * and are kept separate from the client `Token` factories.
 *
 * Defaults represent a minimal valid happy-path Alchemy token: native ETH on
 * eth-mainnet, 1 ETH balance, no prices. Tests should override only the
 * fields they care about.
 */
export const makeAlchemyToken = (overrides: Partial<AlchemyToken> = {}): AlchemyToken => ({
  address: "0x0000000000000000000000000000000000000001",
  network: "eth-mainnet",
  tokenAddress: null,
  tokenBalance: "0xde0b6b3a7640000", // 1 ETH at 18 decimals
  tokenMetadata: {
    symbol: "ETH",
    decimals: 18,
    name: "Ethereum",
    logo: null,
  },
  tokenPrices: [],
  ...overrides,
});

export const makeAlchemyTokenMetadata = (
  overrides: Partial<AlchemyTokenMetadata> = {},
): AlchemyTokenMetadata => ({
  symbol: "ETH",
  decimals: 18,
  name: "Ethereum",
  logo: null,
  ...overrides,
});

/**
 * USD price entry for a token. Convenience for the most common case in tests.
 */
export const makeUsdPrice = (value: string) => ({
  currency: "usd" as const,
  value,
  lastUpdatedAt: "2025-01-01T00:00:00Z",
});
