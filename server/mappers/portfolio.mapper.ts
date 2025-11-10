import type { AlchemyToken } from "@server/types";
import { calculateTokenUsdValue, convertTokenBalanceToNumber } from "@server/utils/blockchainUtils";

export function mapToTokenDto(alchemyToken: AlchemyToken): TokenDto {
  const usdPrice =
    alchemyToken.tokenPrices.find(p => p.currency.toLowerCase() === "usd") ||
    alchemyToken.tokenPrices[0];

  const tokenPrice = usdPrice ? parseFloat(usdPrice.value) : 0;
  const tokenValue = calculateTokenUsdValue(alchemyToken);

  const tokenBalance = convertTokenBalanceToNumber(alchemyToken);

  return {
    network: alchemyToken.network,
    tokenAddress: alchemyToken.tokenAddress,
    tokenBalance,
    tokenMetadata: {
      symbol: alchemyToken.tokenMetadata.symbol,
      decimals: alchemyToken.tokenMetadata.decimals,
      name: alchemyToken.tokenMetadata.name,
      logo: alchemyToken.tokenMetadata.logo,
    },
    tokenPrice,
    tokenValue,
  };
}

/**
 * Maps data to PortfolioDto
 * Pure transformation function - no business logic
 * @param totalValue - Pre-calculated total portfolio value
 * @param tokens - Pre-processed and filtered tokens
 */
export function mapToPortfolioDto(totalValue: number, tokens: TokenDto[]): PortfolioDto {
  return {
    totalValue,
    totalValueChange24h: 0, // TODO: Implement 24h change calculation
    totalValueChangePercent24h: 0,
    tokens,
  };
}
