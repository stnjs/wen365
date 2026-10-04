# Agent workflow PR 1: contracts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first usable slice of the agent workflow: write, lint and cold-review contracts, with the shared docs, the first pattern, and the root `AGENTS.md` changes.

**Architecture:** Plain Node ESM scripts (`.mjs`, `// @ts-check` + JSDoc, Node built-ins only) under `scripts/agent-workflow/` do every mechanical step and print results for skills to read. Skills are plain Markdown in `.agents/skills/wen-*/SKILL.md`, symlinked into `.claude/skills/` so Claude Code finds them. Docs in `docs/agent-workflow.md` are the single source the skills link to.

**Tech Stack:** Node ≥20.19 (ESM, `node:` built-ins), git, Vitest (`unit` project), Prettier, ESLint (Nuxt flat config).

**Spec:** `docs/plans/2026-10-04-agent-workflow/design.md` (sections 1, 3, 4, 5.1–5.4, 8, 9 row "PR 1")

## Global Constraints

- Work on the current branch `chore-agent-harness-setup`; PR title `chore(harness): agent workflow contracts (1/5)`.
- Scripts: `.mjs`, first line `// @ts-check`, JSDoc types, **no new dependencies**, only `node:` built-ins. Import `process` explicitly (`import process from "node:process"`) so ESLint's `no-undef` never fires on `.mjs`.
- Script output: results on stdout (JSON for data, one line for ok), reasons on stderr, exit code 1 on failure. Never `console.*`.
- Every script exports its logic as a function (tested directly) and runs a CLI only when executed as the entry file.
- Repo skills are prefixed `wen-`, live in `.agents/skills/<name>/SKILL.md`, and are symlinked as `.claude/skills/<name> -> ../../.agents/skills/<name>`.
- Contract format exactly as in spec section 5.1, with **no** `branch:` field. Verify kinds: `test`, `command`, `screenshot`, `manual`. 3–8 criteria.
- Tests: `test/unit/agent-workflow/*.test.ts`, behaviour-named (`it("reports …")`, no "should"), real git in temp repos (git is the process boundary), no mocks of our own code. Factories in `test/factories/`.
- Commit messages: Conventional Commits, scope `harness`.
- Before claiming done: `pnpm format`, `pnpm lint`, `pnpm type-check`, `pnpm test:unit`.

## Review Focus

1. Contract files saved with Windows line endings (CRLF) parse exactly like LF files. → Task 1 test.
2. `Verify: Test — …` (capitalised kind) is accepted as `test`, not reported as an unknown kind. → Task 1 test.
3. `plan.mjs` on a branch that also has a contract inherited from `main` (an older, merged plan) returns only the branch's own contract. → Task 3 test.
4. `plan.mjs` run from a subdirectory of the repo finds the contract (git prints repo-root-relative paths for `diff` but cwd-relative paths for `status`). → Task 3 test.
5. `plan.mjs` in a clone without `origin/main` falls back to `main` instead of crashing; an explicit bad `--base` fails with a clear reason. → Task 3 tests (fixtures have no remote).

---

## File structure

| File                                             | Responsibility                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `scripts/agent-workflow/lib/frontmatter.mjs`     | Parse the leading `---` block of a Markdown file                          |
| `scripts/agent-workflow/lib/contract.mjs`        | Parse a contract: sections, criteria, Verify lines, amendments; constants |
| `scripts/agent-workflow/lib/git.mjs`             | Run git, split output, resolve the base ref                               |
| `scripts/agent-workflow/lib/cli.mjs`             | Entry-file detection, JSON printing, flag reading                         |
| `scripts/agent-workflow/contract-lint.mjs`       | Structural contract check (`lintContract`) + CLI                          |
| `scripts/agent-workflow/plan.mjs`                | Find the current branch's contract (`findPlan`) + CLI                     |
| `test/factories/contract.ts`                     | `makeContract`, `makeCriterion` text builders                             |
| `test/factories/gitRepo.ts`                      | `makeGitRepo`: throwaway repo on a feature branch                         |
| `test/unit/agent-workflow/frontmatter.test.ts`   | Frontmatter parsing                                                       |
| `test/unit/agent-workflow/contract.test.ts`      | Contract parsing                                                          |
| `test/unit/agent-workflow/contract-lint.test.ts` | Lint rules + CLI                                                          |
| `test/unit/agent-workflow/plan.test.ts`          | Contract lookup + CLI                                                     |
| `docs/agent-workflow.md`                         | Workflow, vocabulary, contract rules, patterns, what exists so far        |
| `docs/plans/_template/contract.md`               | Contract template                                                         |
| `docs/patterns/redundant-ref-annotation.md`      | First pattern                                                             |
| `.agents/skills/wen-contract/SKILL.md`           | Write → lint → review → present → commit on approval                      |
| `.agents/skills/wen-contract-review/SKILL.md`    | Cold review by a fresh subagent on a different model                      |
| `.agents/skills/wen-grilling/SKILL.md`           | Copy of the personal `grilling` skill, renamed, attributed                |
| `.agents/skills/LICENSE-mattpocock-skills.txt`   | Upstream MIT licence for copied skills                                    |
| `.claude/skills/wen-*`                           | Symlinks to the three skills                                              |
| `AGENTS.md`                                      | Workflow section, table row, commit rule change                           |

---

### Task 1: Shared parsing library

**Files:**

- Create: `scripts/agent-workflow/lib/frontmatter.mjs`, `scripts/agent-workflow/lib/contract.mjs`
- Create: `test/factories/contract.ts`
- Test: `test/unit/agent-workflow/frontmatter.test.ts`, `test/unit/agent-workflow/contract.test.ts`

**Interfaces:**

- Produces:
  - `parseFrontmatter(text: string): { data: Record<string, string>, body: string } | null`
  - `parseContract(text: string): Contract` where `Contract = { frontmatter: Record<string,string> | null, sections: Map<string,string>, criteria: Criterion[], hasAmendments: boolean }`, `Criterion = { id: string, number: number, text: string, verify: { kind: string, detail: string } | null }`
  - `splitSections(body: string): Map<string, string>`, `parseCriteria(section: string): Criterion[]`
  - constants `CONTRACT_TYPES`, `CONTRACT_STATUSES`, `VERIFY_KINDS`, `REQUIRED_SECTIONS`
  - factories `makeCriterion(n, text?, verify?)`, `makeContract(overrides?: Partial<ContractParts>)`

- [ ] **Step 1: Write the contract factory**

`test/factories/contract.ts`:

