import { describe, it, expect, beforeEach } from "vitest";
import { createInMemoryWalletRepo } from "@server/repos/wallet.inmemory";
import type { WalletRepo } from "@server/repos/wallet.repo";

describe("InMemoryWalletRepo (contract)", () => {
  let repo: WalletRepo;

  beforeEach(() => {
    repo = createInMemoryWalletRepo();
  });

  it("findByAddress returns null when absent (never throws)", async () => {
    expect(await repo.findByAddress("0xabc")).toBeNull();
  });

  it("getOrCreate is idempotent per address (case-insensitive)", async () => {
    const a = await repo.getOrCreate("0xABC");
    const b = await repo.getOrCreate("0xabc");
    expect(a.id).toBe(b.id);
    expect(a.address).toBe("0xabc");
    expect(await repo.count()).toBe(1);
  });

  it("findByAddress returns the created wallet", async () => {
    const created = await repo.getOrCreate("0xDEF");
    const found = await repo.findByAddress("0xdef");
    expect(found?.id).toBe(created.id);
  });

  it("markSnapshotTaken updates the timestamp", async () => {
    const wallet = await repo.getOrCreate("0xabc");
    expect(wallet.last_snapshot_at).toBeNull();

    const when = new Date("2026-01-02T03:04:05Z");
    await repo.markSnapshotTaken(wallet.id, when);

    const updated = await repo.findByAddress("0xabc");
    expect(updated?.last_snapshot_at).toBe(when.toISOString());
  });

  it("markSnapshotTaken silently ignores missing wallets", async () => {
    await expect(repo.markSnapshotTaken("missing-id")).resolves.toBeUndefined();
  });

  describe("findDueForSnapshot", () => {
    it("returns all wallets when cutoff is undefined", async () => {
      await repo.getOrCreate("0x1");
      await repo.getOrCreate("0x2");
      const due = await repo.findDueForSnapshot();
      expect(due).toHaveLength(2);
    });

    it("includes wallets with null last_snapshot_at", async () => {
      await repo.getOrCreate("0x1");
      const due = await repo.findDueForSnapshot(22);
      expect(due).toHaveLength(1);
    });

    it("excludes wallets snapshotted more recently than the cutoff", async () => {
      const wallet = await repo.getOrCreate("0x1");
      await repo.markSnapshotTaken(wallet.id, new Date());
      const due = await repo.findDueForSnapshot(22);
      expect(due).toHaveLength(0);
    });

    it("includes wallets snapshotted older than the cutoff", async () => {
      const wallet = await repo.getOrCreate("0x1");
      const longAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await repo.markSnapshotTaken(wallet.id, longAgo);
      const due = await repo.findDueForSnapshot(22);
      expect(due).toHaveLength(1);
    });
  });

  it("count reflects the registry size", async () => {
    expect(await repo.count()).toBe(0);
    await repo.getOrCreate("0x1");
    await repo.getOrCreate("0x2");
    await repo.getOrCreate("0x2");
    expect(await repo.count()).toBe(2);
  });
});
