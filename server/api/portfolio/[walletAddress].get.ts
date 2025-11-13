import { getPortfolio } from "@server/services/portfolio.service";
export default defineEventHandler(async (event): Promise<PortfolioDto> => {
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
    return await getPortfolio(walletAddress, alchemyApiKey);
  } catch (error: any) {
    console.error("Alchemy API error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch portfolio data",
    });
  }
});
