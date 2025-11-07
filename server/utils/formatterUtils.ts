/**
 * Formats a number to 2 decimal places
 * @param num - The number to format
 * @returns The number rounded to 2 decimal places
 * @example roundToTwoDecimals(23.1253215) // returns 23.13
 */
export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};
