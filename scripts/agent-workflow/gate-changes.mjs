// @ts-check
import process from "node:process";
import { isMain, printJson, readFlag } from "./lib/cli.mjs";
import { git, nulFields, repoRoot, resolveBase } from "./lib/git.mjs";

/**
 * @typedef {{ file: string, line: number | null, kind: string, text: string }} GateChange
 */

const CODE_FILE = /\.(?:[cm]?[jt]sx?|vue)$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const GATE_CONFIG =
  /^(?:eslint\.config\.mjs|vitest\.config\.ts|tsconfig(?:\.[\w-]+)?\.json|\.github\/workflows\/.+)$/;
const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/**
 * Patterns in added lines: [kind, pattern, only in test files].
 *
 * @type {Array<[string, RegExp, boolean]>}
 */
const ADDED_LINE_RULES = [
  ["test-skip", /\.skip\(/, true],
  ["test-only", /\.only\(/, true],
  ["test-todo", /\.todo\(/, true],
  ["eslint-disable", /eslint-disable/, false],
  ["ts-ignore", /@ts-ignore/, false],
  ["ts-expect-error", /@ts-expect-error/, false],
  ["ts-nocheck", /@ts-nocheck/, false],
  ["as-any", /\bas any\b/, false],
];

/** @type {Record<string, string>} */
const STATUS_WORDS = {
  A: "added",
  M: "modified",
  D: "deleted",
  R: "renamed",
  C: "copied",
  T: "type changed",
};

/**
 * Every committed change on the branch that could weaken a quality gate:
 * skipped or focused tests, suppressed lint or type errors, deleted tests or
 * assertions, and edits to gate configuration or package scripts.
 *
 * @param {{ cwd?: string, base?: string }} [options]
 * @returns {GateChange[]}
 */
export function findGateChanges({ cwd = process.cwd(), base } = {}) {
  const root = repoRoot(cwd);
  const mergeBase = git(["merge-base", resolveBase(root, base), "HEAD"], root);
  const range = `${mergeBase}..HEAD`;
  const diff = git(
    [
      "-c",
      "core.quotePath=false",
      "diff",
      "-U0",
      "--no-color",
      "--no-ext-diff",
      "--src-prefix=a/",
      "--dst-prefix=b/",
      range,
    ],
    root,
  );
  const statuses = nulFields(git(["diff", "--name-status", "-z", "-M", range], root));
  return [...lineChanges(diff), ...fileChanges(statuses), ...packageScriptChanges(root, mergeBase)];
}

/**
 * Gate patterns in added lines of code files, and assertions removed from
 * test files whose exact text was not added back elsewhere in the same file.
 * Each added copy covers one removed copy, so removing two identical
 * assertions and adding one back still reports one.
 *
 * @param {string} diff unified diff with zero context lines
 * @returns {GateChange[]}
 */
function lineChanges(diff) {
  /** @type {GateChange[]} */
  const changes = [];
  /** @type {Map<string, { added: Map<string, number>, removed: Array<{ line: number, text: string }> }>} */
  const testFiles = new Map();
  /** @param {string} path */
  const testFile = path => {
    let entry = testFiles.get(path);
    if (entry === undefined) {
      entry = { added: new Map(), removed: [] };
      testFiles.set(path, entry);
    }
    return entry;
  };

  let file = "";
  let inHeader = false;
  let oldLine = 0;
  let newLine = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      inHeader = true;
      file = "";
      continue;
    }
    const hunk = HUNK.exec(raw);
    if (hunk) {
      inHeader = false;
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
      continue;
    }
    if (inHeader) {
      // git appends a tab to header paths that contain spaces.
      if (raw.startsWith("+++ ")) {
        file = raw === "+++ /dev/null" ? "" : raw.slice("+++ b/".length).replace(/\t$/, "");
      }
      continue;
    }
    if (file === "" || !CODE_FILE.test(file)) continue;

    const isTest = TEST_FILE.test(file);
    if (raw.startsWith("+")) {
      const text = raw.slice(1).trim();
      for (const [kind, pattern, testOnly] of ADDED_LINE_RULES) {
        if ((isTest || !testOnly) && pattern.test(text)) {
          changes.push({ file, line: newLine, kind, text });
        }
      }
      if (isTest) {
        const { added } = testFile(file);
        added.set(text, (added.get(text) ?? 0) + 1);
      }
      newLine++;
    } else if (raw.startsWith("-")) {
      const text = raw.slice(1).trim();
      if (isTest && text.includes("expect(")) testFile(file).removed.push({ line: oldLine, text });
      oldLine++;
    }
  }

  for (const [path, { added, removed }] of testFiles) {
    for (const { line, text } of removed) {
      const copiesLeft = added.get(text) ?? 0;
      if (copiesLeft > 0) added.set(text, copiesLeft - 1);
      else changes.push({ file: path, line, kind: "removed-assertion", text });
    }
  }
  return changes;
}

/**
 * Deleted test files and any change to gate configuration, including
 * renames that move either out of the names the tools read.
 *
 * @param {string[]} fields output of `git diff --name-status -z -M`
 * @returns {GateChange[]}
 */
function fileChanges(fields) {
  /** @type {GateChange[]} */
  const changes = [];
  for (let index = 0; index < fields.length; index++) {
    const status = fields[index] ?? "";
    const letter = status.charAt(0);
    // A rename or copy lists the old path, then the new one.
    const moved = letter === "R" || letter === "C";
    const path = fields[index + (moved ? 2 : 1)] ?? "";
    const oldPath = moved ? (fields[index + 1] ?? "") : path;
    index += moved ? 2 : 1;
    if (letter === "D" && TEST_FILE.test(path)) {
      changes.push({ file: path, line: null, kind: "deleted-test-file", text: "deleted" });
    }
    // Renaming a test or config file to a name the tools don't read removes it just as deleting does.
    if (letter === "R" && TEST_FILE.test(oldPath) && !TEST_FILE.test(path)) {
      changes.push({
        file: oldPath,
        line: null,
        kind: "deleted-test-file",
        text: `renamed to ${path}`,
      });
    }
    if (letter === "R" && GATE_CONFIG.test(oldPath) && !GATE_CONFIG.test(path)) {
      changes.push({ file: oldPath, line: null, kind: "gate-config", text: `renamed to ${path}` });
    }
    if (GATE_CONFIG.test(path)) {
      changes.push({
        file: path,
        line: null,
        kind: "gate-config",
        text: STATUS_WORDS[letter] ?? status,
      });
    }
  }
  return changes;
}

/**
 * Scripts in package.json that were added, changed or removed.
 *
 * @param {string} root
 * @param {string} mergeBase
 * @returns {GateChange[]}
 */
function packageScriptChanges(root, mergeBase) {
  const before = scriptsAt(root, mergeBase);
  const after = scriptsAt(root, "HEAD");
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  return keys
    .filter(key => before[key] !== after[key])
    .map(key => ({
      file: "package.json",
      line: null,
      kind: "package-script",
      text: `scripts.${key}: ${before[key] ?? "(none)"} → ${after[key] ?? "(removed)"}`,
    }));
}

/**
 * @param {string} root
 * @param {string} rev
 * @returns {Record<string, string>}
 */
function scriptsAt(root, rev) {
  let text;
  try {
    text = git(["show", `${rev}:package.json`], root);
  } catch {
    return {};
  }
  const scripts = JSON.parse(text).scripts;
  return scripts !== null && typeof scripts === "object" ? scripts : {};
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  try {
    printJson(findGateChanges({ base: readFlag(args, "base") }));
    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
