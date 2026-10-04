import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildReviewContext } from "~~/scripts/agent-workflow/review-context.mjs";
import { makeContract } from "~~/test/factories/contract";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";
import { makeSelfCheck } from "~~/test/factories/selfCheck";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/review-context.mjs", import.meta.url),
);
const FOLDER = "docs/plans/2026-10-05-multiple-wallets";
const pattern = (status: string, promotedTo = "") =>
  `---\nslug: x\ntarget: lint\nstatus: ${status}\npromoted-to: ${promotedTo}\n---\n\nA pattern.\n`;

let repo: GitRepo;
beforeEach(() => {
  repo = makeGitRepo();
});
afterEach(() => {
  repo.remove();
});

describe("buildReviewContext", () => {
  it("lists the branch's commits newest first", () => {
    repo.write("app/a.ts", "export const a = 1;\n");
    repo.commit("feat: add a");
    repo.write("app/b.ts", "export const b = 2;\n");
    repo.commit("feat: add b");

    const subjects = buildReviewContext({ cwd: repo.dir }).commits.map(commit => commit.subject);

    expect(subjects).toEqual(["feat: add b", "feat: add a"]);
  });

  it("lists every file the branch changed", () => {
    repo.write("app/a.ts", "export const a = 1;\n");
    repo.commit("feat: add a");
    repo.write("app/b.ts", "export const b = 2;\n");
    repo.commit("feat: add b");

    expect(buildReviewContext({ cwd: repo.dir }).changedFiles).toEqual(["app/a.ts", "app/b.ts"]);
  });

  it("diffs from the point where the branch left main", () => {
    repo.write("app/a.ts", "export const a = 1;\n");
    repo.commit("feat: add a");
    const mainSha = repo.git("rev-parse", "main");

    expect(buildReviewContext({ cwd: repo.dir })).toMatchObject({
      mergeBase: mainSha,
      diffCommand: `git diff ${mainSha}..HEAD`,
    });
  });

  it("returns empty lists for a branch without commits", () => {
    expect(buildReviewContext({ cwd: repo.dir })).toMatchObject({ commits: [], changedFiles: [] });
  });

  it("includes the root AGENTS.md and those of touched directories only", () => {
    repo.baseline({
      "AGENTS.md": "# root\n",
      "app/AGENTS.md": "# app\n",
      "server/AGENTS.md": "# server\n",
    });
    repo.write("app/components/WalletList.vue", "<template><div /></template>\n");
    repo.commit("feat: wallet list");

    expect(buildReviewContext({ cwd: repo.dir }).agentsFiles).toEqual([
      "AGENTS.md",
      "app/AGENTS.md",
    ]);
  });

  it("lists ADRs without the template", () => {
    repo.baseline({
      "docs/adr/0000-template.md": "# template\n",
      "docs/adr/0001-client-side-rendering-only.md": "# 1\n",
      "docs/adr/0002-tanstack-query-for-remote-state.md": "# 2\n",
    });

    expect(buildReviewContext({ cwd: repo.dir }).adrs).toEqual([
      "docs/adr/0001-client-side-rendering-only.md",
      "docs/adr/0002-tanstack-query-for-remote-state.md",
    ]);
  });

  it("includes watching and prose-promoted patterns, and skips lint-promoted and rejected ones", () => {
    repo.baseline({
      "docs/patterns/a-watching.md": pattern("watching"),
      "docs/patterns/b-prose.md": pattern("promoted", "app/AGENTS.md"),
      "docs/patterns/c-lint.md": pattern("promoted", "eslint.config.mjs"),
      "docs/patterns/d-rejected.md": pattern("rejected"),
    });

    expect(buildReviewContext({ cwd: repo.dir }).patterns).toEqual([
      "docs/patterns/a-watching.md",
      "docs/patterns/b-prose.md",
    ]);
  });

  it("points at the contract and reports no self-check before one is written", () => {
    repo.write(`${FOLDER}/contract.md`, makeContract());

    expect(buildReviewContext({ cwd: repo.dir })).toMatchObject({
      contract: `${FOLDER}/contract.md`,
      selfCheck: null,
    });
  });

  it("points at the self-check once the plan folder has one", () => {
    repo.write(`${FOLDER}/contract.md`, makeContract());
    repo.write(`${FOLDER}/self-check.md`, makeSelfCheck());

    expect(buildReviewContext({ cwd: repo.dir }).selfCheck).toBe(`${FOLDER}/self-check.md`);
  });

  it("returns no contract for a branch without a plan", () => {
    expect(buildReviewContext({ cwd: repo.dir })).toMatchObject({
      contract: null,
      selfCheck: null,
    });
  });
});

describe("review-context CLI", () => {
  it("prints the context as JSON and exits 0", () => {
    repo.write("app/a.ts", "export const a = 1;\n");
    repo.commit("feat: add a");
    const result = spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ base: "main", changedFiles: ["app/a.ts"] });
  });
});
