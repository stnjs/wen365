import type { PortfolioSnapshot } from "@server/utils/supabase";
import type { SnapshotRepo, SnapshotToken } from "./snapshot.repo";

/**
 * In-memory SnapshotRepo for tests. Snapshots live in insertion order; each
 * method filters / sorts to match the Supabase adapter's behaviour.
 */
export function createInMemorySnapshotRepo(seed: PortfolioSnapshot[] = []): SnapshotRepo {
  const rows = new Map<string, PortfolioSnapshot>(seed.map(s => [s.id, s]));

  return {
    async create(input: {
      walletId: string;
      totalValue: number;
      tokens: SnapshotToken[];
    }): Promise<PortfolioSnapshot> {
      const snap: PortfolioSnapshot = {
        id: crypto.randomUUID(),
        wallet_id: input.walletId,
        total_value: input.totalValue,
        timestamp: new Date().toISOString(),
        tokens: input.tokens as unknown as PortfolioSnapshot["tokens"],
      };
      rows.set(snap.id, snap);
      return snap;
    },

    async historyForWallet(walletId: string, days: number): Promise<PortfolioSnapshot[]> {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return [...rows.values()]
        .filter(s => s.wallet_id === walletId && new Date(s.timestamp).getTime() >= cutoff)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },

    async latestForWallet(walletId: string): Promise<PortfolioSnapshot | null> {
      const matching = [...rows.values()]
        .filter(s => s.wallet_id === walletId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return matching[0] ?? null;
    },

    async deleteOlderThan(cutoff: Date): Promise<number> {
      const cutoffMs = cutoff.getTime();
      let deleted = 0;
      for (const [id, snap] of rows) {
        if (new Date(snap.timestamp).getTime() < cutoffMs) {
          rows.delete(id);
          deleted++;
        }
      }
      return deleted;
    },
  };
}
