import type { AlchemyTokensByAddressResponse } from "@server/types";
import { calculatePortfolioTotalValue } from "@server/utils/blockchainUtils";

const mockResponse: AlchemyTokensByAddressResponse = {
  data: {
    tokens: [
      {
        address: "0x867c61e6f2004f45fabfc9ca0a31720ed29038bf",
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance:
          "0x0000000000000000000000000000000000000000000000000025194869f764f4",
        tokenMetadata: {
          symbol: null,
          decimals: null,
          name: null,
          logo: null,
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "3401.580304953",
            lastUpdatedAt: "2025-11-06T10:43:23Z",
          },
        ],
      },
      {
        address: "0x867c61e6f2004f45fabfc9ca0a31720ed29038bf",
        network: "eth-mainnet",
        tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        tokenBalance:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        tokenMetadata: {
          decimals: 18,
          logo: "https://static.alchemyapi.io/images/assets/2396.png",
          name: "WETH",
          symbol: "WETH",
        },
        tokenPrices: [
          {
            currency: "usd",
            value: "3401.255935411",
            lastUpdatedAt: "2025-11-06T10:43:04Z",
          },
        ],
      },
    ],
    pageKey: null,
  },
};
const getMockResponse = async () => {
  const response = await new Promise(resolve => setTimeout(resolve, 1000)).then(
    () => {
      return mockResponse;
    }
  );
  return response as AlchemyTokensByAddressResponse;
};

const getAlchemyTokensByAddress = async (
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

export default defineEventHandler(async (event): Promise<PortfolioResponse> => {
  const config = useRuntimeConfig(event);
  const alchemyApiKey = config.alchemyApiKey;
  const walletAddress = getRouterParam(event, "walletAddress");
  if (!walletAddress) {
    throw createError({
      statusCode: 400,
      statusMessage: "Wallet address is required",
    });
  }

  try {
    const alchemyTokensByAddress = await getAlchemyTokensByAddress(
      walletAddress,
      alchemyApiKey
    );
    console.log(alchemyTokensByAddress);
    const totalValue = calculatePortfolioTotalValue(
      alchemyTokensByAddress.data.tokens
    );
    return {
      totalValue: totalValue,
      totalValueChange24h: 0,
      totalValueChangePercent24h: 0,
    };
  } catch (error: any) {
    console.error("Alchemy API error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch portfolio data",
    });
  }

  // Mock portfolio data
  //   const portfolio = {
  //     totalValue: 125000,
  //     totalValueChange24h: 2500,
  //     totalValueChangePercent24h: 2.04,
  //     assets: [
  //       {
  //         id: "1",
  //         tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "ETH",
  //         tokenName: "Ethereum",
  //         quantity: "2.5",
  //         quantityUsd: 75000,
  //         priceUsd: 3000,
  //         priceChange24h: 2.5,
  //         acquisitionDate: 1640995200000, // Jan 1, 2022
  //         holdingDays: 365,
  //         isTaxFree: false,
  //       },
  //       {
  //         id: "2",
  //         tokenAddress: "0xB0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "BTC",
  //         tokenName: "Bitcoin",
  //         quantity: "0.5",
  //         quantityUsd: 25000,
  //         priceUsd: 50000,
  //         priceChange24h: 1.8,
  //         acquisitionDate: 1640995200000, // Jan 1, 2022
  //         holdingDays: 365,
  //         isTaxFree: true,
  //       },
  //       {
  //         id: "3",
  //         tokenAddress: "0xC0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "USDC",
  //         tokenName: "USD Coin",
  //         quantity: "25000",
  //         quantityUsd: 25000,
  //         priceUsd: 1.0,
  //         priceChange24h: 0.0,
  //         acquisitionDate: 1640995200000, // Jan 1, 2022
  //         holdingDays: 365,
  //         isTaxFree: false,
  //       },
  //     ],
  //     taxFreeAssets: [
  //       {
  //         id: "2",
  //         tokenAddress: "0xB0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "BTC",
  //         tokenName: "Bitcoin",
  //         quantity: "0.5",
  //         quantityUsd: 25000,
  //         priceUsd: 50000,
  //         priceChange24h: 1.8,
  //         acquisitionDate: 1640995200000,
  //         holdingDays: 365,
  //         isTaxFree: true,
  //       },
  //     ],
  //     taxableAssets: [
  //       {
  //         id: "1",
  //         tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "ETH",
  //         tokenName: "Ethereum",
  //         quantity: "2.5",
  //         quantityUsd: 75000,
  //         priceUsd: 3000,
  //         priceChange24h: 2.5,
  //         acquisitionDate: 1640995200000,
  //         holdingDays: 365,
  //         isTaxFree: false,
  //       },
  //       {
  //         id: "3",
  //         tokenAddress: "0xC0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
  //         tokenSymbol: "USDC",
  //         tokenName: "USD Coin",
  //         quantity: "25000",
  //         quantityUsd: 25000,
  //         priceUsd: 1.0,
  //         priceChange24h: 0.0,
  //         acquisitionDate: 1640995200000,
  //         holdingDays: 365,
  //         isTaxFree: false,
  //       },
  //     ],
  //   };
});
