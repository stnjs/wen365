import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findPlan } from "~~/scripts/agent-workflow/plan.mjs";
import { makeContract } from "~~/test/factories/contract";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";

const PLAN_SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/plan.mjs", import.meta.url),
);
const CONTRACT = "docs/plans/2026-10-05-multiple-wallets/contract.md";

let repo: GitRepo;
beforeEach(() => {
  repo = makeGitRepo();
});
afterEach(() => {
  repo.remove();
});

describe("findPlan", () => {
  it("finds the contract committed on the branch", () => {
    repo.write(CONTRACT, makeContract({ status: "approved", approved: "2026-10-05" }));
    repo.commit("docs(plan): Multiple Wallets per Session");

    expect(findPlan({ cwd: repo.dir })).toEqual({
      folder: "docs/plans/2026-10-05-multiple-wallets",
      contractPath: CONTRACT,
      committed: true,
      title: "Multiple Wallets per Session",
      type: "feat",
      status: "approved",
      approved: "2026-10-05",
      criteria: ["AC-1", "AC-2", "AC-3"],
      hasAmendments: false,
    });
  });

  it("finds a draft contract that is not committed yet", () => {
    repo.write(CONTRACT, makeContract());

    expect(findPlan({ cwd: repo.dir })).toMatchObject({
      contractPath: CONTRACT,
      committed: false,
      status: "draft",
    });
  });

  it("ignores contracts that were already on main", () => {
    repo.git("checkout", "--quiet", "main");
    repo.write("docs/plans/2026-09-01-old-work/contract.md", makeContract({ title: "Old work" }));
    repo.commit("docs(plan): Old work");
    repo.git("checkout", "--quiet", "-b", "feat/second");
    repo.write(CONTRACT, makeContract());

    expect(findPlan({ cwd: repo.dir }).contractPath).toBe(CONTRACT);
  });

  it("ignores the template folder", () => {
    repo.write("docs/plans/_template/contract.md", makeContract({ title: "Template" }));
    repo.write(CONTRACT, makeContract());

    expect(findPlan({ cwd: repo.dir }).contractPath).toBe(CONTRACT);
  });

  it("still finds the contract after the branch is renamed", () => {
    repo.write(CONTRACT, makeContract());
    repo.commit("docs(plan): Multiple Wallets per Session");
    repo.git("branch", "-m", "feat/renamed");

    expect(findPlan({ cwd: repo.dir }).contractPath).toBe(CONTRACT);
  });

  it("finds the contract when run from a subdirectory", () => {
    repo.write(CONTRACT, makeContract());
    repo.write("app/README.md", "nested\n");

    expect(findPlan({ cwd: join(repo.dir, "app") }).contractPath).toBe(CONTRACT);
  });

  it("fails with guidance when the branch has no contract", () => {
    expect(() => findPlan({ cwd: repo.dir })).toThrow(/No contract on this branch.*\/wen-contract/);
  });

  it("fails when the branch carries two contracts", () => {
    repo.write(CONTRACT, makeContract());
    repo.write("docs/plans/2026-10-05-other/contract.md", makeContract());

    expect(() => findPlan({ cwd: repo.dir })).toThrow(/More than one contract on this branch/);
  });

  it("fails clearly when an explicit base ref does not exist", () => {
    expect(() => findPlan({ cwd: repo.dir, base: "origin/nope" })).toThrow(/Base ref not found/);
  });

  it("finds a contract marked intent-to-add", () => {
    repo.write(CONTRACT, makeContract());
    repo.git("add", "--intent-to-add", CONTRACT);

    expect(findPlan({ cwd: repo.dir })).toMatchObject({ contractPath: CONTRACT, committed: false });
  });

  it("finds a committed contract in a folder with a non-ASCII name", () => {
    const umlaut = "docs/plans/2026-10-05-münze/contract.md";
    repo.write(umlaut, makeContract());
    repo.commit("docs(plan): Münze");

    expect(findPlan({ cwd: repo.dir }).contractPath).toBe(umlaut);
  });

  it("fails clearly outside a git repository", () => {
    const outside = mkdtempSync(join(tmpdir(), "wen-not-a-repo-"));
    try {
      expect(() => findPlan({ cwd: outside })).toThrow(/^Not inside a git repository: /);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("plan CLI", () => {
  it("prints the plan as JSON and exits 0", () => {
    repo.write(CONTRACT, makeContract());
    const result = spawnSync("node", [PLAN_SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ contractPath: CONTRACT, status: "draft" });
  });

  it("prints the reason on stderr and exits 1", () => {
    const result = spawnSync("node", [PLAN_SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/No contract on this branch/);
  });

  it("rejects --base without a value", () => {
    repo.write(CONTRACT, makeContract());
    const result = spawnSync("node", [PLAN_SCRIPT, "--base"], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("--base needs a value.\n");
  });
});
