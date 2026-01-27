import { getSnapshotHistory } from "@server/services/snapshot.service";
import { handleServiceError } from "@server/utils/errorHandler";
import { validateParams } from "@server/utils/validation";
import { WalletAddressParamsSchema } from "@server/types/common";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;

export default defineEventHandler(async (event): Promise<PortfolioHistoryDto> => {
  // Validate route params with Zod (also normalizes address to checksum format)
  const { walletAddress } = validateParams(event, WalletAddressParamsSchema);

  // Get optional query params
  const query = getQuery(event);
  let days = DEFAULT_DAYS;

  if (query.days) {
    const parsedDays = parseInt(query.days as string, 10);
    if (!isNaN(parsedDays) && parsedDays > 0 && parsedDays <= MAX_DAYS) {
      days = parsedDays;
    }
  }

  try {
    const snapshots = await getSnapshotHistory(event, walletAddress, days);

    // Calculate value change from first to last snapshot
    let valueChange = 0;
    let valueChangePercent = 0;

    const firstSnapshot = snapshots.at(0);
    const lastSnapshot = snapshots.at(-1);

    if (firstSnapshot && lastSnapshot && snapshots.length >= 2) {
      const firstValue = firstSnapshot.total_value;
      const lastValue = lastSnapshot.total_value;

      valueChange = lastValue - firstValue;

      if (firstValue > 0) {
        valueChangePercent = ((lastValue - firstValue) / firstValue) * 100;
      }
    }

    return {
      snapshots: snapshots.map(snapshot => ({
        timestamp: snapshot.timestamp,
        totalValue: snapshot.total_value,
      })),
      valueChange: Math.round(valueChange * 100) / 100,
      valueChangePercent: Math.round(valueChangePercent * 100) / 100,
    };
  } catch (error: unknown) {
    handleServiceError(error);
  }
});
