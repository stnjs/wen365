// @ts-check
import { parseContract, splitSections } from "./contract.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { criterionRows, unwrapCode, visibleText } from "./markdown.mjs";

export const DRIFT_PATH = /^docs\/plans\/(?!_template\/)[^/]+\/drift\.md$/;
export const DRIFT_RESULTS = [
  "delivered",
  "amended",
  "dropped",
  "weakened",
  "substituted",
  "unverified",
];
export const CLEAN_RESULTS = ["delivered", "amended"];
export const DRIFT_SECTIONS = ["Added", "Corrections", "Self-caught", "Friction"];
const DRIFT_PATHS = ["full", "small"];
const ENTRY = /^- (.*?)\s*→ `([a-z0-9]+(?:-[a-z0-9]+)*)`$/;

/**
 * @typedef {{ id: string, result: string, slug: string }} DriftRow
 * @typedef {{ section: string, text: string, slug: string }} DriftEntry
 * @typedef {{
 *   frontmatter: Record<string, string> | null,
 *   pr: number | null,
 *   path: string,
 *   rows: DriftRow[],
 *   entries: DriftEntry[],
 *   unreadable: Array<{ section: string, line: string }>,
 * }} Drift
 */

/**
 * @param {string} text contents of a drift.md
 * @returns {Drift}
 */
export function parseDrift(text) {
  const parsed = parseFrontmatter(text);
  const data = parsed?.data ?? {};
  const sections = splitSections(parsed ? parsed.body : text.replace(/\r\n/g, "\n"));
  const contract = criterionRows(sections.get("Contract") ?? "");
  /** @type {Array<{ section: string, line: string }>} */
  const unreadable = contract.unreadable.map(line => ({ section: "Contract", line }));
  /** @type {DriftEntry[]} */
  const entries = [];
  for (const section of DRIFT_SECTIONS) {
    for (const raw of visibleText(sections.get(section) ?? "").split("\n")) {
      const line = raw.trim();
      if (line === "" || line === "None.") continue;
      if (!line.startsWith("- ")) {
        unreadable.push({ section, line });
        continue;
      }
      const match = ENTRY.exec(line);
      entries.push(
        match
          ? { section, text: match[1] ?? "", slug: match[2] ?? "" }
          : { section, text: line.slice(2), slug: "" },
      );
    }
  }
  return {
    frontmatter: parsed ? data : null,
    pr: /^\d+$/.test(data.pr ?? "") ? Number(data.pr) : null,
    path: data.path ?? "",
    rows: contract.rows.map(cells => ({
      id: cells[0] ?? "",
      result: (cells[1] ?? "").toLowerCase(),
      slug: unwrapCode(cells[2] ?? ""),
    })),
    entries,
    unreadable,
  };
}

/**
 * Every pattern slug the drift cites, once each, sorted.
 *
 * @param {Drift} report
 */
export function driftSlugs(report) {
  const slugs = [...report.rows.map(row => row.slug), ...report.entries.map(entry => entry.slug)];
  return [...new Set(slugs.filter(slug => slug !== ""))].sort();
}

/**
 * Problems in a drift.md; empty when valid. Full-path drift is checked
 * against its contract; small-path drift may only record corrections.
 *
 * @param {{ drift: string, contract: string | null, knownSlugs: Set<string> }} input
 * @returns {string[]}
 */
export function lintDrift({ drift, contract, knownSlugs }) {
  const report = parseDrift(drift);
  if (report.frontmatter === null) {
    return ["Missing frontmatter: the file must start with a `---` block."];
  }
  /** @type {string[]} */
  const problems = [];
  if (report.pr === null) problems.push("Frontmatter `pr` must be the pull request number.");
  if (!DRIFT_PATHS.includes(report.path)) {
    problems.push(`Frontmatter \`path\` must be full or small; got "${report.path}".`);
  }
  for (const { section, line } of report.unreadable) {
    problems.push(`Could not read this line under ## ${section}: "${line}"`);
  }

  if (report.path === "full") {
    if (contract === null) problems.push("Full-path drift needs the contract in the same folder.");
    else
      problems.push(
        ...contractProblems(
          report.rows,
          parseContract(contract).criteria.map(c => c.id),
        ),
      );
  }
  if (report.path === "small") {
    if (report.rows.length > 0) problems.push("Small-path drift has no ## Contract rows.");
    for (const section of DRIFT_SECTIONS.filter(name => name !== "Corrections")) {
      if (report.entries.some(entry => entry.section === section)) {
        problems.push(
          `Small-path drift only records ## Corrections; found entries under ## ${section}.`,
        );
      }
    }
  }

  for (const entry of report.entries) {
    if (entry.slug === "") {
      problems.push(
        `Entry under ## ${entry.section} must be one line ending in → \`slug\`: "${entry.text}"`,
      );
    }
  }
  for (const slug of driftSlugs(report)) {
    if (!knownSlugs.has(slug)) {
      problems.push(
        `Unknown pattern slug \`${slug}\`: add docs/patterns/${slug}.md or reuse an existing slug.`,
      );
    }
  }
  return problems;
}

/**
 * @param {DriftRow[]} rows
 * @param {string[]} criterionIds
 */
function contractProblems(rows, criterionIds) {
  /** @type {string[]} */
  const problems = [];
  /** @type {Map<string, DriftRow>} */
  const byId = new Map();
  for (const row of rows) {
    if (byId.has(row.id)) problems.push(`${row.id} is listed twice in ## Contract.`);
    byId.set(row.id, row);
    if (!criterionIds.includes(row.id))
      problems.push(`${row.id} is not a criterion in the contract.`);
  }
  for (const id of criterionIds) {
    const row = byId.get(id);
    if (row === undefined) {
      problems.push(`${id} is missing from ## Contract.`);
    } else if (!DRIFT_RESULTS.includes(row.result)) {
      problems.push(
        `${id} result must be one of ${DRIFT_RESULTS.join(", ")}; got "${row.result}".`,
      );
    } else if (CLEAN_RESULTS.includes(row.result) && row.slug !== "") {
      problems.push(`${id} is ${row.result} and takes no pattern slug.`);
    } else if (!CLEAN_RESULTS.includes(row.result) && row.slug === "") {
      problems.push(`${id} is ${row.result} and needs a pattern slug.`);
    }
  }
  return problems;
}
