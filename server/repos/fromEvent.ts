import type { H3Event } from "h3";
import { useSupabaseAdmin } from "@server/utils/supabase";
import { createSupabaseWalletRepo } from "./wallet.supabase";
import { createSupabaseSnapshotRepo } from "./snapshot.supabase";
import type { WalletRepo } from "./wallet.repo";
import type { SnapshotRepo } from "./snapshot.repo";

/**
 * Build the Supabase-backed repos for the current request. Called once at the
 * HTTP edge; below this line, services take WalletRepo / SnapshotRepo and
 * never see an H3Event.
 */
export function reposFromEvent(event: H3Event): {
  wallets: WalletRepo;
  snapshots: SnapshotRepo;
} {
  const supabase = useSupabaseAdmin(event);
  return {
    wallets: createSupabaseWalletRepo(supabase),
    snapshots: createSupabaseSnapshotRepo(supabase),
  };
}
