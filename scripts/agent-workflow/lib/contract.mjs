// @ts-check
import { parseFrontmatter } from "./frontmatter.mjs";

export const CONTRACT_TYPES = ["feat", "fix", "refactor"];
export const CONTRACT_STATUSES = ["draft", "approved"];
export const VERIFY_KINDS = ["test", "command", "screenshot", "manual"];
export const REQUIRED_SECTIONS = ["Goal", "Acceptance criteria", "Out of scope", "Amendments"];

/**
 * @typedef {{ kind: string, detail: string }} Verify
 * @typedef {{ id: string, number: number, text: string, verify: Verify | null }} Criterion
 * @typedef {{
 *   frontmatter: Record<string, string> | null,
 *   sections: Map<string, string>,
 *   criteria: Criterion[],
 *   hasAmendments: boolean,
 * }} Contract
 */

/**
 * @param {string} text contents of a contract.md
 * @returns {Contract}
 */
export function parseContract(text) {
  const parsed = parseFrontmatter(text);
  const body = parsed ? parsed.body : text.replace(/\r\n/g, "\n");
  const sections = splitSections(body);
  return {
    frontmatter: parsed ? parsed.data : null,
    sections,
    criteria: parseCriteria(sections.get("Acceptance criteria") ?? ""),
    hasAmendments: stripComments(sections.get("Amendments") ?? "") !== "",
  };
}

/**
 * Splits Markdown into `## Heading` → trimmed content. Text before the first
 * heading is dropped.
 *
 * @param {string} body
 * @returns {Map<string, string>}
 */
export function splitSections(body) {
  /** @type {Map<string, string>} */
  const sections = new Map();
  /** @type {string | null} */
  let heading = null;
  /** @type {string[]} */
  let buffer = [];
  const flush = () => {
    if (heading !== null) sections.set(heading, buffer.join("\n").trim());
  };
  for (const line of body.split("\n")) {
    const match = /^## (.+?)\s*$/.exec(line);
    if (match?.[1] !== undefined) {
      flush();
      heading = match[1];
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

/**
 * Criteria are top-level `- **AC-n:** text` bullets. The first nested
 * `- Verify: <kind> — <detail>` line under a criterion is its verification
 * (`**Verify:**` in bold is accepted too).
 *
 * @param {string} section
 * @returns {Criterion[]}
 */
export function parseCriteria(section) {
  /** @type {Criterion[]} */
  const criteria = [];
  for (const line of section.split("\n")) {
    const criterion = /^- \*\*AC-(\d+):\*\*(.*)$/.exec(line);
    if (criterion) {
      const number = Number(criterion[1]);
      criteria.push({
        id: `AC-${number}`,
        number,
        text: (criterion[2] ?? "").trim(),
        verify: null,
      });
      continue;
    }
    const verify = /^\s+- (?:\*\*)?Verify:(?:\*\*)?\s*([A-Za-z]+)\s*[—–-]?\s*(.*)$/.exec(line);
    const current = criteria.at(-1);
    if (verify && current && current.verify === null) {
      current.verify = { kind: (verify[1] ?? "").toLowerCase(), detail: (verify[2] ?? "").trim() };
    }
  }
  return criteria;
}

/** @param {string} text */
function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "").trim();
}
