import type { AlchemyTokensByAddressResponse } from "@server/types";
export const alchemyTokensByAddressMock: AlchemyTokensByAddressResponse = {
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
