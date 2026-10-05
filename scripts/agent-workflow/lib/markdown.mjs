// @ts-check
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Removes every `open … close` block from `text` by scanning, not with a
 * regex. Without `nested`, a block ends at the first `close`, as an HTML
 * comment does; with `nested`, inner `open`s are counted (for `<details>`).
 * An unclosed block hides the rest of the text, as it does when rendered.
 *
 * @param {string} text
 * @param {string} open
 * @param {string} close
 * @param {boolean} [nested]
 */
export function removeBlocks(text, open, close, nested = false) {
  let kept = "";
  let depth = 0;
  let index = 0;
  while (index < text.length) {
    if (depth === 0) {
      const start = text.indexOf(open, index);
      if (start === -1) {
        kept += text.slice(index);
        break;
      }
      kept += text.slice(index, start);
      depth = 1;
      index = start + open.length;
      continue;
    }
    const end = text.indexOf(close, index);
    if (end === -1) break;
    const inner = nested ? text.indexOf(open, index) : -1;
    if (inner !== -1 && inner < end) {
      depth++;
      index = inner + open.length;
    } else {
      depth--;
      index = end + close.length;
    }
  }
  return kept;
}

/**
 * Text outside `<!-- … -->`.
 *
 * @param {string} text
 */
export function visibleText(text) {
  return removeBlocks(text, "<!--", "-->");
}

/**
 * Removes one Markdown code span around `text`, including longer fences such
 * as ``` `` a`b `` ``` used for text that itself contains backticks.
 *
 * @param {string} text
 */
export function unwrapCode(text) {
  const trimmed = text.trim();
  const match = /^(`+) ?([\s\S]*?) ?\1$/.exec(trimmed);
  return match ? (match[2] ?? "") : trimmed;
}

/**
 * Table rows whose first cell is a criterion ID (`AC-n`), as trimmed cells.
 * Lines that mention a criterion but aren't such a row are returned in
 * `unreadable`. `\|` inside a cell is an escaped pipe.
 *
 * @param {string} section
 * @returns {{ rows: string[][], unreadable: string[] }}
 */
export function criterionRows(section) {
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  const unreadable = [];
  for (const raw of visibleText(section).split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    const inner = /^\|(.*)\|$/.exec(line)?.[1];
    const cells = inner === undefined ? null : inner.split(/(?<!\\)\|/).map(cell => cell.trim());
    if (cells !== null && /^AC-\d+$/.test(cells[0] ?? "")) rows.push(cells);
    else if (/\bAC-\d+\b/i.test(line)) unreadable.push(line);
  }
  return { rows, unreadable };
}

/**
 * Repo-relative paths of the Markdown files directly inside `dir`, sorted.
 *
 * @param {string} root
 * @param {string} dir repo-relative directory
 */
export function listMarkdown(root, dir) {
  if (!existsSync(join(root, dir))) return [];
  return readdirSync(join(root, dir))
    .filter(name => name.endsWith(".md"))
    .sort()
    .map(name => `${dir}/${name}`);
}
