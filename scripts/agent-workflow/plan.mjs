// @ts-check
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import process from "node:process";
import { isMain, printJson, readFlag } from "./lib/cli.mjs";
import { parseContract } from "./lib/contract.mjs";
import { git, nulFields, repoRoot, resolveBase } from "./lib/git.mjs";

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
  const root = repoRoot(cwd);
  const baseRef = resolveBase(root, base);
  const mergeBase = git(["merge-base", baseRef, "HEAD"], root);

  const committed = nulFields(
    git(
      ["diff", "--name-only", "-z", "--diff-filter=A", `${mergeBase}..HEAD`, "--", "docs/plans"],
      root,
    ),
  );
  const uncommitted = addedInWorkingTree(root);
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
 * Paths under docs/plans that are new in the working tree: untracked, staged
 * as added, or marked intent-to-add.
 *
 * @param {string} root
 */
function addedInWorkingTree(root) {
  const fields = nulFields(
    git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "docs/plans"], root),
  );
  /** @type {string[]} */
  const added = [];
  for (let index = 0; index < fields.length; index++) {
    const entry = fields[index] ?? "";
    const status = entry.slice(0, 2);
    // A rename or copy is followed by its original path as a separate field.
    if (status[0] === "R" || status[0] === "C") index++;
    const isAdded = status === "??" || status[0] === "A" || status[1] === "A";
    if (isAdded && !status.includes("D")) added.push(entry.slice(3));
  }
  return added;
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
