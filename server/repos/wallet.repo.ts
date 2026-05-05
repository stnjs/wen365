import type { Wallet } from "@server/utils/supabase";

/**
 * Repository for the `wallets` table.
 *
 * Callers never know where the data lives (Supabase, memory, etc).
 * Methods return `null` / `[]` for expected absence; infrastructure failures
 * throw a DomainError of kind `upstreamFailed`.
 *
 * See ADR-0005 for rationale.
 */
export interface WalletRepo {
  /**
   * Find a Wallet by its on-chain Address (case-insensitive). Returns `null`
   * when no row exists.
   */
  findByAddress(address: string): Promise<Wallet | null>;

  /**
   * Ensure a Wallet row exists for the Address and return it. Idempotent.
   */
  getOrCreate(address: string): Promise<Wallet>;

  /**
   * Update a Wallet's `last_snapshot_at` timestamp (defaults to now).
   */
  markSnapshotTaken(walletId: string, when?: Date): Promise<void>;

  /**
   * Return Wallets eligible for a new Snapshot. When `minHoursSinceLastSnapshot`
   * is provided, returns only Wallets that have never been snapshotted OR whose
   * last Snapshot is older than the cutoff.
   */
  findDueForSnapshot(minHoursSinceLastSnapshot?: number): Promise<Wallet[]>;

  /**
   * Return the total count of Wallets in the registry.
   */
  count(): Promise<number>;
}

export type { Wallet };