```ts
export interface ContractParts {
  title: string;
  type: string;
  status: string;
  approved: string;
  goal: string;
  criteria: string[];
  outOfScope: string;
  amendments: string;
}

/** One criterion block: the AC bullet plus its nested Verify line. */
export const makeCriterion = (
  n: number,
  text = `A signed-in user sees outcome ${n} in the Portfolio`,
  verify = "test — `test/unit/example.test.ts`",
): string => `- **AC-${n}:** ${text}\n  - Verify: ${verify}`;

/** A well-formed draft contract; each test varies one part. */
export const makeContract = (overrides: Partial<ContractParts> = {}): string => {
  const parts: ContractParts = {
    title: "Multiple Wallets per Session",
    type: "feat",
    status: "draft",
    approved: "",
    goal: "A signed-in user can track more than one Wallet in one Portfolio.",
    criteria: [1, 2, 3].map(n => makeCriterion(n)),
    outOfScope: "- Removing Wallets.",
    amendments: "<!-- After approval only. -->",
    ...overrides,
  };
  return [
    "---",
    `title: ${parts.title}`,
    `type: ${parts.type}`,
    `status: ${parts.status}`,
    `approved: ${parts.approved}`,
    "---",
    "",
    "## Goal",
    "",
    parts.goal,
    "",
    "## Acceptance criteria",
    "",
    parts.criteria.join("\n"),
    "",
    "## Out of scope",
    "",
    parts.outOfScope,
    "",
    "## Amendments",
    "",
    parts.amendments,
    "",
  ].join("\n");
};
```

- [ ] **Step 2: Write the failing frontmatter tests**

`test/unit/agent-workflow/frontmatter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "~~/scripts/agent-workflow/lib/frontmatter.mjs";

describe("parseFrontmatter", () => {
  it("reads flat key/value pairs and returns the body after the block", () => {
    const parsed = parseFrontmatter("---\ntitle: Multiple Wallets\ntype: feat\n---\n\n## Goal\n");

    expect(parsed).toEqual({
      data: { title: "Multiple Wallets", type: "feat" },
      body: "\n## Goal\n",
    });
  });

  it("drops trailing comments from unquoted values but keeps # inside quotes", () => {
    const parsed = parseFrontmatter(
      '---\nstatus: draft # draft | approved\napproved: # YYYY-MM-DD\nissue: "#5" # optional\n---\n',
    );

    expect(parsed?.data).toEqual({ status: "draft", approved: "", issue: "#5" });
  });

  it("returns null when the file has no frontmatter block", () => {
    expect(parseFrontmatter("## Goal\n")).toBeNull();
    expect(parseFrontmatter("---\ntitle: never closed\n")).toBeNull();
  });

  it("parses files with Windows line endings like LF files", () => {
    const parsed = parseFrontmatter("---\r\ntitle: Wallets\r\n---\r\nbody\r\n");

    expect(parsed).toEqual({ data: { title: "Wallets" }, body: "body\n" });
  });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/frontmatter.test.ts`
Expected: FAIL — cannot resolve `~~/scripts/agent-workflow/lib/frontmatter.mjs`.

- [ ] **Step 4: Implement `lib/frontmatter.mjs`**

```js
// @ts-check

/**
 * Reads the leading `---` block of a Markdown file. Supports flat `key: value`
 * lines only; every value is a string. Unquoted values drop a trailing
 * ` # comment`; quoted values are returned without their quotes. Empty values
 * become "". Line endings are normalised to "\n" in the returned body.
 *
 * @param {string} text
 * @returns {{ data: Record<string, string>, body: string } | null} null when there is no block
 */
export function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  /** @type {Record<string, string>} */
  const data = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (match?.[1] === undefined) continue;
    data[match[1]] = parseValue(match[2] ?? "");
  }
  return { data, body: lines.slice(end + 1).join("\n") };
}

/** @param {string} raw */
function parseValue(raw) {
  const value = raw.trim();
  const quote = value[0];
  if (quote === '"' || quote === "'") {
    const close = value.indexOf(quote, 1);
    if (close !== -1) return value.slice(1, close);
  }
  return value.replace(/(^|\s)#.*$/, "").trim();
}
```

- [ ] **Step 5: Run frontmatter tests**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/frontmatter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write the failing contract parsing tests**

`test/unit/agent-workflow/contract.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseContract } from "~~/scripts/agent-workflow/lib/contract.mjs";
import { makeContract, makeCriterion } from "~~/test/factories/contract";

describe("parseContract", () => {
  it("extracts each criterion with its verification kind and detail", () => {
    const contract = parseContract(makeContract());

    expect(contract.criteria.map(c => c.id)).toEqual(["AC-1", "AC-2", "AC-3"]);
    expect(contract.criteria[0]).toEqual({
      id: "AC-1",
      number: 1,
      text: "A signed-in user sees outcome 1 in the Portfolio",
      verify: { kind: "test", detail: "`test/unit/example.test.ts`" },
    });
  });

  it("leaves verify empty for a criterion without a Verify line", () => {
    const contract = parseContract(
      makeContract({ criteria: [makeCriterion(1), "- **AC-2:** No evidence named"] }),
    );

    expect(contract.criteria[1]?.verify).toBeNull();
  });

  it("accepts a capitalised Verify kind", () => {
    const contract = parseContract(
      makeContract({ criteria: [makeCriterion(1, "Shows the Wallet", "Test — wallet.test.ts")] }),
    );

    expect(contract.criteria[0]?.verify?.kind).toBe("test");
  });

  it("accepts a Verify label written in bold", () => {
    const contract = parseContract(
      makeContract({
        criteria: ["- **AC-1:** Shows the Wallet\n  - **Verify:** test — wallet.test.ts"],
      }),
    );

    expect(contract.criteria[0]?.verify).toEqual({ kind: "test", detail: "wallet.test.ts" });
  });

  it("treats an Amendments section holding only a comment as no amendments", () => {
    expect(parseContract(makeContract()).hasAmendments).toBe(false);
    expect(
      parseContract(makeContract({ amendments: "- 2026-10-06 — AC-2: dropped CSV — out of time" }))
        .hasAmendments,
    ).toBe(true);
  });

  it("parses a contract saved with Windows line endings", () => {
    const contract = parseContract(makeContract().replace(/\n/g, "\r\n"));

    expect(contract.frontmatter?.type).toBe("feat");
    expect(contract.criteria).toHaveLength(3);
    expect(contract.criteria[2]?.verify?.kind).toBe("test");
  });
});
```

- [ ] **Step 7: Run to verify they fail**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/contract.test.ts`
Expected: FAIL — cannot resolve `~~/scripts/agent-workflow/lib/contract.mjs`.

- [ ] **Step 8: Implement `lib/contract.mjs`**

