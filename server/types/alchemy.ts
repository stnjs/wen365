/**
 * Alchemy API Response Types
 * Based on Alchemy's tokens/by-address endpoint
 * https://docs.alchemy.com/reference/gettokenbalances
 */

import type { NetworkId } from "~~/shared/types/NetworkId";

/**
 * Token price information
 */
export interface AlchemyTokenPrice {
  /** Currency code (e.g., "usd") */
  currency: string;
  /** Price value as a string (decimal) */
  value: string;
  /** ISO 8601 timestamp of last price update */
  lastUpdatedAt: string;
}

/**
 * Token metadata information
 */
export interface AlchemyTokenMetadata {
  /** Token symbol (e.g., "ETH", "WETH") */
  symbol: string | null;
  /** Number of decimals for the token */
  decimals: number | null;
  /** Full token name */
  name: string | null;
  /** URL to token logo image */
  logo: string | null;
}

/**
 * Individual token information from Alchemy API
 */
export interface AlchemyToken {
  /** Wallet address that owns this token */
  address: string;
  /** Network identifier (e.g., "eth-mainnet") */
  network: NetworkId;
  /** Token contract address (null for native tokens like ETH) */
  tokenAddress: string | null;
  /** Token balance as hex string */
  tokenBalance: string;
  /** Token metadata (symbol, decimals, name, logo) */
  tokenMetadata: AlchemyTokenMetadata;
  /** Array of price information for different currencies */
  tokenPrices: AlchemyTokenPrice[];
}

/**
 * Response data structure from Alchemy tokens/by-address endpoint
 */
export interface AlchemyTokensData {
  /** Array of tokens owned by the wallet */
  tokens: AlchemyToken[];
  /** Pagination key for fetching next page (null if no more pages) */
  pageKey: string | null;
}

/**
 * Complete Alchemy API response structure
 */
export interface AlchemyTokensByAddressResponse {
  /** Response data containing tokens and pagination info */
  data: AlchemyTokensData;
}

export interface BlacklistedToken {
  network: NetworkId;
  address: string;
  symbol?: string;
}
