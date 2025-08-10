export default defineEventHandler(async event => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock transaction data
  const transactions = [
    {
      id: "1",
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
      tokenSymbol: "ETH",
      tokenName: "Ethereum",
      type: "receive",
      value: "1.0",
      valueUsd: 3000,
      timestamp: 1640995200000, // Jan 1, 2022
      blockNumber: 14000000,
      gasUsed: "21000",
      gasPrice: "20000000000",
      network: "ethereum",
      status: "confirmed",
    },
    {
      id: "2",
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      tokenAddress: "0xB0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
      tokenSymbol: "BTC",
      tokenName: "Bitcoin",
      type: "receive",
      value: "0.1",
      valueUsd: 5000,
      timestamp: 1640995200000, // Jan 1, 2022
      blockNumber: 700000,
      gasUsed: "1000",
      gasPrice: "50000000",
      network: "bitcoin",
      status: "confirmed",
    },
    {
      id: "3",
      hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      tokenAddress: "0xC0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
      tokenSymbol: "USDC",
      tokenName: "USD Coin",
      type: "receive",
      value: "10000",
      valueUsd: 10000,
      timestamp: 1640995200000, // Jan 1, 2022
      blockNumber: 14000001,
      gasUsed: "65000",
      gasPrice: "20000000000",
      network: "ethereum",
      status: "confirmed",
    },
    {
      id: "4",
      hash: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
      tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
      tokenSymbol: "ETH",
      tokenName: "Ethereum",
      type: "send",
      value: "0.5",
      valueUsd: 1500,
      timestamp: 1643673600000, // Feb 1, 2022
      blockNumber: 14100000,
      gasUsed: "21000",
      gasPrice: "25000000000",
      network: "ethereum",
      status: "confirmed",
    },
    {
      id: "5",
      hash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
      tokenAddress: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8",
      tokenSymbol: "ETH",
      tokenName: "Ethereum",
      type: "receive",
      value: "1.0",
      valueUsd: 3200,
      timestamp: 1646352000000, // Mar 1, 2022
      blockNumber: 14200000,
      gasUsed: "21000",
      gasPrice: "22000000000",
      network: "ethereum",
      status: "confirmed",
    },
  ];

  return transactions;
});
