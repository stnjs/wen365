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
