import type {
  AlchemyTokensByAddressResponse,
  AlchemyToken,
} from "@server/types";
import { calculateTokenUsdValue } from "@server/utils/blockchainUtils";

export function mapToTokenDto(alchemyToken: AlchemyToken): TokenDto {
  // Extract USD price (find USD in the prices array, fallback to first price)
  const usdPrice =
    alchemyToken.tokenPrices.find(p => p.currency.toLowerCase() === "usd") ||
    alchemyToken.tokenPrices[0];

  const tokenPrice = usdPrice ? parseFloat(usdPrice.value) : 0;
  const tokenValue = calculateTokenUsdValue(alchemyToken);

  return {
    network: alchemyToken.network,
    tokenAddress: alchemyToken.tokenAddress,
    tokenBalance: alchemyToken.tokenBalance,
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

export function mapToPortfolioDto(
  alchemyResponse: AlchemyTokensByAddressResponse,
  totalValue: number
): PortfolioDto {
  return {
    totalValue,
    totalValueChange24h: 0, // TODO: Implement 24h change calculation
    totalValueChangePercent24h: 0,
    tokens: alchemyResponse.data.tokens.map(token => mapToTokenDto(token)),
  };
}
