import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lintSelfCheck } from "~~/scripts/agent-workflow/self-check-lint.mjs";
import { makeContract } from "~~/test/factories/contract";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";
import { makeRow, makeSelfCheck } from "~~/test/factories/selfCheck";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/self-check-lint.mjs", import.meta.url),
);
const contract = makeContract({ status: "approved", approved: "2026-10-05" });
const skip = {
  file: "test/unit/wallet.test.ts",
  line: 12,
  kind: "test-skip",
  text: 'it.skip("adds a Wallet", () => {});',
};

describe("lintSelfCheck", () => {
  it("accepts a complete self-check with every criterion met", () => {
    expect(lintSelfCheck({ selfCheck: makeSelfCheck(), contract, gateChanges: [] })).toEqual({
      problems: [],
      warnings: [],
    });
  });

  it("reports a criterion missing from the table", () => {
    const selfCheck = makeSelfCheck({ rows: [makeRow("AC-1"), makeRow("AC-3")] });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] }).problems).toEqual([
      "AC-2 is missing from ## Criteria.",
    ]);
  });

  it("reports a row for a criterion the contract does not have", () => {
    const selfCheck = makeSelfCheck({
      rows: ["AC-1", "AC-2", "AC-3", "AC-4"].map(id => makeRow(id)),
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] }).problems).toEqual([
      "AC-4 is not a criterion in the contract.",
    ]);
  });

  it("reports a met criterion without evidence", () => {
    const selfCheck = makeSelfCheck({
      rows: [makeRow("AC-1"), makeRow("AC-2", "met", ""), makeRow("AC-3")],
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] }).problems).toEqual([
      "AC-2 is met but names no evidence.",
    ]);
  });

  it("reports an unknown status", () => {
    const selfCheck = makeSelfCheck({
      rows: [makeRow("AC-1"), makeRow("AC-2", "done"), makeRow("AC-3")],
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] }).problems).toEqual([
      'AC-2 status must be one of met, partial, not met, not verified; got "done".',
    ]);
  });

  it("fails a criterion that is not met unless an amendment covers it", () => {
    const selfCheck = makeSelfCheck({
      rows: [makeRow("AC-1"), makeRow("AC-2", "not met", "CSV export not built"), makeRow("AC-3")],
    });
    const amended = makeContract({
      status: "approved",
      approved: "2026-10-06",
      amendments: "- 2026-10-06 — AC-2: CSV export moved to a later contract — out of time",
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] }).problems).toEqual([
      "AC-2 is not met and no amendment covers it.",
    ]);
    expect(lintSelfCheck({ selfCheck, contract: amended, gateChanges: [] }).problems).toEqual([]);
  });

  it("warns about, but does not fail, a criterion that is not verified", () => {
    const selfCheck = makeSelfCheck({
      rows: [
        makeRow("AC-1"),
        makeRow("AC-2"),
        makeRow("AC-3", "not verified", "needs ALCHEMY_API_KEY"),
      ],
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [] })).toEqual({
      problems: [],
      warnings: ["AC-3 is not verified: needs ALCHEMY_API_KEY."],
    });
  });

  it("reports a gate change that is not justified", () => {
    expect(
      lintSelfCheck({ selfCheck: makeSelfCheck(), contract, gateChanges: [skip] }).problems,
    ).toEqual([
      'Gate change not justified under ## Gate changes: `test/unit/wallet.test.ts` · test-skip · it.skip("adds a Wallet", () => {});',
    ]);
  });

  it("accepts a justified gate change regardless of its line number", () => {
    const selfCheck = makeSelfCheck({
      gateChanges: [
        '- `test/unit/wallet.test.ts` · test-skip · `it.skip("adds a Wallet", () => {});` — justified: flaky upstream, tracked in #31',
      ],
    });

    expect(
      lintSelfCheck({ selfCheck, contract, gateChanges: [{ ...skip, line: 40 }] }).problems,
    ).toEqual([]);
  });

  it("matches a gate change whose text contains backticks", () => {
    const change = {
      file: "app/utils/label.ts",
      line: 3,
      kind: "as-any",
      text: "const label = `${name}` as any;",
    };
    const selfCheck = makeSelfCheck({
      gateChanges: [
        "- `app/utils/label.ts` · as-any · `` const label = `${name}` as any; `` — justified: typed in PR 3",
      ],
    });

    expect(lintSelfCheck({ selfCheck, contract, gateChanges: [change] }).problems).toEqual([]);
  });
});

describe("self-check-lint CLI", () => {
  const CONTRACT = "docs/plans/2026-10-05-multiple-wallets/contract.md";
  let repo: GitRepo;
  beforeEach(() => {
    repo = makeGitRepo();
    repo.write(CONTRACT, contract);
    repo.commit("docs(plan): Multiple Wallets per Session");
  });
  afterEach(() => {
    repo.remove();
  });

  it("fails when the plan folder has no self-check", () => {
    const result = spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stderr).toBe(
      "docs/plans/2026-10-05-multiple-wallets/self-check.md does not exist. Run /wen-self-check.\n",
    );
  });

  it("lists an unjustified gate change from the branch and exits 1", () => {
    repo.write("test/unit/wallet.test.ts", "// @ts-nocheck\n");
    repo.write("docs/plans/2026-10-05-multiple-wallets/self-check.md", makeSelfCheck());
    repo.commit("test: wallet");
    const result = spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "- Gate change not justified under ## Gate changes: `test/unit/wallet.test.ts` · ts-nocheck · // @ts-nocheck",
    );
  });

  it("prints ok with warnings and exits 0", () => {
    repo.write(
      "docs/plans/2026-10-05-multiple-wallets/self-check.md",
      makeSelfCheck({
        rows: [
          makeRow("AC-1"),
          makeRow("AC-2"),
          makeRow("AC-3", "not verified", "manual check pending"),
        ],
      }),
    );
    repo.commit("docs(self-check): Multiple Wallets per Session");
    const result = spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(
      "docs/plans/2026-10-05-multiple-wallets/self-check.md: ok\nwarning: AC-3 is not verified: manual check pending.\n",
    );
  });
});
