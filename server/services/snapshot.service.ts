import type { H3Event } from "h3";
import { useSupabaseAdmin, type PortfolioSnapshot } from "@server/utils/supabase";
import { getOrCreateWallet, updateLastSnapshotAt } from "@server/services/wallet.service";
import { getPortfolio } from "@server/services/portfolio.service";
import { logError, logInfo } from "@server/utils/logger";

/**
 * Token data stored in snapshot JSONB
 */
export interface SnapshotToken {
  symbol: string | null;
  address: string | null;
  network: string;
  balance: number;
  value: number;
}

/**
 * Creates a portfolio snapshot for a wallet.
 * Fetches current portfolio data and stores it in the database.
 *
 * @param event - H3 event from the request context
 * @param walletAddress - Wallet address to snapshot
 * @param alchemyApiKey - Alchemy API key for fetching portfolio
 * @returns The created snapshot record
 */
export async function createSnapshot(
  event: H3Event,
  walletAddress: string,
  alchemyApiKey: string,
): Promise<PortfolioSnapshot> {
  const supabase = useSupabaseAdmin(event);

  // Get or create wallet first to get the wallet ID
  const walletId = await getOrCreateWallet(event, walletAddress);

  // Fetch current portfolio
  const portfolio = await getPortfolio(walletAddress, alchemyApiKey);

  // Transform tokens for storage
  const tokens: SnapshotToken[] = portfolio.tokens.map((token: TokenDto) => ({
    symbol: token.tokenMetadata.symbol,
    address: token.tokenAddress,
    network: token.network,
    balance: token.tokenBalance,
    value: token.tokenValue,
  }));

  // Insert snapshot
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .insert({
      wallet_id: walletId,
      total_value: portfolio.totalValue,
      tokens: tokens as unknown as PortfolioSnapshot["tokens"],
    })
    .select()
    .single();

  if (error) {
    logError("Failed to create snapshot", {
      walletAddress,
      walletId,
      error: error.message,
    });
    throw new Error(`Failed to create snapshot: ${error.message}`);
  }

  // Update last_snapshot_at on the wallet
  await updateLastSnapshotAt(event, walletId);

  logInfo("Snapshot created", {
    walletAddress,
    walletId,
    snapshotId: data.id,
    totalValue: portfolio.totalValue,
    tokenCount: tokens.length,
  });

  return data;
}

/**
 * Retrieves snapshot history for a wallet.
 *
 * @param event - H3 event from the request context
 * @param walletAddress - Wallet address
 * @param days - Number of days of history to retrieve (default: 30)
 * @returns Array of snapshots ordered by timestamp descending
 */
export async function getSnapshotHistory(
  event: H3Event,
  walletAddress: string,
  days: number = 30,
): Promise<PortfolioSnapshot[]> {
  const supabase = useSupabaseAdmin(event);
  const normalizedAddress = walletAddress.toLowerCase();

  // Calculate the cutoff date
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // First get the wallet ID
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("address", normalizedAddress)
    .single();

  if (walletError) {
    if (walletError.code === "PGRST116") {
      // Wallet not found - return empty array
      return [];
    }
    logError("Failed to fetch wallet for history", {
      walletAddress: normalizedAddress,
      error: walletError.message,
    });
    throw new Error(`Failed to fetch wallet: ${walletError.message}`);
  }

  // Fetch snapshots
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .eq("wallet_id", wallet.id)
    .gte("timestamp", cutoffDate)
    .order("timestamp", { ascending: true });

  if (error) {
    logError("Failed to fetch snapshot history", {
      walletAddress: normalizedAddress,
      walletId: wallet.id,
      error: error.message,
    });
    throw new Error(`Failed to fetch history: ${error.message}`);
  }

  return data || [];
}

/**
 * Gets the latest snapshot for a wallet.
 *
 * @param event - H3 event from the request context
 * @param walletAddress - Wallet address
 * @returns The latest snapshot or null if none exists
 */
export async function getLatestSnapshot(
  event: H3Event,
  walletAddress: string,
): Promise<PortfolioSnapshot | null> {
  const supabase = useSupabaseAdmin(event);
  const normalizedAddress = walletAddress.toLowerCase();

  // First get the wallet ID
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("address", normalizedAddress)
    .single();

  if (walletError) {
    if (walletError.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch wallet: ${walletError.message}`);
  }

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch latest snapshot: ${error.message}`);
  }

  return data;
}

/**
 * Cleans up old snapshots from the database.
 *
 * @param event - H3 event from the request context
 * @param daysToKeep - Number of days of history to keep (default: 90)
 * @returns Number of deleted snapshots
 */
export async function cleanupOldSnapshots(
  event: H3Event,
  daysToKeep: number = 90,
): Promise<number> {
  const supabase = useSupabaseAdmin(event);

  // Calculate cutoff date
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

  // Delete old snapshots
  const { error, count } = await supabase
    .from("portfolio_snapshots")
    .delete({ count: "exact" })
    .lt("timestamp", cutoffDate);

  if (error) {
    logError("Failed to cleanup old snapshots", {
      daysToKeep,
      error: error.message,
    });
    throw new Error(`Failed to cleanup snapshots: ${error.message}`);
  }

  const deletedCount = count || 0;
  logInfo("Cleaned up old snapshots", { deletedCount, daysToKeep });
  return deletedCount;
}
