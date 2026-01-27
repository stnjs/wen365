import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "@server/types/database";

export function useSupabaseAdmin(event: H3Event) {
  return serverSupabaseServiceRole<Database>(event);
}

// Type helpers for convenience
export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type WalletInsert = Database["public"]["Tables"]["wallets"]["Insert"];
export type PortfolioSnapshot = Database["public"]["Tables"]["portfolio_snapshots"]["Row"];
export type PortfolioSnapshotInsert = Database["public"]["Tables"]["portfolio_snapshots"]["Insert"];