```js
// @ts-check
import { parseFrontmatter } from "./frontmatter.mjs";

export const CONTRACT_TYPES = ["feat", "fix", "refactor"];
export const CONTRACT_STATUSES = ["draft", "approved"];
export const VERIFY_KINDS = ["test", "command", "screenshot", "manual"];
export const REQUIRED_SECTIONS = ["Goal", "Acceptance criteria", "Out of scope", "Amendments"];

/**
 * @typedef {{ kind: string, detail: string }} Verify
 * @typedef {{ id: string, number: number, text: string, verify: Verify | null }} Criterion
 * @typedef {{
 *   frontmatter: Record<string, string> | null,
 *   sections: Map<string, string>,
 *   criteria: Criterion[],
 *   hasAmendments: boolean,
 * }} Contract
 */

/**
 * @param {string} text contents of a contract.md
 * @returns {Contract}
 */
export function parseContract(text) {
  const parsed = parseFrontmatter(text);
  const body = parsed ? parsed.body : text.replace(/\r\n/g, "\n");
  const sections = splitSections(body);
  return {
    frontmatter: parsed ? parsed.data : null,
    sections,
    criteria: parseCriteria(sections.get("Acceptance criteria") ?? ""),
    hasAmendments: stripComments(sections.get("Amendments") ?? "") !== "",
  };
}

/**
 * Splits Markdown into `## Heading` → trimmed content. Text before the first
 * heading is dropped.
 *
 * @param {string} body
 * @returns {Map<string, string>}
 */
export function splitSections(body) {
  /** @type {Map<string, string>} */
  const sections = new Map();
  /** @type {string | null} */
  let heading = null;
  /** @type {string[]} */
  let buffer = [];
  const flush = () => {
    if (heading !== null) sections.set(heading, buffer.join("\n").trim());
  };
  for (const line of body.split("\n")) {
    const match = /^## (.+?)\s*$/.exec(line);
    if (match?.[1] !== undefined) {
      flush();
      heading = match[1];
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

/**
 * Criteria are top-level `- **AC-n:** text` bullets. The first nested
 * `- Verify: <kind> — <detail>` line under a criterion is its verification
 * (`**Verify:**` in bold is accepted too).
 *
 * @param {string} section
 * @returns {Criterion[]}
 */
export function parseCriteria(section) {
  /** @type {Criterion[]} */
  const criteria = [];
  for (const line of section.split("\n")) {
    const criterion = /^- \*\*AC-(\d+):\*\*(.*)$/.exec(line);
    if (criterion) {
      const number = Number(criterion[1]);
      criteria.push({
        id: `AC-${number}`,
        number,
        text: (criterion[2] ?? "").trim(),
        verify: null,
      });
      continue;
    }
    const verify = /^\s+- (?:\*\*)?Verify:(?:\*\*)?\s*([A-Za-z]+)\s*[—–-]?\s*(.*)$/.exec(line);
    const current = criteria.at(-1);
    if (verify && current && current.verify === null) {
      current.verify = { kind: (verify[1] ?? "").toLowerCase(), detail: (verify[2] ?? "").trim() };
    }
  }
  return criteria;
}

/** @param {string} text */
function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "").trim();
}
```

- [ ] **Step 9: Run both test files**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/`
Expected: PASS (10 tests).

- [ ] **Step 10: Type-check and commit**

Run: `pnpm type-check`
Expected: exit 0. If TypeScript cannot infer types for the `.mjs` imports, fix the JSDoc in the `.mjs` file; do not add `// @ts-expect-error` in the tests.

```bash
pnpm exec prettier --write scripts/agent-workflow test/factories test/unit/agent-workflow
git add scripts/agent-workflow/lib test/factories/contract.ts test/unit/agent-workflow
git commit -m "chore(harness): parse contract frontmatter, sections and criteria"
```

---

### Task 2: `contract-lint.mjs`

**Files:**

- Create: `scripts/agent-workflow/lib/cli.mjs`, `scripts/agent-workflow/contract-lint.mjs`
- Test: `test/unit/agent-workflow/contract-lint.test.ts`

**Interfaces:**

- Consumes: `parseContract`, `CONTRACT_TYPES`, `CONTRACT_STATUSES`, `VERIFY_KINDS`, `REQUIRED_SECTIONS` (Task 1); `makeContract`, `makeCriterion` (Task 1)
- Produces:
  - `lintContract(text: string): string[]` — empty when well-formed
  - CLI `node scripts/agent-workflow/contract-lint.mjs <path>` — stdout `<path>: ok`, exit 0; or stderr `<path>:` + `- <problem>` lines, exit 1
  - `lib/cli.mjs`: `isMain(moduleUrl: string): boolean`, `printJson(value: unknown): void`, `readFlag(args: string[], name: string): string | undefined`

- [ ] **Step 1: Write the failing lint tests**

`test/unit/agent-workflow/contract-lint.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/contract-lint.test.ts`
Expected: FAIL — cannot resolve `contract-lint.mjs`.

- [ ] **Step 3: Implement `lib/cli.mjs`**

```js
// @ts-check
import { realpathSync } from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * True when the module is the file node was started with, so a script can be
 * both imported by tests and run from the command line.
 *
 * @param {string} moduleUrl pass `import.meta.url`
 */
export function isMain(moduleUrl) {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return moduleUrl === pathToFileURL(realpathSync(entry)).href;
}

/** @param {unknown} value */
export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Value following `--<name>` in `args`, or undefined.
 *
 * @param {string[]} args
 * @param {string} name
 */
export function readFlag(args, name) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
}
```

- [ ] **Step 4: Implement `contract-lint.mjs`**

```js
// @ts-check
import { readFileSync } from "node:fs";
import process from "node:process";
import { isMain } from "./lib/cli.mjs";
import {
  CONTRACT_STATUSES,
  CONTRACT_TYPES,
  REQUIRED_SECTIONS,
  VERIFY_KINDS,
  parseContract,
} from "./lib/contract.mjs";

export const MIN_CRITERIA = 3;
export const MAX_CRITERIA = 8;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Structural problems in a contract; empty when it is well-formed. Judgement
 * (is a criterion clear, complete, feasible) belongs to /wen-contract-review.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function lintContract(text) {
  const contract = parseContract(text);
  const fm = contract.frontmatter;
  if (fm === null) return ["Missing frontmatter: the file must start with a `---` block."];

  /** @type {string[]} */
  const problems = [];
  if (!fm.title) problems.push("Frontmatter `title` is empty.");
  if (!CONTRACT_TYPES.includes(fm.type ?? "")) {
    problems.push(
      `Frontmatter \`type\` must be one of ${CONTRACT_TYPES.join(", ")}; got "${fm.type ?? ""}".`,
    );
  }
  if (!CONTRACT_STATUSES.includes(fm.status ?? "")) {
    problems.push(
      `Frontmatter \`status\` must be one of ${CONTRACT_STATUSES.join(", ")}; got "${fm.status ?? ""}".`,
    );
  }
  if (fm.status === "approved" && !DATE.test(fm.approved ?? "")) {
    problems.push("Frontmatter `approved` must be a YYYY-MM-DD date when `status` is approved.");
  }

  for (const name of REQUIRED_SECTIONS) {
    if (!contract.sections.has(name)) problems.push(`Missing section \`## ${name}\`.`);
  }
  if (contract.sections.get("Goal") === "") problems.push("`## Goal` is empty.");

  const { criteria } = contract;
  if (criteria.length < MIN_CRITERIA || criteria.length > MAX_CRITERIA) {
    problems.push(
      `Expected ${MIN_CRITERIA}–${MAX_CRITERIA} acceptance criteria; found ${criteria.length}. More than ${MAX_CRITERIA} means the work should be split.`,
    );
  }
  criteria.forEach((criterion, index) => {
    if (criterion.number !== index + 1) {
      problems.push(
        `Criteria must be numbered AC-1, AC-2, … in order; position ${index + 1} is ${criterion.id}.`,
      );
    }
    if (criterion.text === "") problems.push(`${criterion.id} has no text.`);
    if (criterion.verify === null) {
      problems.push(`${criterion.id} has no \`Verify:\` line.`);
    } else if (!VERIFY_KINDS.includes(criterion.verify.kind)) {
      problems.push(
        `${criterion.id} Verify kind must be one of ${VERIFY_KINDS.join(", ")}; got "${criterion.verify.kind}".`,
      );
    } else if (criterion.verify.detail === "") {
      problems.push(
        `${criterion.id} Verify line names the kind (${criterion.verify.kind}) but not what to check.`,
      );
    }
  });

  const firstText = criteria[0]?.text ?? "";
  if (fm.type === "fix" && !/regression test/i.test(firstText)) {
    problems.push(
      "A `fix` contract's AC-1 must be a regression test that fails before the fix and passes after.",
    );
  }
  if (fm.type === "refactor" && !/existing tests pass without (being )?modifi/i.test(firstText)) {
    problems.push(
      'A `refactor` contract\'s AC-1 must be "Existing tests pass without modification".',
    );
  }
  return problems;
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const path = args[0];
  if (path === undefined) {
    process.stderr.write(
      "Usage: node scripts/agent-workflow/contract-lint.mjs <path/to/contract.md>\n",
    );
    return 1;
  }
  /** @type {string} */
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "unknown error";
    process.stderr.write(`${path}: cannot read (${code})\n`);
    return 1;
  }
  const problems = lintContract(text);
  if (problems.length > 0) {
    process.stderr.write(`${path}:\n${problems.map(problem => `- ${problem}`).join("\n")}\n`);
    return 1;
  }
  process.stdout.write(`${path}: ok\n`);
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
```

- [ ] **Step 5: Run lint tests**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/contract-lint.test.ts`
Expected: PASS (14 tests). If "reports a criterion without a Verify line" also reports a count problem, the factory's default criteria count changed — fix the test input, not the rule.

