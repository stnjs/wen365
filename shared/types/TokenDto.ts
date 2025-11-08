import type { TokenMetadataDto } from "./TokenMetadataDto";

export interface TokenDto {
  /** Network identifier (e.g., "eth-mainnet") */
  network: string;
  /** Token contract address (null for native tokens like ETH) */
  tokenAddress: string | null;
  /** Token balance as hex string */
  tokenBalance: string;
  /** Token metadata (symbol, decimals, name, logo) */
  tokenMetadata: TokenMetadataDto;
  /** Price of token per unit */
  tokenPrice: number;
  /** Total Value of token balance */
  tokenValue: number;
}
