import type { PortfolioSnapshot, SnapshotRepo, SnapshotToken, WalletRepo } from "@server/repos";
import { getPortfolio } from "@server/services/portfolio.service";
import { logError, logInfo, logWarn } from "@server/utils/logger";
import { DomainError } from "@server/errors";

/**
 * Create a Portfolio Snapshot for the given Wallet Address.
 *
 * Orchestrates: ensure Wallet exists → fetch live Portfolio → persist Snapshot
 * → mark Wallet's last_snapshot_at.
 */
export async function createSnapshot(
  walletAddress: string,
  alchemyApiKey: string,
  wallets: WalletRepo,
  snapshots: SnapshotRepo,
): Promise<PortfolioSnapshot> {
  const wallet = await wallets.getOrCreate(walletAddress);
  const portfolio = await getPortfolio(walletAddress, alchemyApiKey);

  const tokens: SnapshotToken[] = portfolio.tokens.map((token: TokenDto) => ({
    symbol: token.tokenMetadata.symbol,
    address: token.tokenAddress,
    network: token.network,
    balance: token.tokenBalance,
    value: token.tokenValue,
  }));

  const snapshot = await snapshots.create({
    walletId: wallet.id,
    totalValue: portfolio.totalValue,
    tokens,
  });

  await wallets.markSnapshotTaken(wallet.id);

  logInfo("Snapshot created", {
    walletAddress,
    walletId: wallet.id,
    snapshotId: snapshot.id,
    totalValue: portfolio.totalValue,
    tokenCount: tokens.length,
  });

  return snapshot;
}

/**
 * Return the Snapshot history for a Wallet Address over the last `days` days.
 * Returns an empty array when the Wallet is not yet registered (not an error).
 */
export async function getSnapshotHistory(
  walletAddress: string,
  days: number,
  wallets: WalletRepo,
  snapshots: SnapshotRepo,
): Promise<PortfolioSnapshot[]> {
  const wallet = await wallets.findByAddress(walletAddress);
  if (!wallet) return [];
  return snapshots.historyForWallet(wallet.id, days);
}

/**
 * Return the most recent Snapshot for a Wallet Address, or null when the
 * Wallet is not registered or has none yet.
 */
export async function getLatestSnapshot(
  walletAddress: string,
  wallets: WalletRepo,
  snapshots: SnapshotRepo,
): Promise<PortfolioSnapshot | null> {
  const wallet = await wallets.findByAddress(walletAddress);
  if (!wallet) return null;
  return snapshots.latestForWallet(wallet.id);
}

/**
 * Delete Snapshots older than `daysToKeep` days.
 */
export async function cleanupOldSnapshots(
  daysToKeep: number,
  snapshots: SnapshotRepo,
): Promise<number> {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  const deleted = await snapshots.deleteOlderThan(cutoff);
  logInfo("Cleaned up old snapshots", { deletedCount: deleted, daysToKeep });
  return deleted;
}

/**
 * Compute the 24h value delta for a Portfolio, using the stored Snapshot
 * history. Returns `null` when:
 *  - The Wallet has no Snapshot history yet (expected for new Wallets).
 *  - The Snapshot repo is unavailable (logged as WARN — we intentionally
 *    degrade so the live Portfolio endpoint still returns).
 *
 * See ADR-0004 for why infra failure is swallowed here.
 */
export async function compute24hDelta(
  walletAddress: string,
  currentTotal: number,
  wallets: WalletRepo,
  snapshots: SnapshotRepo,
): Promise<{ change: number; changePercent: number } | null> {
  try {
    const wallet = await wallets.findByAddress(walletAddress);
    if (!wallet) return null;

    const window = await snapshots.historyForWallet(wallet.id, 2);
    const previous = window.at(0);
    if (!previous) return null;

    const previousValue = previous.total_value;
    const change = currentTotal - previousValue;
    const changePercent =
      previousValue > 0 ? (change / previousValue) * 100 : 0;

    return {
      change: roundToCents(change),
      changePercent: roundToCents(changePercent),
    };
  } catch (err) {
    // Deliberate degradation: logged, not thrown. See ADR-0004.
    if (DomainError.is(err)) {
      logWarn("24h delta unavailable", {
        walletAddress,
        kind: err.kind,
        message: err.message,
      });
    } else {
      logError("24h delta failed with unexpected error", {
        walletAddress,
        cause: err instanceof Error ? err.message : err,
      });
    }
    return null;
  }
}

function roundToCents(n: number): number {
  return Math.round(n * 100) / 100;
}
