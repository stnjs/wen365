import type { AlchemyTokensByAddressResponse } from "@server/types";
import { alchemyTokensByAddressMock } from "@server/constants/mockData";
import { mapToPortfolioDto } from "@server/mappers/portfolio.mapper";

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

// server/services/portfolio.service.ts (business logic)
export async function getPortfolio(
  walletAddress: string,
  alchemyApiKey: string
): Promise<PortfolioDto> {
  // 1. Fetch (service)
  const tokens = await getAlchemyTokensByAddress(walletAddress, alchemyApiKey);

  // 2. Calculate (util - pure function)
  const totalValue = calculatePortfolioTotalValue(tokens.data.tokens);

  // 3. Transform (service - business logic)
  return mapToPortfolioDto(tokens, totalValue);
}
