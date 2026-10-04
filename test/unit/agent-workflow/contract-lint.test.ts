import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lintContract } from "~~/scripts/agent-workflow/contract-lint.mjs";
import { makeContract, makeCriterion } from "~~/test/factories/contract";

const LINT_SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/contract-lint.mjs", import.meta.url),
);

const criteria = (count: number) => Array.from({ length: count }, (_, i) => makeCriterion(i + 1));

describe("lintContract", () => {
  it("accepts a well-formed draft contract", () => {
    expect(lintContract(makeContract())).toEqual([]);
  });

  it("accepts an approved contract with an approval date", () => {
    expect(lintContract(makeContract({ status: "approved", approved: "2026-10-05" }))).toEqual([]);
  });

  it("reports an approved contract without an approval date", () => {
    const problems = lintContract(makeContract({ status: "approved" }));

    expect(problems).toEqual([expect.stringContaining("`approved` must be a YYYY-MM-DD date")]);
  });

  it("reports a criterion without a Verify line", () => {
    const problems = lintContract(
      makeContract({
        criteria: [makeCriterion(1), "- **AC-2:** Shows both Wallets", makeCriterion(3)],
      }),
    );

    expect(problems).toEqual(["AC-2 has no `Verify:` line."]);
  });

  it("reports a Verify kind outside the allowed list", () => {
    const problems = lintContract(
      makeContract({
        criteria: [makeCriterion(1, "Looks right", "vibes — eyeball it"), ...criteria(3).slice(1)],
      }),
    );

    expect(problems).toEqual([expect.stringContaining("AC-1 Verify kind must be one of")]);
  });

  it("reports criteria that are not numbered in order", () => {
    const problems = lintContract(
      makeContract({ criteria: [makeCriterion(1), makeCriterion(3), makeCriterion(4)] }),
    );

    expect(problems).toContain(
      "Criteria must be numbered AC-1, AC-2, … in order; position 2 is AC-3.",
    );
  });

  it("reports too few and too many criteria", () => {
    expect(lintContract(makeContract({ criteria: criteria(2) }))).toEqual([
      expect.stringContaining("Expected 3–8 acceptance criteria; found 2."),
    ]);
    expect(lintContract(makeContract({ criteria: criteria(9) }))).toEqual([
      expect.stringContaining("Expected 3–8 acceptance criteria; found 9."),
    ]);
  });

  it("requires a fix contract to start with a regression test", () => {
    expect(lintContract(makeContract({ type: "fix" }))).toEqual([
      expect.stringContaining("`fix` contract's AC-1 must be a regression test"),
    ]);

    const regression = makeCriterion(
      1,
      "A regression test reproduces the stale Portfolio total: it fails before the fix and passes after",
    );
    expect(
      lintContract(makeContract({ type: "fix", criteria: [regression, ...criteria(3).slice(1)] })),
    ).toEqual([]);
  });

  it("requires a refactor contract to start with unchanged existing tests", () => {
    expect(lintContract(makeContract({ type: "refactor" }))).toEqual([
      expect.stringContaining("`refactor` contract's AC-1"),
    ]);

    const unchanged = makeCriterion(
      1,
      "Existing tests pass without modification",
      "command — `pnpm test`",
    );
    expect(
      lintContract(
        makeContract({ type: "refactor", criteria: [unchanged, ...criteria(3).slice(1)] }),
      ),
    ).toEqual([]);
  });

  it("reports a missing required section", () => {
    const problems = lintContract(makeContract().replace("## Out of scope", "## Notes"));

    expect(problems).toEqual(["Missing section `## Out of scope`."]);
  });

  it("reports a missing frontmatter block as the only problem", () => {
    const withoutFrontmatter = makeContract().replace(/^---[\s\S]*?\n---\n/, "");

    expect(lintContract(withoutFrontmatter)).toEqual([
      "Missing frontmatter: the file must start with a `---` block.",
    ]);
  });
});

describe("contract-lint CLI", () => {
  const runOn = (content: string) => {
    const dir = mkdtempSync(join(tmpdir(), "wen-contract-lint-"));
    const path = join(dir, "contract.md");
    writeFileSync(path, content);
    const result = spawnSync("node", [LINT_SCRIPT, path], { encoding: "utf8" });
    rmSync(dir, { recursive: true, force: true });
    return { ...result, path };
  };

  it("prints ok and exits 0 for a valid contract", () => {
    const result = runOn(makeContract());

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(`${result.path}: ok\n`);
  });

  it("reports an unreadable path without a stack trace", () => {
    const result = spawnSync("node", [LINT_SCRIPT, "does-not-exist.md"], { encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("does-not-exist.md: cannot read (ENOENT)\n");
  });

  it("lists every problem on stderr and exits 1", () => {
    const result = runOn(makeContract({ criteria: criteria(2), status: "approved" }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("- Frontmatter `approved` must be a YYYY-MM-DD date");
    expect(result.stderr).toContain("- Expected 3–8 acceptance criteria; found 2.");
  });
});
