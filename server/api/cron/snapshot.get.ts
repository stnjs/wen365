import { reposFromEvent } from "@server/repos";
import {
  createSnapshot,
  cleanupOldSnapshots,
} from "@server/services/snapshot.service";
import { internal, unauthorized, toHttp } from "@server/errors";
import { logError, logInfo, logWarn } from "@server/utils/logger";

// 22h buffer: Vercel Hobby has ±59min execution variance. Using 24h would exclude
// wallets snapshotted 23h59m ago when the job runs. 22h ensures we don't miss any.
const MIN_HOURS_BETWEEN_SNAPSHOTS = 22;

const DELAY_BETWEEN_WALLETS_MS = 1000;

const MAX_WALLETS_PER_RUN = 50;

const DAYS_TO_KEEP_SNAPSHOTS = 365;

/**
 * CRON endpoint for creating portfolio snapshots.
 * Protected by CRON_SECRET in Authorization header.
 *
 * Vercel CRON jobs send Authorization: Bearer <CRON_SECRET>
 */
export default defineEventHandler(async event => {
  try {
    const config = useRuntimeConfig(event);

    const authHeader = getHeader(event, "authorization");
    const expectedAuth = `Bearer ${config.cronSecret}`;

    if (!config.cronSecret) {
      throw internal("Server configuration error: missing CRON_SECRET");
    }

    if (authHeader !== expectedAuth) {
      logWarn("Unauthorized CRON request", { hasAuth: !!authHeader });
      throw unauthorized("Invalid CRON token");
    }

    if (!config.alchemyApiKey) {
      throw internal("Server configuration error: missing ALCHEMY_API_KEY");
    }

    const startTime = Date.now();
    const results: {
      processed: number;
      successful: number;
      failed: number;
      errors: Array<{ address: string; error: string }>;
    } = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };

    const { wallets, snapshots } = reposFromEvent(event);

    const dueWallets = await wallets.findDueForSnapshot(MIN_HOURS_BETWEEN_SNAPSHOTS);

    logInfo("CRON snapshot started", {
      totalWallets: dueWallets.length,
      maxToProcess: MAX_WALLETS_PER_RUN,
    });

    const walletsToProcess = dueWallets.slice(0, MAX_WALLETS_PER_RUN);

    for (const wallet of walletsToProcess) {
      results.processed++;

      try {
        await createSnapshot(
          wallet.address,
          config.alchemyApiKey,
          wallets,
          snapshots,
        );
        results.successful++;

        if (results.processed < walletsToProcess.length) {
          await new Promise(resolve =>
            setTimeout(resolve, DELAY_BETWEEN_WALLETS_MS),
          );
        }
      } catch (err) {
        results.failed++;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push({
          address: wallet.address,
          error: errorMessage,
        });
        logError("Failed to create snapshot for Wallet", {
          address: wallet.address,
          cause: errorMessage,
        });
      }
    }

    let cleanedUp = 0;
    if (results.successful > 0) {
      try {
        cleanedUp = await cleanupOldSnapshots(DAYS_TO_KEEP_SNAPSHOTS, snapshots);
      } catch (err) {
        logError("Failed to cleanup old Snapshots", {
          cause: err instanceof Error ? err.message : err,
        });
      }
    }

    const duration = Date.now() - startTime;

    logInfo("CRON snapshot completed", {
      duration,
      ...results,
      cleanedUp,
    });

    return {
      success: true,
      duration,
      ...results,
      cleanedUp,
    };
  } catch (err) {
    toHttp(err, event);
  }
});
