// @ts-check
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import process from "node:process";
import { isMain, printJson, readFlag } from "./lib/cli.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { git, lines, nulFields, repoRoot, resolveBase } from "./lib/git.mjs";
import { findPlan } from "./plan.mjs";

/**
 * @typedef {{
 *   base: string,
 *   mergeBase: string,
 *   diffCommand: string,
 *   commits: Array<{ sha: string, subject: string }>,
 *   changedFiles: string[],
 *   agentsFiles: string[],
 *   adrs: string[],
 *   patterns: string[],
 *   contract: string | null,
 *   selfCheck: string | null,
 * }} ReviewContext
 */

/**
 * Everything a reviewer needs for the branch, as repo-relative paths: the
 * diff range, commits, changed files, the AGENTS.md files that apply to them,
 * ADRs, patterns to check, and the plan's contract and self-check.
 *
 * @param {{ cwd?: string, base?: string }} [options]
 * @returns {ReviewContext}
 */
export function buildReviewContext({ cwd = process.cwd(), base } = {}) {
  const root = repoRoot(cwd);
  const baseRef = resolveBase(root, base);
  const mergeBase = git(["merge-base", baseRef, "HEAD"], root);
  const range = `${mergeBase}..HEAD`;
  const commits = lines(git(["log", "--no-merges", "--format=%h%x09%s", range], root)).map(line => {
    const [sha = "", ...subject] = line.split("\t");
    return { sha, subject: subject.join("\t") };
  });
  const changedFiles = nulFields(git(["diff", "--name-only", "-z", range], root));
  return {
    base: baseRef,
    mergeBase,
    diffCommand: `git diff ${range}`,
    commits,
    changedFiles,
    agentsFiles: agentsFilesFor(root, changedFiles),
    adrs: markdownIn(root, "docs/adr").filter(path => !path.endsWith("/0000-template.md")),
    patterns: patternsToCheck(root),
    ...planPaths(root, base),
  };
}

/**
 * The root AGENTS.md plus the AGENTS.md of every directory above a changed file.
 *
 * @param {string} root
 * @param {string[]} files
 */
function agentsFilesFor(root, files) {
  /** @type {Set<string>} */
  const found = new Set();
  for (const file of files) {
    for (let dir = posix.dirname(file); dir !== "."; dir = posix.dirname(dir)) {
      if (existsSync(join(root, dir, "AGENTS.md"))) found.add(`${dir}/AGENTS.md`);
    }
  }
  const nested = [...found].sort();
  return existsSync(join(root, "AGENTS.md")) ? ["AGENTS.md", ...nested] : nested;
}

/**
 * @param {string} root
 * @param {string} dir repo-relative directory
 */
function markdownIn(root, dir) {
  if (!existsSync(join(root, dir))) return [];
  return readdirSync(join(root, dir))
    .filter(name => name.endsWith(".md"))
    .sort()
    .map(name => `${dir}/${name}`);
}

/**
 * Patterns reviewers check by hand: `watching`, and `promoted` ones whose
 * rule lives in prose (a Markdown file). Lint-promoted and rejected patterns
 * are enforced or dropped already.
 *
 * @param {string} root
 */
function patternsToCheck(root) {
  return markdownIn(root, "docs/patterns").filter(path => {
    const data = parseFrontmatter(readFileSync(join(root, path), "utf8"))?.data ?? {};
    if (data.status === "watching") return true;
    return data.status === "promoted" && (data["promoted-to"] ?? "").endsWith(".md");
  });
}

/**
 * @param {string} root
 * @param {string | undefined} base
 * @returns {{ contract: string | null, selfCheck: string | null }}
 */
function planPaths(root, base) {
  try {
    const plan = findPlan({ cwd: root, base });
    const selfCheck = `${plan.folder}/self-check.md`;
    return {
      contract: plan.contractPath,
      selfCheck: existsSync(join(root, selfCheck)) ? selfCheck : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("No contract on this branch")) {
      return { contract: null, selfCheck: null };
    }
    throw error;
  }
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  try {
    printJson(buildReviewContext({ base: readFlag(args, "base") }));
    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
