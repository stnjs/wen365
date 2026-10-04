// @ts-check

/**
 * Reads the leading `---` block of a Markdown file. Supports flat `key: value`
 * lines only; every value is a string. Unquoted values drop a trailing
 * ` # comment` (a `#` followed by whitespace); quoted values are returned
 * without their quotes. Empty values become "". Line endings are normalised
 * to "\n" in the returned body.
 *
 * @param {string} text
 * @returns {{ data: Record<string, string>, body: string } | null} null when there is no block
 */
export function parseFrontmatter(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  /** @type {Record<string, string>} */
  const data = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (match?.[1] === undefined) continue;
    data[match[1]] = parseValue(match[2] ?? "");
  }
  return { data, body: lines.slice(end + 1).join("\n") };
}

/** @param {string} raw */
function parseValue(raw) {
  const value = raw.trim();
  const quote = value[0];
  if (quote === '"' || quote === "'") {
    const close = value.indexOf(quote, 1);
    if (close !== -1) return value.slice(1, close);
  }
  // A comment is `#` followed by whitespace or the end, so `Fix #5` keeps its `#5`.
  return value.replace(/(^|\s)#(?=\s|$).*$/, "").trim();
}
