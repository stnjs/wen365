// @ts-check
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, posix } from "node:path";
import process from "node:process";
import { printJson, readFlag, runCli } from "./lib/cli.mjs";
import { DRIFT_PATH, driftSlugs, parseDrift } from "./lib/drift.mjs";
import { git, nulFields, repoRoot, resolveBase } from "./lib/git.mjs";
import { listMarkdown } from "./lib/markdown.mjs";
import { PROMOTION_THRESHOLDS, lintPattern, parsePattern } from "./lib/pattern.mjs";

/**
 * @typedef {import("./lib/pattern.mjs").Pattern} Pattern
 * @typedef {{
 *   slug: string,
 *   target: string,
 *   status: string,
 *   prs: number[],
 *   threshold: number | null,
 *   due: boolean,
 * }} PatternCount
 */

/**
 * Counts each pattern by the distinct PRs whose drift cites it. A watching
 * pattern is due once it reaches its target's threshold, unless a PR titled
 * `chore(harness): promote <slug>` already exists in any state.
 *
 * @param {{ patterns: Pattern[], drifts: Array<{ pr: number | null, slugs: string[] }>, promotionTitles: string[] }} input
 * @returns {{ counts: PatternCount[], due: string[], unknownSlugs: string[] }}
 */
export function countPatterns({ patterns, drifts, promotionTitles }) {
  /** @type {Map<string, Set<number>>} */
  const citedBy = new Map();
  for (const { pr, slugs } of drifts) {
    if (pr === null) continue;
    for (const slug of slugs) citedBy.set(slug, (citedBy.get(slug) ?? new Set()).add(pr));
  }
  const counts = [...patterns]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(pattern => {
      const prs = [...(citedBy.get(pattern.slug) ?? [])].sort((a, b) => a - b);
      const threshold = PROMOTION_THRESHOLDS[pattern.target] ?? null;
      const promotionOpened = promotionTitles.includes(`chore(harness): promote ${pattern.slug}`);
      const due =
        pattern.status === "watching" &&
        threshold !== null &&
        prs.length >= threshold &&
        !promotionOpened;
      return {
        slug: pattern.slug,
        target: pattern.target,
        status: pattern.status,
        prs,
        threshold,
        due,
      };
    });
  const known = new Set(patterns.map(pattern => pattern.slug));
  return {
    counts,
    due: counts.filter(count => count.due).map(count => count.slug),
    unknownSlugs: [...citedBy.keys()].filter(slug => !known.has(slug)).sort(),
  };
}

/**
 * Pattern files from the working tree, and every drift.md merged on the base
 * plus those in the working tree (the branch's own), keyed by path.
 *
 * @param {{ cwd?: string, base?: string }} [options]
 */
export function loadPatternInputs({ cwd = process.cwd(), base } = {}) {
  const root = repoRoot(cwd);
  const baseRef = resolveBase(root, base);

  /** @type {Map<string, string>} */
  const driftTexts = new Map();
  for (const path of nulFields(
    git(["ls-tree", "-r", "-z", "--name-only", baseRef, "--", "docs/plans"], root),
  )) {
    if (DRIFT_PATH.test(path)) driftTexts.set(path, git(["show", `${baseRef}:${path}`], root));
  }
  if (existsSync(join(root, "docs/plans"))) {
    for (const dir of readdirSync(join(root, "docs/plans"))) {
      const path = `docs/plans/${dir}/drift.md`;
      if (DRIFT_PATH.test(path) && existsSync(join(root, path))) {
        driftTexts.set(path, readFileSync(join(root, path), "utf8"));
      }
    }
  }
  const drifts = [...driftTexts].map(([path, text]) => {
    const report = parseDrift(text);
    return { path, pr: report.pr, slugs: driftSlugs(report) };
  });

  /** @type {string[]} */
  const problems = [];
  /** @type {Pattern[]} */
  const patterns = [];
  for (const path of listMarkdown(root, "docs/patterns")) {
    const text = readFileSync(join(root, path), "utf8");
    const fileSlug = posix.basename(path, ".md");
    for (const problem of lintPattern(text, fileSlug, file => existsSync(join(root, file)))) {
      problems.push(`${path}: ${problem}`);
    }
    patterns.push(parsePattern(text));
  }
  return { patterns, drifts, problems };
}

const PROMOTION_PR_LIMIT = 500;

/** Titles of promotion PRs in any state. */
function promotionTitles() {
  let output;
  try {
    output = execFileSync(
      "gh",
      [
        "pr",
        "list",
        "--state",
        "all",
        "--search",
        'in:title "chore(harness): promote"',
        "--json",
        "title",
        "--limit",
        String(PROMOTION_PR_LIMIT),
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`gh failed (is it installed and authenticated?): ${detail}`);
  }
  return titlesOf(JSON.parse(output), PROMOTION_PR_LIMIT);
}

/**
 * Titles of the listed PRs. A list that reached `limit` may be cut off, and a
 * missing promotion PR would make its pattern due again, so that fails.
 *
 * @param {Array<{ title: string }>} prs
 * @param {number} limit
 */
export function titlesOf(prs, limit) {
  if (prs.length >= limit) {
    throw new Error(
      `The promotion-PR list reached the ${limit}-result limit and may be incomplete; raise PROMOTION_PR_LIMIT.`,
    );
  }
  return prs.map(pr => pr.title);
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const injected = readFlag(args, "promotion-prs");
  const { patterns, drifts, problems } = loadPatternInputs({ base: readFlag(args, "base") });
  const titles =
    injected === undefined
      ? promotionTitles()
      : titlesOf(JSON.parse(readFileSync(injected, "utf8")), Number.POSITIVE_INFINITY);
  printJson({ ...countPatterns({ patterns, drifts, promotionTitles: titles }), problems });
  if (problems.length === 0) return 0;
  process.stderr.write(`${problems.map(problem => `- ${problem}`).join("\n")}\n`);
  return 1;
}

runCli(import.meta.url, main);
