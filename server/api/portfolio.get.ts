export default defineEventHandler(async event => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock portfolio data
  const portfolio = {
    totalValue: 125000,
    totalValueChange24h: 2500,
    totalValueChangePercent24h: 2.04,
    assets: [
      {
        id: "1",
        tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "ETH",
        tokenName: "Ethereum",
        quantity: "2.5",
        quantityUsd: 75000,
        priceUsd: 3000,
        priceChange24h: 2.5,
        acquisitionDate: 1640995200000, // Jan 1, 2022
        holdingDays: 365,
        isTaxFree: false,
      },
      {
        id: "2",
        tokenAddress: "0xB0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "BTC",
        tokenName: "Bitcoin",
        quantity: "0.5",
        quantityUsd: 25000,
        priceUsd: 50000,
        priceChange24h: 1.8,
        acquisitionDate: 1640995200000, // Jan 1, 2022
        holdingDays: 365,
        isTaxFree: true,
      },
      {
        id: "3",
        tokenAddress: "0xC0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "USDC",
        tokenName: "USD Coin",
        quantity: "25000",
        quantityUsd: 25000,
        priceUsd: 1.0,
        priceChange24h: 0.0,
        acquisitionDate: 1640995200000, // Jan 1, 2022
        holdingDays: 365,
        isTaxFree: false,
      },
    ],
    taxFreeAssets: [
      {
        id: "2",
        tokenAddress: "0xB0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "BTC",
        tokenName: "Bitcoin",
        quantity: "0.5",
        quantityUsd: 25000,
        priceUsd: 50000,
        priceChange24h: 1.8,
        acquisitionDate: 1640995200000,
        holdingDays: 365,
        isTaxFree: true,
      },
    ],
    taxableAssets: [
      {
        id: "1",
        tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "ETH",
        tokenName: "Ethereum",
        quantity: "2.5",
        quantityUsd: 75000,
        priceUsd: 3000,
        priceChange24h: 2.5,
        acquisitionDate: 1640995200000,
        holdingDays: 365,
        isTaxFree: false,
      },
      {
        id: "3",
        tokenAddress: "0xC0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
        tokenSymbol: "USDC",
        tokenName: "USD Coin",
        quantity: "25000",
        quantityUsd: 25000,
        priceUsd: 1.0,
        priceChange24h: 0.0,
        acquisitionDate: 1640995200000,
        holdingDays: 365,
        isTaxFree: false,
      },
    ],
  };

  return portfolio;
});
