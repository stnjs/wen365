/**
 * Formats a number as a currency string.
 *
 * @param value - The numeric value to format
 * @param options - Intl.NumberFormatOptions
 * @returns A formatted currency string
 */
export const formatCurrency = (
  value: number,
  options: Intl.NumberFormatOptions = {}
) => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat("en-US", defaultOptions).format(value);
};

/**
 * Formats a number with consistent locale settings.
 *
 * @param value - The number to format
 * @param options - Intl.NumberFormatOptions
 * @returns A formatted number string
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
) => {
  return new Intl.NumberFormat("en-US", options).format(value);
};

/**
 * Formats a percentage value.
 *
 * @param value - The number to format (e.g. 0.452 or 45.2)
 * @param isDecimal - Whether the input is a decimal (0.452) or whole number (45.2)
 * @returns A formatted percentage string
 */
export const formatPercent = (value: number, isDecimal = false) => {
  const num = isDecimal ? value : value / 100;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
};

/**
 * Formats a token balance with appropriate precision based on the amount.
 *
 * @param balance - The numeric balance to format
 * @returns A formatted balance string
 */
export const formatBalance = (balance: number): string => {
  if (balance === 0) return "0";
  if (balance < 0.0001) return balance.toExponential(2);
  if (balance < 1) return balance.toFixed(6);
  if (balance < 1000) return balance.toFixed(4);
  return balance.toFixed(2);
};
