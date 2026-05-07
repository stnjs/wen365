// Client-side fixtures backing demo mode. No server endpoint, no Alchemy call.

const ETH_PRICE = 3245.12;

export const DEMO_PORTFOLIO: PortfolioDto = {
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
      tokenPrice: ETH_PRICE,
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
      tokenPrice: ETH_PRICE,
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
      tokenPrice: ETH_PRICE,
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
        name: "Polygon",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
      },
      tokenPrice: 0.83,
      tokenValue: 431.34,
      percentage: 0.9,
    },
  ],
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BASE_PORTFOLIO_VALUE = 42_000;
const TREND_GROWTH = 5_800;
const MAX_HISTORY_DAYS = 365;
const MIN_HISTORY_VALUE = 1_000;

// Deterministic sine-wave; stable across renders for a given `days` so the
// chart looks the same on every reload.
export function buildDemoPortfolioHistory(days: number = 30): PortfolioHistoryDto {
  const clampedDays = Math.max(1, Math.min(days, MAX_HISTORY_DAYS));
  const now = Date.now();

  const snapshots = Array.from({ length: clampedDays }, (_, i) => {
    const progress = i / clampedDays;
    const trend = progress * TREND_GROWTH;
    const wave = Math.sin(i * 0.4) * 1200 + Math.cos(i * 0.9) * 800;
    const value = Math.round((BASE_PORTFOLIO_VALUE + trend + wave) * 100) / 100;

    return {
      timestamp: new Date(now - (clampedDays - 1 - i) * MS_PER_DAY).toISOString(),
      totalValue: Math.max(value, MIN_HISTORY_VALUE),
    };
  });

  const firstValue = snapshots[0]?.totalValue ?? 0;
  const lastValue = snapshots[snapshots.length - 1]?.totalValue ?? 0;
  const valueChange = Math.round((lastValue - firstValue) * 100) / 100;
  const valueChangePercent =
    firstValue > 0
      ? Math.round(((lastValue - firstValue) / firstValue) * 10000) / 100
      : 0;

  return { snapshots, valueChange, valueChangePercent };
}