- [ ] **Step 6: Commit**

```bash
pnpm exec prettier --write scripts/agent-workflow test/unit/agent-workflow
git add scripts/agent-workflow test/unit/agent-workflow/contract-lint.test.ts
git commit -m "chore(harness): add contract-lint script"
```

---

### Task 3: `plan.mjs`

**Files:**

- Create: `scripts/agent-workflow/lib/git.mjs`, `scripts/agent-workflow/plan.mjs`, `test/factories/gitRepo.ts`
- Test: `test/unit/agent-workflow/plan.test.ts`

**Interfaces:**

- Consumes: `parseContract` (Task 1), `isMain`, `printJson`, `readFlag` (Task 2), `makeContract` (Task 1)
- Produces:
  - `git(args: string[], cwd: string): string`, `lines(output: string): string[]`, `resolveBase(cwd: string, preferred?: string): string`
  - `findPlan(options?: { cwd?: string, base?: string }): Plan` where `Plan = { folder: string, contractPath: string, committed: boolean, title: string, type: string, status: string, approved: string, criteria: string[], hasAmendments: boolean }`; throws `Error` with a human-readable message
  - CLI `node scripts/agent-workflow/plan.mjs [--base <ref>]` — Plan JSON on stdout, exit 0; message on stderr, exit 1
  - factory `makeGitRepo(branch?: string): GitRepo` with `{ dir, git(...args), write(path, content), commit(message), remove() }`

- [ ] **Step 1: Write the git repo factory**

`test/factories/gitRepo.ts`:

```ts
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export interface GitRepo {
  dir: string;
  git: (...args: string[]) => string;
  write: (path: string, content: string) => void;
  commit: (message: string) => void;
  remove: () => void;
}

// Identity via env and hooks/signing via -c, so the fixture never touches any git config file.
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.invalid",
  GIT_COMMITTER_NAME: "Fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.invalid",
};

/** A throwaway repo with one commit on `main`, checked out on a feature branch. No remote. */
export const makeGitRepo = (branch = "feat/example"): GitRepo => {
  const dir = mkdtempSync(join(tmpdir(), "wen-agent-workflow-"));
  const git = (...args: string[]) =>
    execFileSync("git", ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", ...args], {
      cwd: dir,
      env: GIT_ENV,
      encoding: "utf8",
    }).trimEnd();
  const write = (path: string, content: string) => {
    const full = join(dir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  const commit = (message: string) => {
    git("add", "--all");
    git("commit", "--quiet", "-m", message);
  };

  git("init", "--quiet", "--initial-branch=main");
  write("README.md", "# fixture\n");
  commit("chore: init");
  git("checkout", "--quiet", "-b", branch);

  return { dir, git, write, commit, remove: () => rmSync(dir, { recursive: true, force: true }) };
};
```

- [ ] **Step 2: Write the failing plan tests**

`test/unit/agent-workflow/plan.test.ts`:

```ts
import { spawnSync } from "node:child_process";
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
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/plan.test.ts`
Expected: FAIL — cannot resolve `plan.mjs`.

- [ ] **Step 4: Implement `lib/git.mjs`**

```js
// @ts-check
import { execFileSync } from "node:child_process";

/**
 * Runs git and returns stdout without the trailing newline. Throws on a
 * non-zero exit.
 *
 * @param {string[]} args
 * @param {string} cwd
 */
export function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

/** @param {string} output */
export function lines(output) {
  return output === "" ? [] : output.split("\n");
}

/**
 * The ref the branch is compared against: `preferred` when given, otherwise
 * origin/main, falling back to main for clones without a fetched remote.
 *
 * @param {string} cwd
 * @param {string} [preferred]
 */
export function resolveBase(cwd, preferred) {
  const candidates = preferred ? [preferred] : ["origin/main", "main"];
  for (const ref of candidates) {
    try {
      git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], cwd);
      return ref;
    } catch {
      // try the next candidate
    }
  }
  throw new Error(
    `Base ref not found (tried ${candidates.join(", ")}). Run \`git fetch origin\` or pass --base <ref>.`,
  );
}
```

- [ ] **Step 5: Implement `plan.mjs`**

```js
// @ts-check
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import process from "node:process";
import { isMain, printJson, readFlag } from "./lib/cli.mjs";
import { parseContract } from "./lib/contract.mjs";
import { git, lines, resolveBase } from "./lib/git.mjs";

