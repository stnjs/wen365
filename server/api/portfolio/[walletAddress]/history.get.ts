import { z } from "zod";
import { getSnapshotHistory } from "@server/services/snapshot.service";
import { reposFromEvent } from "@server/repos";
import { forbidden, toHttp } from "@server/errors";
import { validateParams, validateQuery } from "@server/utils/validation";
import { WalletAddressParamsSchema } from "@server/types/common";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

const HistoryQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 30))
    .pipe(z.number().int().positive().max(365)),
});

export default defineEventHandler(async (event): Promise<PortfolioHistoryDto> => {
  try {
    const session = await requireUserSession(event);
    const { walletAddress } = validateParams(event, WalletAddressParamsSchema);

    if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw forbidden("Session wallet does not match requested address");
    }

    const { days } = validateQuery(event, HistoryQuerySchema);

    const { wallets, snapshots } = reposFromEvent(event);
    const rows = await getSnapshotHistory(walletAddress, days, wallets, snapshots);

    const snapshotPoints = rows.map(row => ({
      timestamp: row.timestamp,
      totalValue: row.total_value,
    }));

    let valueChange = 0;
    let valueChangePercent = 0;

    const firstSnapshot = rows.at(0);
    const lastSnapshot = rows.at(-1);

    if (firstSnapshot && lastSnapshot && rows.length >= 2) {
      const firstValue = firstSnapshot.total_value;
      const lastValue = lastSnapshot.total_value;
      valueChange = lastValue - firstValue;
      if (firstValue > 0) {
        valueChangePercent = ((lastValue - firstValue) / firstValue) * 100;
      }
    }

    return {
      snapshots: snapshotPoints,
      valueChange: Math.round(valueChange * 100) / 100,
      valueChangePercent: Math.round(valueChangePercent * 100) / 100,
    };
  } catch (err) {
    toHttp(err, event);
  }
});
