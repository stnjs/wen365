import type { useSupabaseAdmin, PortfolioSnapshot } from "@server/utils/supabase";
import { upstreamFailed } from "@server/errors";
import type { SnapshotRepo, SnapshotToken } from "./snapshot.repo";

type SupabaseAdmin = ReturnType<typeof useSupabaseAdmin>;

/**
 * Supabase-backed implementation of SnapshotRepo.
 */
export function createSupabaseSnapshotRepo(supabase: SupabaseAdmin): SnapshotRepo {
  return {
    async create(input): Promise<PortfolioSnapshot> {
      const { data, error } = await supabase
        .from("portfolio_snapshots")
        .insert({
          wallet_id: input.walletId,
          total_value: input.totalValue,
          tokens: input.tokens as unknown as PortfolioSnapshot["tokens"],
        })
        .select()
        .single();
      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "snapshot.create" },
        });
      }
      return data;
    },

    async historyForWallet(walletId: string, days: number): Promise<PortfolioSnapshot[]> {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .eq("wallet_id", walletId)
        .gte("timestamp", cutoffDate)
        .order("timestamp", { ascending: true });

      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "snapshot.historyForWallet" },
        });
      }
      return data ?? [];
    },

    async latestForWallet(walletId: string): Promise<PortfolioSnapshot | null> {
      const { data, error } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .eq("wallet_id", walletId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "snapshot.latestForWallet" },
        });
      }
      return data;
    },

    async deleteOlderThan(cutoff: Date): Promise<number> {
      const { error, count } = await supabase
        .from("portfolio_snapshots")
        .delete({ count: "exact" })
        .lt("timestamp", cutoff.toISOString());

      if (error) {
        throw upstreamFailed("supabase", {
          cause: error,
          details: { op: "snapshot.deleteOlderThan" },
        });
      }
      return count ?? 0;
    },
  };
}

export type { SnapshotToken };
