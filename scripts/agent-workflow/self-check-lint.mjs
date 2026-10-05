// @ts-check
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { findGateChanges } from "./gate-changes.mjs";
import { readFlag, runCli } from "./lib/cli.mjs";
import { amendedCriteria, parseContract } from "./lib/contract.mjs";
import { repoRoot } from "./lib/git.mjs";
import { CRITERION_STATUSES, parseSelfCheck } from "./lib/self-check.mjs";
import { findPlan } from "./plan.mjs";

/** @typedef {import("./gate-changes.mjs").GateChange} GateChange */

/**
 * Checks a self-check against its contract and the branch's gate changes.
 * Problems fail the self-check; warnings are reported but pass.
 *
 * @param {{ selfCheck: string, contract: string, gateChanges: GateChange[] }} input
 * @returns {{ problems: string[], warnings: string[] }}
 */
export function lintSelfCheck({ selfCheck, contract, gateChanges }) {
  const report = parseSelfCheck(selfCheck);
  const parsedContract = parseContract(contract);
  const amended = amendedCriteria(parsedContract.sections.get("Amendments") ?? "");
  const criterionIds = new Set(parsedContract.criteria.map(criterion => criterion.id));

  /** @type {string[]} */
  const problems = [];
  /** @type {string[]} */
  const warnings = [];

  for (const { section, line } of report.unreadable) {
    problems.push(`Could not read this line under ## ${section}: "${line}"`);
  }

  /** @type {Map<string, import("./lib/self-check.mjs").CriterionRow>} */
  const rows = new Map();
  for (const row of report.rows) {
    if (rows.has(row.id)) problems.push(`${row.id} is listed twice in ## Criteria.`);
    rows.set(row.id, row);
    if (!criterionIds.has(row.id)) problems.push(`${row.id} is not a criterion in the contract.`);
  }

  for (const { id } of parsedContract.criteria) {
    const row = rows.get(id);
    if (row === undefined) {
      problems.push(`${id} is missing from ## Criteria.`);
    } else if (!CRITERION_STATUSES.includes(row.status)) {
      problems.push(
        `${id} status must be one of ${CRITERION_STATUSES.join(", ")}; got "${row.status}".`,
      );
    } else if (row.status === "met" && row.evidence === "") {
      problems.push(`${id} is met but names no evidence.`);
    } else if ((row.status === "not met" || row.status === "partial") && !amended.has(id)) {
      problems.push(`${id} is ${row.status} and no amendment covers it.`);
    } else if (row.status === "not verified") {
      warnings.push(`${id} is not verified: ${row.evidence || "no reason given"}.`);
    }
  }

  for (const change of gateChanges) {
    const justified = report.gateEntries.some(
      entry =>
        entry.file === change.file &&
        entry.kind === change.kind &&
        entry.text === change.text &&
        entry.justification !== "",
    );
    if (!justified) {
      problems.push(
        `Gate change not justified under ## Gate changes: \`${change.file}\` · ${change.kind} · ${change.text}`,
      );
    }
  }
  return { problems, warnings };
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const base = readFlag(args, "base");
  const plan = findPlan({ base });
  const root = repoRoot(process.cwd());
  const relative = `${plan.folder}/self-check.md`;
  if (!existsSync(join(root, relative))) {
    process.stderr.write(`${relative} does not exist. Run /wen-self-check.\n`);
    return 1;
  }
  const { problems, warnings } = lintSelfCheck({
    selfCheck: readFileSync(join(root, relative), "utf8"),
    contract: readFileSync(join(root, plan.contractPath), "utf8"),
    gateChanges: findGateChanges({ base }),
  });
  const warningLines = warnings.map(warning => `warning: ${warning}\n`).join("");
  if (problems.length > 0) {
    process.stderr.write(`${relative}:\n${problems.map(problem => `- ${problem}`).join("\n")}\n`);
    process.stdout.write(warningLines);
    return 1;
  }
  process.stdout.write(`${relative}: ok\n${warningLines}`);
  return 0;
}

runCli(import.meta.url, main);
