import type { AlchemyTokensByAddressResponse, AlchemyToken } from "@server/types";
//import { alchemyTokensByAddressMock } from "@server/constants/mockData";
import { mapToPortfolioDto, mapToTokenDto } from "@server/mappers/portfolio.mapper";
import { SUPPORTED_NETWORKS } from "@server/constants/networks";
import { BLACKLISTED_TOKENS } from "@server/constants/blacklistedTokens";
import { NATIVE_TOKENS, DEFAULT_ETH_METADATA } from "@server/constants/nativeTokens";
import { roundToTwoDecimals } from "@server/utils/formatterUtils";
import { fetchWithRetry } from "@server/utils/retryUtils";

// Unused mock function - kept for potential future use
// const _getAlchemyTokensByAddressMock = async () => {
//   const response = await new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
//     return alchemyTokensByAddressMock;
//   });
//   return response as AlchemyTokensByAddressResponse;
// };

export const getAlchemyTokensByAddress = async (
  walletAddress: string,
  alchemyApiKey: string,
  pageKey?: string,
): Promise<AlchemyTokensByAddressResponse> => {
  const responseBody: {
    addresses: Array<{ address: string; networks: NetworkId[] }>;
    pageKey?: string;
  } = {
    addresses: [
      {
        address: walletAddress,
        networks: SUPPORTED_NETWORKS,
      },
    ],
    pageKey: pageKey || undefined,
  };

  const url = `https://api.g.alchemy.com/data/v1/${alchemyApiKey}/assets/tokens/by-address`;

  return await fetchWithRetry<AlchemyTokensByAddressResponse>(
    url,
    {
      method: "POST",
      body: responseBody,
      timeout: 30000,
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
    },
  );
};

/**
 * Fetches all pages from Alchemy API by recursively following pageKey
 * Aggregates all tokens from all pages into a single array
 */
async function fetchAllAlchemyPages(
  walletAddress: string,
  alchemyApiKey: string,
): Promise<AlchemyToken[]> {
  const allTokens: AlchemyToken[] = [];
  let pageKey: string | undefined = undefined;
  const MAX_PAGES = 100;
  let pageCount = 0;

  do {
    if (pageCount >= MAX_PAGES) {
      throw new Error("Maximum page limit reached");
    }

    const response = await getAlchemyTokensByAddress(walletAddress, alchemyApiKey, pageKey);
    allTokens.push(...response.data.tokens);
    pageKey = response.data.pageKey || undefined;
    pageCount++;
  } while (pageKey);

  return allTokens;
}

const isTokenBlacklisted = (token: TokenDto): boolean => {
  return BLACKLISTED_TOKENS.some(
    blacklistedToken =>
      blacklistedToken.address === token.tokenAddress && blacklistedToken.network === token.network,
  );
};

/**
 * Enriches native token metadata with predefined values
 * Uses network-specific metadata if available, otherwise falls back to ETH metadata
 */
function enrichNativeTokenMetadata(token: AlchemyToken): AlchemyToken {
  if (token.tokenAddress) {
    return token;
  }

  const hasMetadata =
    token.tokenMetadata.symbol ||
    token.tokenMetadata.name ||
    token.tokenMetadata.decimals !== null ||
    token.tokenMetadata.logo;

  if (hasMetadata) {
    return token;
  }
  const metadata = NATIVE_TOKENS[token.network] || DEFAULT_ETH_METADATA;

  return {
    ...token,
    tokenMetadata: metadata,
  };
}

/**
 * Gets portfolio data for a wallet address
 * Handles business logic: filtering, calculations, orchestration
 * Fetches all pages from Alchemy to calculate accurate totalValue
 */
export async function getPortfolio(
  walletAddress: string,
  alchemyApiKey: string,
): Promise<PortfolioDto> {
  // 1. Fetch ALL pages from Alchemy API
  const allAlchemyTokens = await fetchAllAlchemyPages(walletAddress, alchemyApiKey);

  // 2. Enrich native tokens with predefined metadata
  const enrichedTokens = allAlchemyTokens.map(token => enrichNativeTokenMetadata(token));

  // 3. Transform Alchemy tokens to DTOs (pure transformation)
  const allTokenDtos = enrichedTokens.map(token => mapToTokenDto(token));

  // 4. Business logic: Filter tokens with value > 0 and not blacklisted
  const activeTokens = allTokenDtos
    .filter(token => token.tokenValue > 0 && !isTokenBlacklisted(token))
    .sort((a, b) => b.tokenValue - a.tokenValue);

  // 5. Business logic: Calculate total value from active tokens only
  const totalValue = roundToTwoDecimals(
    activeTokens.reduce((sum, token) => sum + token.tokenValue, 0),
  );

  // 6. Map to final PortfolioDto (pure transformation)
  return mapToPortfolioDto(totalValue, activeTokens);
}
