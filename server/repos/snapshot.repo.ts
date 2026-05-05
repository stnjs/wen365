import type { PortfolioSnapshot } from "@server/utils/supabase";

/**
 * Shape of a single Token stored inside a Snapshot's JSONB `tokens` column.
 * Distinct from TokenDto because it elides metadata we don't need for history.
 */
export interface SnapshotToken {
  symbol: string | null;
  address: string | null;
  network: string;
  balance: number;
  value: number;
}

/**
 * Repository for the `portfolio_snapshots` table.
 *
 * All lookup methods take `walletId` (UUID) — never an on-chain Address.
 * Resolving an Address to a walletId is the service layer's job, via
 * WalletRepo.findByAddress.
 *
 * See ADR-0005 for rationale.
 */
export interface SnapshotRepo {
  /**
   * Persist a new Snapshot for the given Wallet. Returns the stored row.
   */
  create(input: {
    walletId: string;
    totalValue: number;
    tokens: SnapshotToken[];
  }): Promise<PortfolioSnapshot>;

  /**
   * Return Snapshots for the Wallet within the last `days` days, ordered by
   * timestamp ascending. Empty array when the Wallet has none.
   */
  historyForWallet(walletId: string, days: number): Promise<PortfolioSnapshot[]>;

  /**
   * Return the most recent Snapshot for the Wallet, or `null` when none exist.
   */
  latestForWallet(walletId: string): Promise<PortfolioSnapshot | null>;

  /**
   * Delete Snapshots older than the cutoff. Returns the number deleted.
   */
  deleteOlderThan(cutoff: Date): Promise<number>;
}

export type { PortfolioSnapshot };
