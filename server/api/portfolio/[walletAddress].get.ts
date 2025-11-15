import { isAddress } from "viem";
import { getPortfolio } from "@server/services/portfolio.service";
import { handleServiceError } from "@server/utils/errorHandler";

export default defineEventHandler(async (event): Promise<PortfolioDto> => {
  const config = useRuntimeConfig(event);
  const alchemyApiKey = config.alchemyApiKey;

  if (!alchemyApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  const walletAddress = getRouterParam(event, "walletAddress");
  if (!walletAddress || !isAddress(walletAddress)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid wallet address format",
    });
  }

  try {
    return await getPortfolio(walletAddress, alchemyApiKey);
  } catch (error: unknown) {
    handleServiceError(error);
  }
});
