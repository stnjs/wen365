import { getPortfolio } from "@server/services/portfolio.service";
import { handleServiceError } from "@server/utils/errorHandler";
import { validateParams } from "@server/utils/validation";
import { WalletAddressParamsSchema } from "@server/types/common";

export default defineEventHandler(async (event): Promise<PortfolioDto> => {
  const session = await requireUserSession(event);
  const config = useRuntimeConfig(event);
  const alchemyApiKey = config.alchemyApiKey;

  if (!alchemyApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  // Validate route params with Zod (also normalizes address to checksum format)
  const { walletAddress } = validateParams(event, WalletAddressParamsSchema);

  // Validate that the user is the owner of the wallet
  if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  try {
    return await getPortfolio(walletAddress, alchemyApiKey);
  } catch (error: unknown) {
    handleServiceError(error);
  }
});
