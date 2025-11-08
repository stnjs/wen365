export interface TokenMetadataDto {
  /** Token symbol (e.g., "ETH", "WETH") */
  symbol: string | null;
  /** Number of decimals for the token */
  decimals: number | null;
  /** Full token name */
  name: string | null;
  /** URL to token logo image */
  logo: string | null;
}
