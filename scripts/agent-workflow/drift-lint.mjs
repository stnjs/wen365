// @ts-check
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import process from "node:process";
import { readFlag, runCli } from "./lib/cli.mjs";
import { DRIFT_PATH, lintDrift } from "./lib/drift.mjs";
import { git, repoRoot, resolveBase } from "./lib/git.mjs";
import { listMarkdown } from "./lib/markdown.mjs";
import { addedOnBranch } from "./plan.mjs";

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const root = repoRoot(process.cwd());
  const mergeBase = git(["merge-base", resolveBase(root, readFlag(args, "base")), "HEAD"], root);
  const drifts = addedOnBranch(root, mergeBase).filter(path => DRIFT_PATH.test(path));
  const [path, ...others] = drifts;
  if (path === undefined) {
    process.stderr.write("No drift.md on this branch. Run /wen-drift.\n");
    return 1;
  }
  if (others.length > 0) {
    process.stderr.write(`More than one drift.md on this branch: ${drifts.join(", ")}.\n`);
    return 1;
  }
  const contractPath = join(root, posix.dirname(path), "contract.md");
  const knownSlugs = new Set(
    listMarkdown(root, "docs/patterns").map(file => posix.basename(file, ".md")),
  );
  const problems = lintDrift({
    drift: readFileSync(join(root, path), "utf8"),
    contract: existsSync(contractPath) ? readFileSync(contractPath, "utf8") : null,
    knownSlugs,
  });
  if (problems.length > 0) {
    process.stderr.write(`${path}:\n${problems.map(problem => `- ${problem}`).join("\n")}\n`);
    return 1;
  }
  process.stdout.write(`${path}: ok\n`);
  return 0;
}

runCli(import.meta.url, main);
