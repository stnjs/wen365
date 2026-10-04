// @ts-check
import { realpathSync } from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * True when the module is the file node was started with, so a script can be
 * both imported by tests and run from the command line.
 *
 * @param {string} moduleUrl pass `import.meta.url`
 */
export function isMain(moduleUrl) {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return moduleUrl === pathToFileURL(realpathSync(entry)).href;
}

/** @param {unknown} value */
export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Value following `--<name>` in `args`, or undefined when the flag is absent.
 * Throws when the flag is present without a value.
 *
 * @param {string[]} args
 * @param {string} name
 */
export function readFlag(args, name) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`--${name} needs a value.`);
  return value;
}
