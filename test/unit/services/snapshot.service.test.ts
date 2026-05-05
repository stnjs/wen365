import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  compute24hDelta,
  getLatestSnapshot,
  getSnapshotHistory,
} from "@server/services/snapshot.service";
import { createInMemoryWalletRepo } from "@server/repos/wallet.inmemory";
import { createInMemorySnapshotRepo } from "@server/repos/snapshot.inmemory";
import type { WalletRepo } from "@server/repos/wallet.repo";
import type { SnapshotRepo } from "@server/repos/snapshot.repo";
import { upstreamFailed } from "@server/errors";

describe("snapshot.service", () => {
  let wallets: WalletRepo;
  let snapshots: SnapshotRepo;

  beforeEach(() => {
    wallets = createInMemoryWalletRepo();
    snapshots = createInMemorySnapshotRepo();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getSnapshotHistory", () => {
    it("returns [] for an unregistered wallet (no DB error)", async () => {
      const history = await getSnapshotHistory("0xabc", 30, wallets, snapshots);
      expect(history).toEqual([]);
    });

    it("returns stored history for registered wallets", async () => {
      const wallet = await wallets.getOrCreate("0xabc");
      await snapshots.create({ walletId: wallet.id, totalValue: 1, tokens: [] });
      const history = await getSnapshotHistory("0xabc", 30, wallets, snapshots);
      expect(history).toHaveLength(1);
    });
  });

  describe("getLatestSnapshot", () => {
    it("returns null for unregistered wallets", async () => {
      expect(await getLatestSnapshot("0xabc", wallets, snapshots)).toBeNull();
    });

    it("returns null when the wallet has no snapshots yet", async () => {
      await wallets.getOrCreate("0xabc");
      expect(await getLatestSnapshot("0xabc", wallets, snapshots)).toBeNull();
    });

    it("returns the newest snapshot when present", async () => {
      const wallet = await wallets.getOrCreate("0xabc");
      await snapshots.create({ walletId: wallet.id, totalValue: 50, tokens: [] });
      const latest = await getLatestSnapshot("0xabc", wallets, snapshots);
      expect(latest?.total_value).toBe(50);
    });
  });

  describe("compute24hDelta", () => {
    it("returns null when the wallet is not registered", async () => {
      const delta = await compute24hDelta("0xabc", 1000, wallets, snapshots);
      expect(delta).toBeNull();
    });

    it("returns null when the wallet has no snapshots yet", async () => {
      await wallets.getOrCreate("0xabc");
      const delta = await compute24hDelta("0xabc", 1000, wallets, snapshots);
      expect(delta).toBeNull();
    });

    it("returns signed change + percent when history exists", async () => {
      const wallet = await wallets.getOrCreate("0xabc");
      // Previous snapshot with total 800.
      await snapshots.create({ walletId: wallet.id, totalValue: 800, tokens: [] });
      const delta = await compute24hDelta("0xabc", 1000, wallets, snapshots);
      expect(delta).toEqual({
        change: 200,
        changePercent: 25,
      });
    });

    it("handles negative movement", async () => {
      const wallet = await wallets.getOrCreate("0xabc");
      await snapshots.create({ walletId: wallet.id, totalValue: 1000, tokens: [] });
      const delta = await compute24hDelta("0xabc", 750, wallets, snapshots);
      expect(delta?.change).toBe(-250);
      expect(delta?.changePercent).toBe(-25);
    });

    it("returns changePercent 0 when previous value was 0", async () => {
      const wallet = await wallets.getOrCreate("0xabc");
      await snapshots.create({ walletId: wallet.id, totalValue: 0, tokens: [] });
      const delta = await compute24hDelta("0xabc", 100, wallets, snapshots);
      expect(delta).toEqual({ change: 100, changePercent: 0 });
    });

    it("degrades to null and logs WARN when the repo throws a DomainError", async () => {
      const warnSpy = vi.spyOn(console, "warn");
      const throwingWallets: WalletRepo = {
        ...wallets,
        findByAddress: async () => {
          throw upstreamFailed("supabase");
        },
      };
      const delta = await compute24hDelta(
        "0xabc",
        1000,
        throwingWallets,
        snapshots,
      );
      expect(delta).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
    });

    it("degrades to null and logs ERROR on unexpected (non-Domain) errors", async () => {
      const errorSpy = vi.spyOn(console, "error");
      const throwingWallets: WalletRepo = {
        ...wallets,
        findByAddress: async () => {
          throw new Error("unexpected");
        },
      };
      const delta = await compute24hDelta(
        "0xabc",
        1000,
        throwingWallets,
        snapshots,
      );
      expect(delta).toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
