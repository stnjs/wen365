import { getWalletsForSnapshot } from "@server/services/wallet.service";
import { createSnapshot, cleanupOldSnapshots } from "@server/services/snapshot.service";
import { logError, logInfo, logWarn } from "@server/utils/logger";

// 22h buffer: Vercel Hobby has ±59min execution variance. Using 24h would exclude
// wallets snapshotted 23h59m ago when the job runs. 22h ensures we don't miss any.
const MIN_HOURS_BETWEEN_SNAPSHOTS = 22;

// Delay between processing wallets to avoid rate limiting (ms)
const DELAY_BETWEEN_WALLETS_MS = 1000;

// Maximum wallets to process per CRON run
const MAX_WALLETS_PER_RUN = 50;

const DAYS_TO_KEEP_SNAPSHOTS = 365;

/**
 * CRON endpoint for creating portfolio snapshots.
 * Protected by CRON_SECRET in Authorization header.
 *
 * Vercel CRON jobs send Authorization: Bearer <CRON_SECRET>
 */
export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event);

  // Validate CRON_SECRET
  const authHeader = getHeader(event, "authorization");
  const expectedAuth = `Bearer ${config.cronSecret}`;

  if (!config.cronSecret) {
    logError("CRON_SECRET not configured");
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  if (authHeader !== expectedAuth) {
    logWarn("Unauthorized CRON request", {
      hasAuth: !!authHeader,
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if (!config.alchemyApiKey) {
    logError("ALCHEMY_API_KEY not configured");
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
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

  try {
    // Get wallets that need snapshots
    const wallets = await getWalletsForSnapshot(event, MIN_HOURS_BETWEEN_SNAPSHOTS);

    logInfo("CRON snapshot started", {
      totalWallets: wallets.length,
      maxToProcess: MAX_WALLETS_PER_RUN,
    });

    // Limit the number of wallets processed per run
    const walletsToProcess = wallets.slice(0, MAX_WALLETS_PER_RUN);

    for (const wallet of walletsToProcess) {
      results.processed++;

      try {
        await createSnapshot(event, wallet.address, config.alchemyApiKey);
        results.successful++;

        // Add delay between wallets to avoid rate limiting
        if (results.processed < walletsToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_WALLETS_MS));
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          address: wallet.address,
          error: errorMessage,
        });
        logError("Failed to create snapshot for wallet", {
          address: wallet.address,
          error: errorMessage,
        });
      }
    }

    // Cleanup old snapshots (only if we successfully processed some)
    let cleanedUp = 0;
    if (results.successful > 0) {
      try {
        cleanedUp = await cleanupOldSnapshots(event, DAYS_TO_KEEP_SNAPSHOTS);
      } catch (error) {
        logError("Failed to cleanup old snapshots", {
          error: error instanceof Error ? error.message : "Unknown error",
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError("CRON snapshot failed", {
      error: errorMessage,
      duration: Date.now() - startTime,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Snapshot job failed",
      data: { error: errorMessage },
    });
  }
});
