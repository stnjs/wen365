/**
 * Returns static demo portfolio data so users can explore
 * the dashboard without connecting a wallet.
 */
export default defineEventHandler((): PortfolioDto => {
  return {
    totalValue: 47832.61,
    totalValueChange24h: 1243.87,
    totalValueChangePercent24h: 2.67,
    tokens: [
      {
        network: "eth-mainnet",
        tokenAddress: null,
        tokenBalance: 8.4215,
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        },
        tokenPrice: 3245.12,
        tokenValue: 27328.98,
        percentage: 57.13,
      },
      {
        network: "matic-mainnet",
        tokenAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        tokenBalance: 2.105,
        tokenMetadata: {
          symbol: "WETH",
          decimals: 18,
          name: "Wrapped Ether",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        },
        tokenPrice: 3245.12,
        tokenValue: 6830.98,
        percentage: 14.28,
      },
      {
        network: "arb-mainnet",
        tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        tokenBalance: 5200.0,
        tokenMetadata: {
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        },
        tokenPrice: 1.0,
        tokenValue: 5200.0,
        percentage: 10.87,
      },
      {
        network: "base-mainnet",
        tokenAddress: null,
        tokenBalance: 1.25,
        tokenMetadata: {
          symbol: "ETH",
          decimals: 18,
          name: "Ethereum",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        },
        tokenPrice: 3245.12,
        tokenValue: 4056.4,
        percentage: 8.48,
      },
      {
        network: "eth-mainnet",
        tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        tokenBalance: 185.5,
        tokenMetadata: {
          symbol: "LINK",
          decimals: 18,
          name: "Chainlink",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png",
        },
        tokenPrice: 14.82,
        tokenValue: 2749.11,
        percentage: 5.75,
      },
      {
        network: "opt-mainnet",
        tokenAddress: "0x4200000000000000000000000000000000000042",
        tokenBalance: 320.0,
        tokenMetadata: {
          symbol: "OP",
          decimals: 18,
          name: "Optimism",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png",
        },
        tokenPrice: 2.35,
        tokenValue: 752.0,
        percentage: 1.57,
      },
      {
        network: "arb-mainnet",
        tokenAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        tokenBalance: 410.0,
        tokenMetadata: {
          symbol: "ARB",
          decimals: 18,
          name: "Arbitrum",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
        },
        tokenPrice: 1.18,
        tokenValue: 483.8,
        percentage: 1.01,
      },
      {
        network: "matic-mainnet",
        tokenAddress: null,
        tokenBalance: 520.0,
        tokenMetadata: {
          symbol: "POL",
          decimals: 18,
          name: "POL (ex-MATIC)",
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
        },
        tokenPrice: 0.83,
        tokenValue: 431.34,
        percentage: 0.9,
      },
    ],
  };
});
