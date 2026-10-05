import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeContract } from "~~/test/factories/contract";
import { driftRow, makeDrift, makePattern } from "~~/test/factories/drift";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/drift-lint.mjs", import.meta.url),
);
const FOLDER = "docs/plans/2026-10-05-multiple-wallets";
const run = (repo: GitRepo) => spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

let repo: GitRepo;
beforeEach(() => {
  repo = makeGitRepo();
  repo.baseline({ "docs/patterns/redundant-ref-annotation.md": makePattern() });
});
afterEach(() => {
  repo.remove();
});

describe("drift-lint CLI", () => {
  it("fails when the branch has no drift", () => {
    const result = run(repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("No drift.md on this branch. Run /wen-drift.\n");
  });

  it("checks full-path drift against the contract in the same folder", () => {
    repo.write(
      `${FOLDER}/contract.md`,
      makeContract({ status: "approved", approved: "2026-10-05" }),
    );
    repo.write(`${FOLDER}/drift.md`, makeDrift({ rows: [driftRow("AC-1"), driftRow("AC-2")] }));
    const result = run(repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toBe(`${FOLDER}/drift.md:\n- AC-3 is missing from ## Contract.\n`);
  });

  it("accepts small-path drift whose slugs exist", () => {
    repo.write(
      "docs/plans/2026-10-05-icon-swap/drift.md",
      makeDrift({
        path: "small",
        rows: [],
        corrections: ["- @stnjs `app/a.ts:3` typed the ref twice → `redundant-ref-annotation`"],
      }),
    );
    const result = run(repo);

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("docs/plans/2026-10-05-icon-swap/drift.md: ok\n");
  });

  it("fails when the branch has two drift files", () => {
    repo.write("docs/plans/2026-10-05-a/drift.md", makeDrift({ path: "small", rows: [] }));
    repo.write("docs/plans/2026-10-05-b/drift.md", makeDrift({ path: "small", rows: [] }));
    const result = run(repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/^More than one drift\.md on this branch/);
  });
});
