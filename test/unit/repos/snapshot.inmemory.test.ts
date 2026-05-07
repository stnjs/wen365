import { describe, it, expect, beforeEach } from "vitest";
import { createInMemorySnapshotRepo } from "@server/repos/snapshot.inmemory";
import { createInMemoryWalletRepo } from "@server/repos/wallet.inmemory";
import type { SnapshotRepo } from "@server/repos/snapshot.repo";
import type { WalletRepo } from "@server/repos/wallet.repo";

describe("InMemorySnapshotRepo (contract)", () => {
  let wallets: WalletRepo;
  let snapshots: SnapshotRepo;

  beforeEach(() => {
    wallets = createInMemoryWalletRepo();
    snapshots = createInMemorySnapshotRepo();
  });

  it("create persists a snapshot and returns it", async () => {
    const wallet = await wallets.getOrCreate("0xabc");
    const snap = await snapshots.create({
      walletId: wallet.id,
      totalValue: 100,
      tokens: [{ symbol: "ETH", address: null, network: "eth-mainnet", balance: 1, value: 100 }],
    });
    expect(snap.wallet_id).toBe(wallet.id);
    expect(snap.total_value).toBe(100);
    expect(snap.id).toBeDefined();
    expect(snap.timestamp).toBeDefined();
  });

  it("historyForWallet returns [] for an unknown wallet id", async () => {
    expect(await snapshots.historyForWallet("missing", 7)).toEqual([]);
  });

  it("historyForWallet returns snapshots in ascending order", async () => {
    const wallet = await wallets.getOrCreate("0xabc");
    const first = await snapshots.create({
      walletId: wallet.id,
      totalValue: 1,
      tokens: [],
    });
    // Second snapshot ~1ms later; timestamps are ISO strings so a small wait
    // is sufficient — we assert the order is first-then-second.
    await new Promise(r => setTimeout(r, 5));
    const second = await snapshots.create({
      walletId: wallet.id,
      totalValue: 2,
      tokens: [],
    });

    const history = await snapshots.historyForWallet(wallet.id, 7);
    expect(history.map(h => h.id)).toEqual([first.id, second.id]);
  });

  it("historyForWallet excludes snapshots outside the day window", async () => {
    const wallet = await wallets.getOrCreate("0xabc");
    // Fabricate an old snapshot directly in the seed.
    const old = {
      id: "old",
      wallet_id: wallet.id,
      total_value: 1,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      tokens: null,
    } as const;
    snapshots = createInMemorySnapshotRepo([old]);
    // Window of 7 days shouldn't include the 30-day-old row.
    expect(await snapshots.historyForWallet(wallet.id, 7)).toEqual([]);
  });

  it("latestForWallet returns null when none exist", async () => {
    expect(await snapshots.latestForWallet("anything")).toBeNull();
  });

  it("latestForWallet returns the newest snapshot", async () => {
    const wallet = await wallets.getOrCreate("0xabc");
    await snapshots.create({ walletId: wallet.id, totalValue: 1, tokens: [] });
    await new Promise(r => setTimeout(r, 5));
    const newest = await snapshots.create({
      walletId: wallet.id,
      totalValue: 2,
      tokens: [],
    });
    const latest = await snapshots.latestForWallet(wallet.id);
    expect(latest?.id).toBe(newest.id);
  });

  it("deleteOlderThan removes expired snapshots and returns count", async () => {
    const wallet = await wallets.getOrCreate("0xabc");
    const seed = [
      {
        id: "old",
        wallet_id: wallet.id,
        total_value: 1,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        tokens: null,
      },
      {
        id: "new",
        wallet_id: wallet.id,
        total_value: 2,
        timestamp: new Date().toISOString(),
        tokens: null,
      },
    ];
    snapshots = createInMemorySnapshotRepo(seed);
    const deleted = await snapshots.deleteOlderThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    expect(deleted).toBe(1);
    const history = await snapshots.historyForWallet(wallet.id, 365);
    expect(history.map(h => h.id)).toEqual(["new"]);
  });
});
