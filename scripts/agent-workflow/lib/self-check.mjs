// @ts-check
import { splitSections } from "./contract.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";

export const CRITERION_STATUSES = ["met", "partial", "not met", "not verified"];

/**
 * @typedef {{ id: string, status: string, evidence: string }} CriterionRow
 * @typedef {{ file: string, kind: string, text: string, justification: string }} GateEntry
 * @typedef {{
 *   frontmatter: Record<string, string> | null,
 *   rows: CriterionRow[],
 *   gateEntries: GateEntry[],
 * }} SelfCheck
 */

const GATE_ENTRY = /^- `([^`]+)` · ([a-z-]+) · (.+?) — justified: (.+)$/;

/**
 * @param {string} text contents of a self-check.md
 * @returns {SelfCheck}
 */
export function parseSelfCheck(text) {
  const parsed = parseFrontmatter(text);
  const sections = splitSections(parsed ? parsed.body : text.replace(/\r\n/g, "\n"));
  return {
    frontmatter: parsed ? parsed.data : null,
    rows: parseRows(sections.get("Criteria") ?? ""),
    gateEntries: parseGateEntries(sections.get("Gate changes") ?? ""),
  };
}

/**
 * Table rows whose first cell is a criterion ID; the header and separator rows are skipped.
 *
 * @param {string} section
 * @returns {CriterionRow[]}
 */
function parseRows(section) {
  /** @type {CriterionRow[]} */
  const rows = [];
  for (const line of section.split("\n")) {
    const inner = /^\|(.*)\|\s*$/.exec(line.trim())?.[1];
    if (inner === undefined) continue;
    // `\|` is an escaped pipe inside a cell, e.g. in a test name.
    const cells = inner.split(/(?<!\\)\|/).map(cell => cell.trim());
    const id = cells[0] ?? "";
    if (!/^AC-\d+$/.test(id)) continue;
    rows.push({
      id,
      status: (cells[1] ?? "").toLowerCase(),
      evidence: cells.slice(2).join(" | ").trim(),
    });
  }
  return rows;
}

/**
 * @param {string} section
 * @returns {GateEntry[]}
 */
function parseGateEntries(section) {
  /** @type {GateEntry[]} */
  const entries = [];
  for (const line of section.split("\n")) {
    const match = GATE_ENTRY.exec(line.trim());
    if (!match) continue;
    entries.push({
      file: match[1] ?? "",
      kind: match[2] ?? "",
      text: unwrapCode(match[3] ?? ""),
      justification: (match[4] ?? "").trim(),
    });
  }
  return entries;
}

/**
 * Removes one Markdown code span around `text`, including longer fences such
 * as ``` `` a`b `` ``` used for text that itself contains backticks.
 *
 * @param {string} text
 */
function unwrapCode(text) {
  const trimmed = text.trim();
  const match = /^(`+) ?([\s\S]*?) ?\1$/.exec(trimmed);
  return match ? (match[2] ?? "") : trimmed;
}
