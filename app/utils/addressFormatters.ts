/**
 * Truncates an address (or any long identifier) by collapsing the middle.
 *
 * Defaults to keeping the first 8 and last 6 characters, joined by "..." —
 * suitable for displaying EVM contract addresses in dense UI cells.
 *
 * If the input is shorter than (or equal in length to) what the truncated
 * form would be, it is returned unchanged so the caller never trades clarity
 * for visual consistency.
 *
 * @param address - The address (or arbitrary string) to truncate.
 * @param options.leading - How many leading characters to keep. Default 8.
 * @param options.trailing - How many trailing characters to keep. Default 6.
 * @param options.separator - Separator placed between the slices. Default "...".
 * @returns The truncated representation, or the original string when no
 * truncation would shorten it.
 */
export const truncateAddress = (
  address: string,
  options: { leading?: number; trailing?: number; separator?: string } = {},
): string => {
  const { leading = 8, trailing = 6, separator = "..." } = options;
  if (address.length <= leading + trailing + separator.length) {
    return address;
  }
  return `${address.slice(0, leading)}${separator}${address.slice(-trailing)}`;
};
