import { getPortfolio } from "@server/services/portfolio.service";
import { getSnapshotHistory } from "@server/services/snapshot.service";
import { handleServiceError } from "@server/utils/errorHandler";
import { logError } from "@server/utils/logger";
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

  const { walletAddress } = validateParams(event, WalletAddressParamsSchema);

  if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  try {
    const portfolio = await getPortfolio(walletAddress, alchemyApiKey);

    try {
      const snapshots = await getSnapshotHistory(event, walletAddress, 2);
      const firstSnapshot = snapshots.at(0);
      if (firstSnapshot) {
        const previousValue = firstSnapshot.total_value;
        const change = portfolio.totalValue - previousValue;
        portfolio.totalValueChange24h = Math.round(change * 100) / 100;
        portfolio.totalValueChangePercent24h =
          previousValue > 0 ? Math.round((change / previousValue) * 100 * 100) / 100 : 0;
      }
    } catch (err) {
      logError("Failed to compute 24h change", { walletAddress, error: String(err) });
    }

    return portfolio;
  } catch (error: unknown) {
    handleServiceError(error);
  }
});
