import type { useSupabaseAdmin } from "@server/utils/supabase";
import { upstreamFailed } from "@server/errors";
import type { Wallet, WalletRepo } from "./wallet.repo";

type SupabaseAdmin = ReturnType<typeof useSupabaseAdmin>;

/**
 * Supabase-backed implementation of WalletRepo.
 *
 * Expected PostgREST error codes:
 *  - PGRST116 = "no rows returned" (treated as not-found, NOT an error)
 * Everything else wraps in `upstreamFailed("supabase")`.
 */
export function createSupabaseWalletRepo(supabase: SupabaseAdmin): WalletRepo {
  return {
    async findByAddress(address: string): Promise<Wallet | null> {
      const normalized = address.toLowerCase();
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("address", normalized)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "findByAddress" },
        });
      }
      return data;
    },

    async getOrCreate(address: string): Promise<Wallet> {
      const normalized = address.toLowerCase();

      const { data: walletId, error: rpcError } = await supabase.rpc(
        "get_or_create_wallet",
        { wallet_address: normalized },
      );
      if (rpcError) {
        throw upstreamFailed("supabase", {
          cause: rpcError,
          details: { op: "get_or_create_wallet" },
        });
      }

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", walletId)
        .single();
      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "getOrCreate.fetch" },
        });
      }
      return data;
    },

    async markSnapshotTaken(walletId: string, when?: Date): Promise<void> {
      const { error } = await supabase
        .from("wallets")
        .update({ last_snapshot_at: (when ?? new Date()).toISOString() })
        .eq("id", walletId);
      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "markSnapshotTaken" },
        });
      }
    },

    async findDueForSnapshot(
      minHoursSinceLastSnapshot?: number,
    ): Promise<Wallet[]> {
      let query = supabase.from("wallets").select("*");

      if (minHoursSinceLastSnapshot !== undefined) {
        const cutoffTime = new Date(
          Date.now() - minHoursSinceLastSnapshot * 60 * 60 * 1000,
        ).toISOString();
        query = query.or(
          `last_snapshot_at.is.null,last_snapshot_at.lt.${cutoffTime}`,
        );
      }

      const { data, error } = await query;
      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "findDueForSnapshot" },
        });
      }
      return data ?? [];
    },

    async count(): Promise<number> {
      const { count, error } = await supabase
        .from("wallets")
        .select("*", { count: "exact", head: true });
      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "count" },
        });
      }
      return count ?? 0;
    },
  };
}
