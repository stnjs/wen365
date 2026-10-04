import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findGateChanges } from "~~/scripts/agent-workflow/gate-changes.mjs";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/gate-changes.mjs", import.meta.url),
);
const TEST_FILE = "test/unit/wallet.test.ts";
const ASSERTIONS =
  'it("totals Wallets", () => {\n  expect(total).toBe(3);\n  expect(count).toBe(2);\n});\n';

let repo: GitRepo;
beforeEach(() => {
  repo = makeGitRepo();
});
afterEach(() => {
  repo.remove();
});

describe("findGateChanges", () => {
  it.each([
    ['it.skip("adds a Wallet", () => {});', "test-skip"],
    ['it.only("adds a Wallet", () => {});', "test-only"],
    ['it.todo("adds a Wallet");', "test-todo"],
    ["// eslint-disable-next-line no-console", "eslint-disable"],
    ["// @ts-ignore", "ts-ignore"],
    ["// @ts-expect-error wrong type on purpose", "ts-expect-error"],
    ["// @ts-nocheck", "ts-nocheck"],
    ["const wallet = response as any;", "as-any"],
  ])("reports an added `%s` as %s", (line, kind) => {
    repo.write(TEST_FILE, `${line}\n`);
    repo.commit("test: wallet");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      { file: TEST_FILE, line: 1, kind, text: line },
    ]);
  });

  it("reports suppressions in app code but not test-only patterns there", () => {
    repo.write(
      "app/utils/wallets.ts",
      "// eslint-disable-next-line no-console\nconst first = list.only(1);\n",
    );
    repo.commit("feat: wallets");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      {
        file: "app/utils/wallets.ts",
        line: 1,
        kind: "eslint-disable",
        text: "// eslint-disable-next-line no-console",
      },
    ]);
  });

  it("ignores the patterns in Markdown", () => {
    repo.write("docs/notes.md", "Never leave `it.skip(` or `// @ts-ignore` behind.\n");
    repo.commit("docs: notes");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([]);
  });

  it("reports a deleted test file", () => {
    repo.baseline({ [TEST_FILE]: ASSERTIONS });
    repo.git("rm", "--quiet", TEST_FILE);
    repo.commit("test: drop wallet test");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      { file: TEST_FILE, line: null, kind: "deleted-test-file", text: "deleted" },
    ]);
  });

  it("reports a test file renamed so it no longer matches the test pattern", () => {
    repo.baseline({ [TEST_FILE]: ASSERTIONS });
    repo.git("mv", TEST_FILE, "test/unit/wallet.ts");
    repo.commit("test: rename");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      {
        file: TEST_FILE,
        line: null,
        kind: "deleted-test-file",
        text: "renamed to test/unit/wallet.ts",
      },
    ]);
  });

  it("reports gate configuration renamed to a name the tools no longer read", () => {
    repo.baseline({ "vitest.config.ts": "export default {};\n" });
    repo.git("mv", "vitest.config.ts", "vitest.config.old");
    repo.commit("chore: rename config");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      {
        file: "vitest.config.ts",
        line: null,
        kind: "gate-config",
        text: "renamed to vitest.config.old",
      },
    ]);
  });

  it("does not report a test file that was only moved", () => {
    repo.baseline({ [TEST_FILE]: ASSERTIONS });
    repo.git("mv", TEST_FILE, "test/unit/wallets.test.ts");
    repo.commit("test: rename");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([]);
  });

  it("reports a removed assertion with its old line number", () => {
    repo.baseline({ [TEST_FILE]: ASSERTIONS });
    repo.write(TEST_FILE, ASSERTIONS.replace("  expect(count).toBe(2);\n", ""));
    repo.commit("test: fewer assertions");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      { file: TEST_FILE, line: 3, kind: "removed-assertion", text: "expect(count).toBe(2);" },
    ]);
  });

  it("does not report assertions that only moved within the file", () => {
    repo.baseline({ [TEST_FILE]: ASSERTIONS });
    repo.write(
      TEST_FILE,
      'it("totals Wallets", () => {\n  expect(count).toBe(2);\n  expect(total).toBe(3);\n});\n',
    );
    repo.commit("test: reorder");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([]);
  });

  it("keeps parsing after a removed line that starts with --", () => {
    repo.baseline({ [TEST_FILE]: "let count = 2;\n--count;\nexpect(count).toBe(1);\n" });
    repo.write(TEST_FILE, "let count = 2;\n");
    repo.commit("test: simplify");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      { file: TEST_FILE, line: 3, kind: "removed-assertion", text: "expect(count).toBe(1);" },
    ]);
  });

  it("reports changes to gate configuration", () => {
    repo.write(".github/workflows/ci.yml", "name: CI\n");
    repo.write("vitest.config.ts", "export default {};\n");
    repo.commit("ci: config");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      { file: ".github/workflows/ci.yml", line: null, kind: "gate-config", text: "added" },
      { file: "vitest.config.ts", line: null, kind: "gate-config", text: "added" },
    ]);
  });

  it("reports changed package scripts but not dependency changes", () => {
    repo.baseline({
      "package.json": JSON.stringify({ scripts: { test: "vitest" }, dependencies: { a: "1.0.0" } }),
    });
    repo.write(
      "package.json",
      JSON.stringify({
        scripts: { test: "vitest --passWithNoTests", lint: "eslint ." },
        dependencies: { a: "2.0.0" },
      }),
    );
    repo.commit("chore: scripts");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([
      {
        file: "package.json",
        line: null,
        kind: "package-script",
        text: "scripts.lint: (none) → eslint .",
      },
      {
        file: "package.json",
        line: null,
        kind: "package-script",
        text: "scripts.test: vitest → vitest --passWithNoTests",
      },
    ]);
  });

  it("reports nothing for an ordinary change", () => {
    repo.write("app/utils/wallets.ts", "export const count = 2;\n");
    repo.commit("feat: wallets");

    expect(findGateChanges({ cwd: repo.dir })).toEqual([]);
  });
});

describe("gate-changes CLI", () => {
  it("prints the changes as JSON and exits 0", () => {
    repo.write(TEST_FILE, "// @ts-nocheck\n");
    repo.commit("test: wallet");
    const result = spawnSync("node", [SCRIPT], { cwd: repo.dir, encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      { file: TEST_FILE, line: 1, kind: "ts-nocheck", text: "// @ts-nocheck" },
    ]);
  });
});
