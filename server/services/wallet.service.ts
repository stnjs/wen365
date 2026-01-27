import type { H3Event } from "h3";
import { useSupabaseAdmin, type Wallet } from "@server/utils/supabase";
import { logError, logInfo } from "@server/utils/logger";

/**
 * Registers a wallet in Supabase or returns existing wallet ID.
 * Uses the database function get_or_create_wallet for atomicity.
 *
 * @param event - H3 event from the request context
 * @param address - Wallet address (will be normalized to lowercase)
 * @returns Wallet UUID
 */
export async function getOrCreateWallet(event: H3Event, address: string): Promise<string> {
  const supabase = useSupabaseAdmin(event);
  const normalizedAddress = address.toLowerCase();

  const { data, error } = await supabase.rpc("get_or_create_wallet", {
    wallet_address: normalizedAddress,
  });

  if (error) {
    logError("Failed to get or create wallet", {
      address: normalizedAddress,
      error: error.message,
    });
    throw new Error(`Failed to register wallet: ${error.message}`);
  }

  logInfo("Wallet registered/retrieved", { address: normalizedAddress, walletId: data });
  return data;
}

/**
 * Retrieves a wallet by its address.
 *
 * @param event - H3 event from the request context
 * @param address - Wallet address (will be normalized to lowercase)
 * @returns Wallet record or null if not found
 */
export async function getWalletByAddress(event: H3Event, address: string): Promise<Wallet | null> {
  const supabase = useSupabaseAdmin(event);
  const normalizedAddress = address.toLowerCase();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("address", normalizedAddress)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    logError("Failed to fetch wallet", {
      address: normalizedAddress,
      error: error.message,
    });
    throw new Error(`Failed to fetch wallet: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves all wallets that are tracked for snapshots.
 * Optionally filters by wallets that haven't been snapshotted recently.
 *
 * @param event - H3 event from the request context
 * @param minHoursSinceLastSnapshot - Only return wallets that haven't been snapshotted in this many hours (optional)
 * @returns Array of wallet records
 */
export async function getWalletsForSnapshot(
  event: H3Event,
  minHoursSinceLastSnapshot?: number,
): Promise<Wallet[]> {
  const supabase = useSupabaseAdmin(event);

  let query = supabase.from("wallets").select("*");

  if (minHoursSinceLastSnapshot !== undefined) {
    const cutoffTime = new Date(Date.now() - minHoursSinceLastSnapshot * 60 * 60 * 1000).toISOString();

    // Get wallets that either:
    // 1. Have never been snapshotted (last_snapshot_at is null)
    // 2. Haven't been snapshotted since the cutoff time
    query = query.or(`last_snapshot_at.is.null,last_snapshot_at.lt.${cutoffTime}`);
  }

  const { data, error } = await query;

  if (error) {
    logError("Failed to fetch wallets for snapshot", {
      error: error.message,
    });
    throw new Error(`Failed to fetch wallets: ${error.message}`);
  }

  return data || [];
}

/**
 * Updates the last_snapshot_at timestamp for a wallet.
 *
 * @param event - H3 event from the request context
 * @param walletId - Wallet UUID
 * @param timestamp - Timestamp to set (defaults to now)
 */
export async function updateLastSnapshotAt(
  event: H3Event,
  walletId: string,
  timestamp?: Date,
): Promise<void> {
  const supabase = useSupabaseAdmin(event);

  const { error } = await supabase
    .from("wallets")
    .update({ last_snapshot_at: (timestamp || new Date()).toISOString() })
    .eq("id", walletId);

  if (error) {
    logError("Failed to update last_snapshot_at", {
      walletId,
      error: error.message,
    });
    throw new Error(`Failed to update wallet: ${error.message}`);
  }
}

/**
 * Gets the total count of tracked wallets.
 *
 * @param event - H3 event from the request context
 * @returns Number of wallets
 */
export async function getWalletCount(event: H3Event): Promise<number> {
  const supabase = useSupabaseAdmin(event);

  const { count, error } = await supabase.from("wallets").select("*", { count: "exact", head: true });

  if (error) {
    logError("Failed to count wallets", { error: error.message });
    throw new Error(`Failed to count wallets: ${error.message}`);
  }

  return count || 0;
}
