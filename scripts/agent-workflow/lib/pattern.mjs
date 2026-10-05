// @ts-check
import { parseFrontmatter } from "./frontmatter.mjs";
import { visibleText } from "./markdown.mjs";

export const PATTERN_TARGETS = ["lint", "prose"];
export const PATTERN_STATUSES = ["watching", "promoted", "rejected"];
/** Distinct PRs a watching pattern needs before it is due for promotion. */
/** @type {Record<string, number>} */
export const PROMOTION_THRESHOLDS = { lint: 2, prose: 3 };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @typedef {{
 *   slug: string,
 *   target: string,
 *   status: string,
 *   promotedTo: string,
 *   rejectedReason: string,
 * }} Pattern
 */

/**
 * @param {string} text contents of docs/patterns/<slug>.md
 * @returns {Pattern}
 */
export function parsePattern(text) {
  const data = parseFrontmatter(text)?.data ?? {};
  return {
    slug: data.slug ?? "",
    target: data.target ?? "",
    status: data.status ?? "",
    promotedTo: data["promoted-to"] ?? "",
    rejectedReason: data["rejected-reason"] ?? "",
  };
}

/**
 * Problems in a pattern file named `<fileSlug>.md`; empty when valid.
 *
 * @param {string} text
 * @param {string} fileSlug the file name without `.md`
 * @param {(path: string) => boolean} exists whether a repo-relative path exists
 * @returns {string[]}
 */
export function lintPattern(text, fileSlug, exists) {
  const parsed = parseFrontmatter(text);
  if (parsed === null) return ["Missing frontmatter: the file must start with a `---` block."];
  const pattern = parsePattern(text);
  /** @type {string[]} */
  const problems = [];
  if (!SLUG.test(pattern.slug))
    problems.push(`\`slug\` must be kebab-case; got "${pattern.slug}".`);
  else if (pattern.slug !== fileSlug) {
    problems.push(`\`slug\` (${pattern.slug}) must match the file name (${fileSlug}.md).`);
  }
  if (!PATTERN_TARGETS.includes(pattern.target)) {
    problems.push(
      `\`target\` must be one of ${PATTERN_TARGETS.join(", ")}; got "${pattern.target}".`,
    );
  }
  if (!PATTERN_STATUSES.includes(pattern.status)) {
    problems.push(
      `\`status\` must be one of ${PATTERN_STATUSES.join(", ")}; got "${pattern.status}".`,
    );
  }
  if (pattern.status === "promoted" && (pattern.promotedTo === "" || !exists(pattern.promotedTo))) {
    problems.push(
      `\`promoted-to\` must name an existing file when \`status\` is promoted; got "${pattern.promotedTo}".`,
    );
  }
  if (pattern.status === "rejected" && pattern.rejectedReason === "") {
    problems.push("`rejected-reason` is required when `status` is rejected.");
  }
  if (visibleText(parsed.body).trim() === "")
    problems.push("Describe the pattern below the frontmatter.");
  return problems;
}

/**
 * Patterns that self-check and code review check by hand: watching ones, and
 * promoted ones whose rule lives in prose (a Markdown file).
 *
 * @param {Pattern} pattern
 */
export function isCheckedByHand(pattern) {
  if (pattern.status === "watching") return true;
  return pattern.status === "promoted" && pattern.promotedTo.endsWith(".md");
}
