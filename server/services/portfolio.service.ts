import {
  type AlchemyToken,
  type AlchemyTokensByAddressResponse,
  parseAlchemyResponse,
  TokenDtoFromAlchemySchema,
} from "@server/types/alchemy";
import { mapToPortfolioDto } from "@server/mappers/portfolio.mapper";
import { SUPPORTED_NETWORKS } from "@server/config/networks";
import { BLACKLISTED_TOKENS } from "@server/constants/blacklistedTokens";
import { NATIVE_TOKENS, DEFAULT_ETH_METADATA } from "@server/constants/nativeTokens";
import { roundToTwoDecimals } from "@server/utils/formatterUtils";
import { fetchWithRetry } from "@server/utils/retryUtils";

const MIN_TOKEN_VALUE_USD = 0.03;

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

  const response = await fetchWithRetry<unknown>(
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

  // Validate external API response with Zod
  return parseAlchemyResponse(response);
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

function isTokenBlacklisted(token: TokenDto): boolean {
  return BLACKLISTED_TOKENS.some(
    blacklistedToken =>
      blacklistedToken.address === token.tokenAddress && blacklistedToken.network === token.network,
  );
}

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
 * Creates a unique key for a token based on network and address
 */
function getTokenKey(token: TokenDto): string {
  return `${token.network}:${token.tokenAddress || "native"}`;
}

/**
 * Deduplicates tokens by network and address, keeping the one with higher value
 */
function deduplicateTokens(tokens: TokenDto[]): TokenDto[] {
  const tokenMap = new Map<string, TokenDto>();

  for (const token of tokens) {
    const key = getTokenKey(token);
    const existing = tokenMap.get(key);

    if (!existing || token.tokenValue > existing.tokenValue) {
      tokenMap.set(key, token);
    }
  }

  return Array.from(tokenMap.values());
}

/**
 * Adds percentage to each token based on total portfolio value
 * @param tokens - Array of TokenDto
 * @param totalValue - Total portfolio value in USD
 * @returns Tokens with percentage field populated
 */
function addPercentageToTokens(tokens: TokenDto[], totalValue: number): TokenDto[] {
  if (totalValue === 0) {
    return tokens.map(token => ({ ...token, percentage: 0 }));
  }

  return tokens.map(token => ({
    ...token,
    percentage: roundToTwoDecimals((token.tokenValue / totalValue) * 100),
  }));
}

export async function getPortfolio(
  walletAddress: string,
  alchemyApiKey: string,
): Promise<PortfolioDto> {
  const allAlchemyTokens = await fetchAllAlchemyPages(walletAddress, alchemyApiKey);

  const enrichedTokens = allAlchemyTokens.map(token => enrichNativeTokenMetadata(token));

  // Transform to DTOs using Zod schema (validates + transforms)
  const allTokenDtos = enrichedTokens.map(token => TokenDtoFromAlchemySchema.parse(token));

  const uniqueTokens = deduplicateTokens(allTokenDtos);

  const activeTokens = uniqueTokens
    .filter(token => token.tokenValue >= MIN_TOKEN_VALUE_USD && !isTokenBlacklisted(token))
    .sort((a, b) => b.tokenValue - a.tokenValue);

  const totalValue = roundToTwoDecimals(
    activeTokens.reduce((sum, token) => sum + token.tokenValue, 0),
  );

  const tokensWithPercentage = addPercentageToTokens(activeTokens, totalValue);

  return mapToPortfolioDto(totalValue, tokensWithPercentage);
}
