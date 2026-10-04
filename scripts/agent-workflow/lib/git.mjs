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
