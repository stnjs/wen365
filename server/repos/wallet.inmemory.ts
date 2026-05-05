import type { Wallet, WalletRepo } from "./wallet.repo";

/**
 * In-memory WalletRepo for tests. Preserves the Supabase adapter's semantics:
 *  - Addresses are compared case-insensitively.
 *  - `findByAddress` returns `null` on absence, never throws.
 *  - Infrastructure failures are out of scope (there's no infrastructure).
 *
 * Not exported from the repo index — callers must import explicitly because
 * this is test-only code.
 */
export function createInMemoryWalletRepo(seed: Wallet[] = []): WalletRepo {
  const byAddress = new Map<string, Wallet>(
    seed.map(w => [w.address.toLowerCase(), w]),
  );
  const byId = new Map<string, Wallet>(seed.map(w => [w.id, w]));

  return {
    async findByAddress(address: string): Promise<Wallet | null> {
      return byAddress.get(address.toLowerCase()) ?? null;
    },

    async getOrCreate(address: string): Promise<Wallet> {
      const normalized = address.toLowerCase();
      const existing = byAddress.get(normalized);
      if (existing) return existing;

      const wallet: Wallet = {
        id: crypto.randomUUID(),
        address: normalized,
        created_at: new Date().toISOString(),
        last_snapshot_at: null,
      };
      byAddress.set(normalized, wallet);
      byId.set(wallet.id, wallet);
      return wallet;
    },

    async markSnapshotTaken(walletId: string, when?: Date): Promise<void> {
      const wallet = byId.get(walletId);
      if (!wallet) return;
      wallet.last_snapshot_at = (when ?? new Date()).toISOString();
    },

    async findDueForSnapshot(
      minHoursSinceLastSnapshot?: number,
    ): Promise<Wallet[]> {
      if (minHoursSinceLastSnapshot === undefined) {
        return [...byAddress.values()];
      }
      const cutoff = Date.now() - minHoursSinceLastSnapshot * 60 * 60 * 1000;
      return [...byAddress.values()].filter(w => {
        if (w.last_snapshot_at === null) return true;
        return new Date(w.last_snapshot_at).getTime() < cutoff;
      });
    },

    async count(): Promise<number> {
      return byAddress.size;
    },
  };
}
