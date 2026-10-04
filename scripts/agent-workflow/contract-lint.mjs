// @ts-check
import { readFileSync } from "node:fs";
import process from "node:process";
import { isMain } from "./lib/cli.mjs";
import {
  CONTRACT_STATUSES,
  CONTRACT_TYPES,
  REQUIRED_SECTIONS,
  VERIFY_KINDS,
  parseContract,
} from "./lib/contract.mjs";

export const MIN_CRITERIA = 3;
export const MAX_CRITERIA = 8;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Structural problems in a contract; empty when it is well-formed. Judgement
 * (is a criterion clear, complete, feasible) belongs to /wen-contract-review.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function lintContract(text) {
  const contract = parseContract(text);
  const fm = contract.frontmatter;
  if (fm === null) return ["Missing frontmatter: the file must start with a `---` block."];

  /** @type {string[]} */
  const problems = [];
  if (!fm.title) problems.push("Frontmatter `title` is empty.");
  if (!CONTRACT_TYPES.includes(fm.type ?? "")) {
    problems.push(
      `Frontmatter \`type\` must be one of ${CONTRACT_TYPES.join(", ")}; got "${fm.type ?? ""}".`,
    );
  }
  if (!CONTRACT_STATUSES.includes(fm.status ?? "")) {
    problems.push(
      `Frontmatter \`status\` must be one of ${CONTRACT_STATUSES.join(", ")}; got "${fm.status ?? ""}".`,
    );
  }
  const approved = fm.approved ?? "";
  if (fm.status === "approved" && !isCalendarDate(approved)) {
    problems.push("Frontmatter `approved` must be a YYYY-MM-DD date when `status` is approved.");
  }
  if (fm.status === "draft" && approved !== "") {
    problems.push(
      "Frontmatter `approved` is set but `status` is draft; the date is written only on approval.",
    );
  }

  for (const name of REQUIRED_SECTIONS) {
    if (!contract.sections.has(name)) problems.push(`Missing section \`## ${name}\`.`);
  }
  if (contract.sections.get("Goal") === "") problems.push("`## Goal` is empty.");

  const { criteria } = contract;
  if (criteria.length < MIN_CRITERIA || criteria.length > MAX_CRITERIA) {
    problems.push(
      `Expected ${MIN_CRITERIA}–${MAX_CRITERIA} acceptance criteria; found ${criteria.length}. More than ${MAX_CRITERIA} means the work should be split.`,
    );
  }
  criteria.forEach((criterion, index) => {
    if (criterion.number !== index + 1) {
      problems.push(
        `Criteria must be numbered AC-1, AC-2, … in order; position ${index + 1} is ${criterion.id}.`,
      );
    }
    if (criterion.text === "") problems.push(`${criterion.id} has no text.`);
    if (criterion.verify === null) {
      problems.push(
        criterion.unparsedVerify === null
          ? `${criterion.id} has no \`Verify:\` line.`
          : `${criterion.id} has a Verify line that can't be read: "${criterion.unparsedVerify}". Expected an indented "- Verify: <kind> — <detail>".`,
      );
    } else if (!VERIFY_KINDS.includes(criterion.verify.kind)) {
      problems.push(
        `${criterion.id} Verify kind must be one of ${VERIFY_KINDS.join(", ")}; got "${criterion.verify.kind}".`,
      );
    } else if (criterion.verify.detail === "") {
      problems.push(
        `${criterion.id} Verify line names the kind (${criterion.verify.kind}) but not what to check.`,
      );
    }
  });

  const firstText = criteria[0]?.text ?? "";
  if (fm.type === "fix" && !/regression test/i.test(firstText)) {
    problems.push(
      "A `fix` contract's AC-1 must be a regression test that fails before the fix and passes after.",
    );
  }
  if (fm.type === "refactor" && !/existing tests pass without (being )?modifi/i.test(firstText)) {
    problems.push(
      'A `refactor` contract\'s AC-1 must be "Existing tests pass without modification".',
    );
  }
  return problems;
}

/** @param {string} value */
function isCalendarDate(value) {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const path = args[0];
  if (path === undefined) {
    process.stderr.write(
      "Usage: node scripts/agent-workflow/contract-lint.mjs <path/to/contract.md>\n",
    );
    return 1;
  }
  /** @type {string} */
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "unknown error";
    process.stderr.write(`${path}: cannot read (${code})\n`);
    return 1;
  }
  const problems = lintContract(text);
  if (problems.length > 0) {
    process.stderr.write(`${path}:\n${problems.map(problem => `- ${problem}`).join("\n")}\n`);
    return 1;
  }
  process.stdout.write(`${path}: ok\n`);
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
