// @ts-check
import { splitSections } from "./contract.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { criterionRows, unwrapCode, visibleText } from "./markdown.mjs";

export const CRITERION_STATUSES = ["met", "partial", "not met", "not verified"];

/**
 * @typedef {{ id: string, status: string, evidence: string }} CriterionRow
 * @typedef {{ file: string, kind: string, text: string, justification: string }} GateEntry
 * @typedef {{
 *   frontmatter: Record<string, string> | null,
 *   rows: CriterionRow[],
 *   gateEntries: GateEntry[],
 *   unreadable: Array<{ section: string, line: string }>,
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
  const criteria = criterionRows(sections.get("Criteria") ?? "");
  const gate = parseGateEntries(sections.get("Gate changes") ?? "");
  return {
    frontmatter: parsed ? parsed.data : null,
    rows: criteria.rows.map(cells => ({
      id: cells[0] ?? "",
      status: (cells[1] ?? "").toLowerCase(),
      evidence: cells.slice(2).join(" | ").trim(),
    })),
    gateEntries: gate.entries,
    unreadable: [
      ...criteria.unreadable.map(line => ({ section: "Criteria", line })),
      ...gate.unreadable.map(line => ({ section: "Gate changes", line })),
    ],
  };
}

/**
 * Bullet lines in `## Gate changes`; a bullet that doesn't match the entry
 * format is returned in `unreadable`.
 *
 * @param {string} section
 * @returns {{ entries: GateEntry[], unreadable: string[] }}
 */
function parseGateEntries(section) {
  /** @type {GateEntry[]} */
  const entries = [];
  /** @type {string[]} */
  const unreadable = [];
  for (const raw of visibleText(section).split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const match = GATE_ENTRY.exec(line);
    if (!match) {
      unreadable.push(line);
      continue;
    }
    entries.push({
      file: match[1] ?? "",
      kind: match[2] ?? "",
      text: unwrapCode(match[3] ?? ""),
      justification: (match[4] ?? "").trim(),
    });
  }
  return { entries, unreadable };
}
