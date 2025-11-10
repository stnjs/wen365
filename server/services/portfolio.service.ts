import type { AlchemyTokensByAddressResponse } from "@server/types";
import { alchemyTokensByAddressMock } from "@server/constants/mockData";
import {
  mapToPortfolioDto,
  mapToTokenDto,
} from "@server/mappers/portfolio.mapper";

const getAlchemyTokensByAddressMock = async () => {
  const response = await new Promise(resolve => setTimeout(resolve, 1000)).then(
    () => {
      return alchemyTokensByAddressMock;
    }
  );
  return response as AlchemyTokensByAddressResponse;
};

export const getAlchemyTokensByAddress = async (
  walletAddress: string,
  alchemyApiKey: string
): Promise<AlchemyTokensByAddressResponse> => {
  const responseBody = {
    addresses: [
      {
        address: walletAddress,
        networks: ["eth-mainnet"],
      },
    ],
  };
  return await $fetch<AlchemyTokensByAddressResponse>(
    `https://api.g.alchemy.com/data/v1/${alchemyApiKey}/assets/tokens/by-address`,
    {
      method: "POST",
      body: responseBody,
    }
  );
};

/**
 * Gets portfolio data for a wallet address
 * Handles business logic: filtering, calculations, orchestration
 */
export async function getPortfolio(
  walletAddress: string,
  alchemyApiKey: string
): Promise<PortfolioDto> {
  // 1. Fetch data from Alchemy API
  const alchemyResponse = await getAlchemyTokensByAddress(
    walletAddress,
    alchemyApiKey
  );

  // 2. Transform Alchemy tokens to DTOs (pure transformation)
  const allTokenDtos = alchemyResponse.data.tokens.map(token =>
    mapToTokenDto(token)
  );

  // 3. Business logic: Filter tokens with value > 0
  const activeTokens = allTokenDtos.filter(token => token.tokenValue > 0);

  // 4. Business logic: Calculate total value from active tokens only
  const totalValue = roundToTwoDecimals(
    activeTokens.reduce((sum, token) => sum + token.tokenValue, 0)
  );

  // 5. Map to final PortfolioDto (pure transformation)
  return mapToPortfolioDto(totalValue, activeTokens);
}