const CONTRACT_PATH = /^docs\/plans\/(?!_template\/)[^/]+\/contract\.md$/;

/**
 * @typedef {{
 *   folder: string,
 *   contractPath: string,
 *   committed: boolean,
 *   title: string,
 *   type: string,
 *   status: string,
 *   approved: string,
 *   criteria: string[],
 *   hasAmendments: boolean,
 * }} Plan
 */

/**
 * The current branch's plan: the single docs/plans/<folder>/contract.md added
 * since the branch left the base, whether committed or still only in the
 * working tree. Paths are relative to the repo root.
 *
 * @param {{ cwd?: string, base?: string }} [options]
 * @returns {Plan}
 */
export function findPlan({ cwd = process.cwd(), base } = {}) {
  const root = git(["rev-parse", "--show-toplevel"], cwd);
  const baseRef = resolveBase(root, base);
  const mergeBase = git(["merge-base", baseRef, "HEAD"], root);

  const committed = lines(
    git(["diff", "--name-only", "--diff-filter=A", `${mergeBase}..HEAD`, "--", "docs/plans"], root),
  );
  const uncommitted = lines(
    git(["status", "--porcelain", "--untracked-files=all", "--", "docs/plans"], root),
  )
    .filter(entry => entry.startsWith("??") || entry.startsWith("A"))
    .map(entry => entry.slice(3));
  const paths = [...new Set([...committed, ...uncommitted])].filter(path =>
    CONTRACT_PATH.test(path),
  );

  const [contractPath, ...others] = paths;
  if (contractPath === undefined) {
    throw new Error(
      `No contract on this branch: expected one docs/plans/<folder>/contract.md added since ${baseRef}. Run /wen-contract to write one.`,
    );
  }
  if (others.length > 0) {
    throw new Error(
      `More than one contract on this branch (${paths.join(", ")}). A branch carries exactly one contract.`,
    );
  }

  const contract = parseContract(readFileSync(join(root, contractPath), "utf8"));
  /** @type {Record<string, string>} */
  const fm = contract.frontmatter ?? {};
  return {
    folder: posix.dirname(contractPath),
    contractPath,
    committed: committed.includes(contractPath),
    title: fm.title ?? "",
    type: fm.type ?? "",
    status: fm.status ?? "",
    approved: fm.approved ?? "",
    criteria: contract.criteria.map(criterion => criterion.id),
    hasAmendments: contract.hasAmendments,
  };
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  try {
    printJson(findPlan({ base: readFlag(args, "base") }));
    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
```

- [ ] **Step 6: Run plan tests**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/plan.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 7: Run the full agent-workflow suite, type-check, lint, commit**

Run: `pnpm vitest run --project unit test/unit/agent-workflow/ && pnpm type-check && pnpm lint`
Expected: all pass. If ESLint reports `no-undef` for a Node global in a `.mjs` file, import it from its `node:` module instead of changing `eslint.config.mjs`.

```bash
pnpm exec prettier --write scripts/agent-workflow test/factories test/unit/agent-workflow
git add scripts/agent-workflow test/factories/gitRepo.ts test/unit/agent-workflow/plan.test.ts
git commit -m "chore(harness): add plan script to find the branch contract"
```

---

### Task 4: Workflow docs, contract template, first pattern

**Files:**

- Create: `docs/agent-workflow.md`, `docs/plans/_template/contract.md`, `docs/patterns/redundant-ref-annotation.md`
- Test: CLI runs below

**Interfaces:**

- Consumes: `contract-lint.mjs` CLI (Task 2), `plan.mjs` CLI (Task 3)
- Produces: the docs every skill links to; template path `docs/plans/_template/contract.md`; pattern file format

- [ ] **Step 1: Write `docs/plans/_template/contract.md`**

```markdown
---
title: <Short title in CONTEXT.md vocabulary>
type: feat # feat | fix | refactor — matches the branch prefix
status: draft # draft | approved — set to approved only on the human's explicit approval
approved: # YYYY-MM-DD, written on approval and bumped with each approved amendment
issue: # optional, e.g. "#5"
---

## Goal

<One or two sentences: what changes, for whom, and why.>

## Acceptance criteria

<!--
3–8 criteria. Each describes observable behaviour, not implementation, and has one Verify line.
Verify kinds: test | command | screenshot | manual.
fix: AC-1 is "A regression test reproduces <the bug>: it fails before the fix and passes after".
refactor: AC-1 is "Existing tests pass without modification".
-->

- **AC-1:** <observable behaviour>
  - Verify: test — <which test proves it>
- **AC-2:** <observable behaviour>
  - Verify: command — <which command, expected output>
- **AC-3:** <observable behaviour>
  - Verify: screenshot — <what the screenshot shows>

## Out of scope

- <What was discussed and deliberately left out.>

## Amendments

<!-- After approval only. Each: `- YYYY-MM-DD — AC-n: what changed — why`. Bump `approved:` in the same commit, only on the human's explicit approval. Never edit anything above this section after approval. -->
```

- [ ] **Step 2: Write `docs/patterns/redundant-ref-annotation.md`**

```markdown
---
slug: redundant-ref-annotation
target: lint # lint | prose — decides the promotion threshold
status: watching # watching | promoted | rejected
promoted-to:
rejected-reason:
---

A `ref`, `shallowRef` or `computed` is typed twice: once on the variable and once on the call. Type the call only.

**Bad:** `const foo: Ref<string> = ref<string>("hello world")`

**Good:** `const foo = ref<string>("hello world")`

**Lint candidate:** `no-restricted-syntax` with selector `VariableDeclarator[id.typeAnnotation] > CallExpression[callee.name=/^(ref|shallowRef|computed)$/]`.
```

- [ ] **Step 3: Write `docs/agent-workflow.md`**

````markdown
# Agent workflow

How feat, fix and refactor work moves from an idea to a merged PR in Wen365, and how recurring problems flow back into this repo's guidance. Design and rationale: [`docs/plans/2026-10-04-agent-workflow/design.md`](./plans/2026-10-04-agent-workflow/design.md).

Self-improvement = drift + repetition + human review. The loop improves the harness (guidance, lint rules, templates), not the model.

## What exists today

The workflow is being built in five PRs (design section 9). This table is updated by each one.

| Step                 | Skill / script                                     | Available |
| -------------------- | -------------------------------------------------- | --------- |
| Clarify the idea     | `/wen-grilling`                                    | ✅        |
| Write the contract   | `/wen-contract`, `contract-lint.mjs`               | ✅        |
| Review the contract  | `/wen-contract-review`                             | ✅        |
| Find the contract    | `plan.mjs`                                         | ✅        |
| Implement            | `/wen-implement`, `/wen-tdd`                       | PR 2      |
| Self-check           | `/wen-self-check`, `gate-changes.mjs`              | PR 2      |
| Code review          | `/wen-code-review`, `review-context.mjs`           | PR 2      |
| Drift and patterns   | `/wen-drift`, `review-threads.mjs`, `patterns.mjs` | PR 3      |
| Orchestration and CI | `/wen-ship`, `status.mjs`, `check.mjs`             | PR 4      |
| Automatic promotion  | `/wen-drift`                                       | PR 5      |

Until a step exists, do it by hand the way the design describes, or skip it.

## Paths

The branch prefix decides the path: `feat`, `fix` or `refactor` followed by `/` or `-` is the **full path**; any other Conventional Commits type is the **small path**. The PR title type must agree.

- **Full path:** grilling (optional) → contract → contract review → ⏸ human approves → implement → self-check → code review → PR → ⏸ review → drift → ⏸ human merges.
- **Small path:** implement → lint, type-check, tests → PR → ⏸ review → corrections-only drift if review led to changes → ⏸ human merges.

## Contracts

A contract lives at `docs/plans/<YYYY-MM-DD>-<slug>/contract.md`, created from [`docs/plans/_template/contract.md`](./plans/_template/contract.md). It states _what_ will be delivered and how each part is verified, never _how_ to build it. A branch carries exactly one contract: the one added on that branch (`node scripts/agent-workflow/plan.mjs` finds it).

- 3–8 acceptance criteria, numbered AC-1…n, each describing observable behaviour in [`CONTEXT.md`](../CONTEXT.md) vocabulary.
- Each criterion has one `Verify:` line: `test`, `command`, `screenshot` or `manual`, plus what exactly. If you can't say how it would be verified, the criterion is too vague.
- `fix`: AC-1 is a regression test that fails before the fix and passes after. `refactor`: AC-1 is "Existing tests pass without modification".
- `status: approved` and the `approved:` date are written only when the human explicitly approves. After approval nothing above `## Amendments` changes. A scope change is an amendment entry plus an `approved:` bump in the same commit, again only on explicit approval.
- Structure is checked by `node scripts/agent-workflow/contract-lint.mjs <path>`; judgement by `/wen-contract-review`.

## Vocabulary

**Criterion status** (self-check): `met` (evidence on this branch, checked in this run) · `partial` · `not met` · `not verified`.

**Drift result** per criterion (code review, drift): `delivered` · `dropped` (not shipped) · `weakened` (less than agreed) · `substituted` (shipped differently than agreed) · `unverified` (claimed without evidence) · `amended` (changed by an approved amendment). `delivered` and `amended` are clean. **`added`**: shipped work no criterion asked for.

**Entry sources** that can carry a pattern slug: contract drift, `added`, PR review corrections that led to a change, self-caught issues (self-check and code-review fixes), friction.

## Patterns

A pattern is a recurring problem with a stable slug: `docs/patterns/<slug>.md`.

```markdown
---
slug: kebab-case-name
target: lint # lint | prose
status: watching # watching | promoted | rejected
promoted-to: # e.g. eslint.config.mjs, app/AGENTS.md
rejected-reason:
---

One-line description.

**Bad:** …
**Good:** …
```

- Reuse an existing slug whenever one fits; create a new one only when none does.
- Counting is by **distinct PRs** whose `drift.md` cites the slug, not by occurrences.
- Promotion threshold: `target: lint` → 2 PRs, `target: prose` → 3 PRs. The human can promote any time.
- Promotion target, highest that fits: lint/type rule → `AGENTS.md` line → ADR → plan template or self-check checklist. Promotions land as their own `chore(harness): promote <slug>` PR.
- Self-check and code review check against `watching` patterns and `promoted` patterns whose `promoted-to` is prose. Lint-promoted and `rejected` patterns are skipped.

## Skills and scripts

- Skills live in `.agents/skills/wen-*/SKILL.md` (plain Markdown, any agent) and are symlinked into `.claude/skills/` for Claude Code. The `wen-` prefix keeps them from colliding with personal skills of the same name.
- Scripts live in `scripts/agent-workflow/`: Node ESM, no dependencies, results on stdout, reasons on stderr, exit 1 on failure. Any step that can be done mechanically is a script; skills only add judgement.
- Agents commit and push freely on feature branches. They never commit to `main`, merge, force-push, skip hooks or edit `git config`.
````

- [ ] **Step 4: Check the template and docs**

Run: `node scripts/agent-workflow/contract-lint.mjs docs/plans/_template/contract.md`
Expected: exit 0 (`docs/plans/_template/contract.md: ok`) — the template is itself a structurally valid draft, so copying it never starts from a lint failure. If it reports a problem, fix the template, not the linter.

Run: `pnpm exec prettier --write docs/agent-workflow.md docs/plans/_template/contract.md docs/patterns/redundant-ref-annotation.md && pnpm format:check`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add docs/agent-workflow.md docs/plans/_template docs/plans/2026-10-04-agent-workflow docs/patterns
git commit -m "chore(harness): add agent workflow docs, contract template and first pattern"
```

---

### Task 5: Skills `wen-grilling`, `wen-contract`, `wen-contract-review`

**Files:**

- Create: `.agents/skills/wen-grilling/SKILL.md`, `.agents/skills/wen-contract/SKILL.md`, `.agents/skills/wen-contract-review/SKILL.md`, `.agents/skills/LICENSE-mattpocock-skills.txt`
- Create: symlinks `.claude/skills/wen-grilling`, `.claude/skills/wen-contract`, `.claude/skills/wen-contract-review`

**Interfaces:**

- Consumes: `plan.mjs`, `contract-lint.mjs` CLIs; `docs/agent-workflow.md`; template
- Produces: `/wen-grilling`, `/wen-contract`, `/wen-contract-review` (used by `/wen-ship` in PR 4)

- [ ] **Step 1: Add the licence and write `wen-grilling`**

```bash
mkdir -p .agents/skills/wen-grilling
gh api repos/mattpocock/skills/contents/LICENSE --jq .content | base64 -d > .agents/skills/LICENSE-mattpocock-skills.txt
head -3 .agents/skills/LICENSE-mattpocock-skills.txt
```

Expected: the licence starts with `MIT License` / `Copyright (c) 2026 Matt Pocock`.

Do **not** copy `~/.agents/skills/grilling/SKILL.md`: the personal copy contains examples from another project. Write `.agents/skills/wen-grilling/SKILL.md` with exactly this content:

```markdown
---
name: wen-grilling
description: Grill the user relentlessly about a plan or design for Wen365 before a contract is written. Use when the user wants to stress-test a plan before building, uses any 'grill' trigger phrases, or /wen-ship needs the idea clarified.
---

> Adapted from an earlier version of `grilling` in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see [`../LICENSE-mattpocock-skills.txt`](../LICENSE-mattpocock-skills.txt)).

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a _fact_ can be found by exploring the codebase, look it up rather than asking me. The _decisions_, though, are mine: put each one to me and wait for my answer.

Do not enact the plan until I confirm we have reached a shared understanding.

## How to ask a question

A question the user cannot decode is a question they cannot answer. They accept the recommendation instead of deciding, and the session produces a plan they do not understand. Every question carries the same six parts, in this order:

1. **Context first:** two to four sentences on what the decision is about, why it comes up now, and what later work depends on it.
2. **The question itself**, in one sentence.
3. **Options described by what concretely happens** if chosen, in everyday language.
4. **Every option states its real cost**, not only its benefit.
5. **A recommendation, with its reason.**
6. **Any technical term defined at first use**, beside the question, not inside it.

Banned, without exception:

- Metaphors of any kind.
- Abstract labels as option names ("event-driven approach", "the reactive variant").
- Content-free adjectives: robust, seamless, elegant, clean, powerful, flexible.
- Naming a pattern instead of describing its effect.
- More than one question at a time.

### Worked example: follows the rules

> When a user adds a second Wallet, the Portfolio total jumps. The daily Snapshots stored so far only cover the first Wallet, so the value-over-time chart would show a sudden spike that never happened. How we handle this decides whether we need a backfill job and what the chart shows on day one.
>
> **Question:** What should the chart show right after a Wallet is added?
>
> - **Start the new Wallet's history from today.** The chart shows a step on the day the Wallet was added, with a marker explaining it. Nothing extra to build. Cost: the step can be misread as a gain unless the marker is noticed.
> - **Rebuild past Snapshots including the new Wallet.** The chart looks as if the Wallet had always been tracked. Cost: needs historical balances from Alchemy for every past day, which is slow and uses API quota.
>
> **Recommendation:** The first. It is honest about what was tracked when, and it needs no new Alchemy calls.

💡 **Snapshot:** the stored daily value of a Portfolio, used to draw the chart.

### Counter-example: do not do this

> **Question:** Should Snapshot reconciliation be eager or lazy?
>
> - Eager backfill (robust, consistent)
> - Lazy reconciliation

Five violations: no context before the question; pattern names instead of effects; "robust" and "consistent" carry no information; no costs; no recommendation.

### Which language

- Ask in whatever language the user is writing in, and switch when they switch.
- Never switch the user's language because a document, the codebase or `CONTEXT.md` uses another one.

### Before sending a question, check

- [ ] Is there a term here the user would have to ask me to explain? Replace or define it.
- [ ] Does every option say what actually happens, not what it is called?
- [ ] Does every option state its cost?
- [ ] Is there exactly one question?
- [ ] Did I give a recommendation and say why?

## Handing over

When the plan is settled and the work is a `feat`, `fix` or `refactor`, hand over to `/wen-contract`, which turns this conversation into a contract. For any other kind of change, there is no contract; go straight to the work.
```

- [ ] **Step 2: Write `.agents/skills/wen-contract/SKILL.md`**

````markdown
---
name: wen-contract
description: Write the contract (goal + acceptance criteria) for a feat, fix or refactor in Wen365, have it cold-reviewed, and stop for the human's approval. Use after planning or grilling and before any implementation, when amending an approved contract, or when /wen-ship reaches the contract stage.
---

# wen-contract

A contract says **what** will be delivered and how each part is verified, never how to build it. Format and rules: [`docs/agent-workflow.md`](../../../docs/agent-workflow.md#contracts). Read that section before writing.

## 1. Check for an existing contract

Run `node scripts/agent-workflow/plan.mjs`.

- `status: "draft"` → continue at step 4 with that file.
- `status: "approved"` → this branch already has an approved contract. For a scope change go to **Amendments** below; otherwise stop.
- Fails with "More than one contract" → run `git fetch origin` once and retry (a stale `origin/main` can make an already-merged contract look like part of this branch); if it still fails, stop and show the human the message.
- Fails with "No contract on this branch" → continue.
- Fails with "Base ref not found" → run `git fetch origin` once and retry; if it still fails, stop and show the message.

## 2. Gather

- Source: the current conversation (usually after `/wen-grilling`), or the issue the human named (`gh issue view <n>`).
- Read [`CONTEXT.md`](../../../CONTEXT.md), the ADRs in `docs/adr/` that touch the area, and the `AGENTS.md` of each directory involved.
- Read code only as far as needed to make criteria concrete.
- If the request contradicts an ADR, stop and raise the conflict before writing anything.

## 3. Write

Create `docs/plans/<YYYY-MM-DD>-<slug>/contract.md` from `docs/plans/_template/contract.md` (today's date; slug is the title in kebab-case, at most five words). Fill it:

- `type` from the branch prefix. If the branch prefix isn't `feat`, `fix` or `refactor`, stop: small-path work has no contract.
- `status: draft`, `approved:` empty.
- **Goal:** one or two sentences, from the user's point of view.
- **Acceptance criteria:** observable behaviour only, `CONTEXT.md` terms only, one `Verify:` line each, 3–8 of them. Remove the template's placeholder criteria and the guidance comment.
- `fix`: AC-1 is exactly the form "A regression test reproduces <the bug>: it fails before the fix and passes after".
- `refactor`: AC-1 is "Existing tests pass without modification".
- **Out of scope:** everything discussed and deliberately excluded.
- **Amendments:** leave only the template comment.

## 4. Lint

Run `node scripts/agent-workflow/contract-lint.mjs <path>` and fix until it exits 0.

## 5. Review

Run `/wen-contract-review <path>`. Fix every **blocking** finding, once, then lint again. Do not run the review a second time.

## 6. Present and stop

Show the human:

1. the contract path and its full contents
2. **Review notes:** each blocking finding and how it was fixed; each suggestion not applied, with a one-line reason

Ask them to approve or request changes. **Stop.** Do not commit and do not change `status`.

If they request changes: edit, lint, present again. Run the review again only if they ask.

## 7. On approval

Only when the human explicitly approves in the conversation:

1. Set `status: approved` and `approved:` to today's date (or the date they give).
2. Run `node scripts/agent-workflow/contract-lint.mjs <path>`; it must exit 0.
3. Commit only the contract:

```bash
git add <folder>/contract.md
git commit -m "docs(plan): <title>"
```

## Amendments

After approval, never edit anything above `## Amendments`.

1. Append `- YYYY-MM-DD — AC-n: <what changed> — <why>` under `## Amendments`.
2. Show the human the amendment and ask for approval. **Stop.**
3. On explicit approval: bump `approved:` to today's date and commit the amendment and the bump together as `docs(plan): amend <title>`. An amendment without a bumped `approved:` does not count.
````

- [ ] **Step 3: Write `.agents/skills/wen-contract-review/SKILL.md`**

```markdown
---
name: wen-contract-review
description: Cold review of a Wen365 contract (docs/plans/*/contract.md) by a fresh subagent on a different model, returning blocking findings and suggestions. Use from /wen-contract before the human approves, or on demand for any draft contract.
---

# wen-contract-review

Input: the path to a `contract.md`. Without one, use `contractPath` from `node scripts/agent-workflow/plan.mjs`.

## 1. Lint first

Run `node scripts/agent-workflow/contract-lint.mjs <path>`. If it fails, return the problems and stop: structure gets fixed before judgement.

## 2. Dispatch a fresh reviewer

The reviewer must not share this conversation, so the author's assumptions don't carry over.

- **Claude Code:** Agent tool, `subagent_type: general-purpose`, `model: fable`.
- **Other agents:** a fresh-context subagent on a different model from the author's, if available.
- **No subagent available:** tell the human the review can't run independently and stop. Do not review the contract yourself in this context.

Send exactly this prompt, with `<path>` filled in:

> You are reviewing a contract cold, in the Wen365 repo. Read only: `<path>`, `CONTEXT.md`, `docs/adr/*.md`, `docs/agent-workflow.md` (section "Contracts"), and the `AGENTS.md` files of the directories the goal concerns (root, `app/`, `server/`, `test/`). Read-only: do not edit anything.
>
> A contract states what will be delivered and how each criterion is verified. It deliberately does not say how to build it. Check:
>
> 1. **Gaps:** behaviour the goal implies that no criterion covers, such as error states, empty states, loading, phone width and dark mode for UI, signed-out access or Session expiry.
> 2. **Ambiguity:** a criterion two reasonable reviewers would judge met/not met differently.
> 3. **Feasible verification:** can each `Verify:` actually be produced in this repo? Check `vitest.config.ts` for test projects; a screenshot needs a running app with an `ALCHEMY_API_KEY`.
> 4. **Implementation in disguise:** a criterion that prescribes files, functions, libraries or patterns instead of behaviour.
> 5. **Conflicts:** contradicts an ADR, or uses a term that isn't in `CONTEXT.md` or is an alias for one that is.
> 6. **Scope:** several deliverables that should be separate contracts, or something important missing from "Out of scope".
>
> Ignore prose style and structure (already linted). Report each finding as: **BLOCKING** or **SUGGESTION** · criterion ID or "contract" · the problem · a proposed rewrite. BLOCKING means drift could not be judged fairly later, or the work would be built wrong. Under 500 words. If there is nothing to report, answer "No findings."

## 3. Return

Return the reviewer's findings verbatim to the caller. When called by `/wen-contract`, the author fixes blocking findings once; this skill never edits the contract.
```

- [ ] **Step 4: Create the symlinks and check them**

```bash
mkdir -p .claude/skills
for skill in wen-grilling wen-contract wen-contract-review; do
  ln -s "../../.agents/skills/$skill" ".claude/skills/$skill"
done
ls -l .claude/skills/
head -3 .claude/skills/wen-contract/SKILL.md
```

Expected: three symlinks pointing to `../../.agents/skills/wen-*`; `head` prints the `wen-contract` frontmatter start.

- [ ] **Step 5: Format and commit**

Run: `pnpm exec prettier --write .agents/skills && pnpm format:check`
Expected: exit 0.

```bash
git add .agents/skills .claude/skills
git commit -m "chore(harness): add wen-grilling, wen-contract and wen-contract-review skills"
```

---

### Task 6: Root `AGENTS.md`

**Files:**

- Modify: `AGENTS.md` (the "Before you write code" table, a new "Workflow" section after "Canonical commands", the last bullet of "What NOT to do")

**Interfaces:**

- Consumes: `docs/agent-workflow.md` (Task 4), skills (Task 5)
- Produces: the entry point every agent reads

- [ ] **Step 1: Add a table row** to the "Editing / Read / Covers" table, after the `test/**` row:

```markdown
| `.agents/skills/**`, `scripts/agent-workflow/**`, `docs/plans/**`, `docs/patterns/**` | [`docs/agent-workflow.md`](./docs/agent-workflow.md) | Contract → self-check → drift workflow, pattern registry, skill and script conventions |
```

- [ ] **Step 2: Add a "Workflow" section** directly before "## Conventions at a glance":

```markdown
## Workflow

Feature, fix and refactor work starts from an approved contract in `docs/plans/` and ends with a drift entry that feeds recurring problems back into this guidance. The workflow, its vocabulary and which steps exist so far are in [`docs/agent-workflow.md`](./docs/agent-workflow.md). Repo skills live in `.agents/skills/` (symlinked into `.claude/skills/`) and are prefixed `wen-`. `/wen-ship`, which runs the whole workflow, arrives in a later PR.
```

- [ ] **Step 3: Replace the last "What NOT to do" bullet**

Old:

```markdown
- Don't update `git config`, force-push to main, or skip hooks. Don't commit without an explicit request from the user.
```

New:

```markdown
- Don't update `git config`, force-push, or skip hooks. Never commit to `main`: every change lands through a PR, and the `main` ruleset enforces it.
```

- [ ] **Step 4: Check and commit**

Run: `pnpm exec prettier --write AGENTS.md && grep -n "explicit request" AGENTS.md; pnpm format:check`
Expected: `grep` prints nothing; format check exits 0.

```bash
git add AGENTS.md
git commit -m "docs(harness): link agent workflow from AGENTS.md and drop commit-request rule"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full checks**

Run: `pnpm format:check && pnpm lint && pnpm type-check && pnpm test`
Expected: all exit 0.

- [ ] **Step 2: Dogfood the contract tooling**

On a throwaway branch, check the skill end-to-end without committing anything:

```bash
git switch -c feat/contract-dry-run
mkdir -p docs/plans/2026-10-05-dry-run && cp docs/plans/_template/contract.md docs/plans/2026-10-05-dry-run/contract.md
node scripts/agent-workflow/plan.mjs
node scripts/agent-workflow/contract-lint.mjs docs/plans/2026-10-05-dry-run/contract.md
rm -r docs/plans/2026-10-05-dry-run && git switch - && git branch -D feat/contract-dry-run
```

Expected: `plan.mjs` prints JSON with `"folder": "docs/plans/2026-10-05-dry-run"` and `"status": "draft"`; lint exits 0.

- [ ] **Step 3: Check the skills load in Claude Code**

Start a fresh Claude Code session in the worktree and confirm `wen-grilling`, `wen-contract` and `wen-contract-review` appear in the skill list. Note the result in the PR description (manual verification for AC-1, partial).

- [ ] **Step 4: Spec ACs covered by this PR**

Confirm against design section 9, row PR 1: AC-2 (docs, template, patterns dir, AGENTS.md), AC-5 (first pattern), AC-1 partial (3 of 9 skills), AC-3 partial (`plan`, `contract-lint` tested), AC-6 (all checks pass).
