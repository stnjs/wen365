import type { AlchemyToken } from "../types";
import { formatUnits } from "viem";
import { roundToTwoDecimals } from "./formatterUtils";
/**
 * Calculates the USD value of a single token
 * @param token - The Alchemy token object with balance, decimals, and price info
 * @returns The USD value of the token balance
 */
export const calculateTokenUsdValue = (token: AlchemyToken): number => {
  try {
    // Get the token balance as hex string
    const balanceHex = token.tokenBalance;

    // Default to 18 decimals for native ETH if decimals is null
    const decimals = token.tokenMetadata.decimals ?? 18;

    // Get USD price (default to 0 if not available)
    const usdPrice = parseFloat(token.tokenPrices[0]?.value || "0");

    // Convert hex balance to BigInt
    const balanceBigInt = BigInt(balanceHex);

    // Convert from wei/smallest unit to token units using viem's formatUnits
    const balanceInTokenUnits = parseFloat(
      formatUnits(balanceBigInt, decimals)
    );

    // Calculate USD value: balance * price
    const usdValue = balanceInTokenUnits * usdPrice;

    return usdValue;
  } catch (error) {
    console.error(
      `Error calculating value for token ${token.tokenAddress || "native"}:`,
      error
    );
    return 0;
  }
};

/**
 * Calculates the total USD value of all tokens in the portfolio
 * @param assets - Array of Alchemy token objects
 * @returns The total USD value of all tokens
 */
export const calculatePortfolioTotalValue = (
  assets: AlchemyToken[]
): number => {
  const totalValue = assets.reduce((acc, asset) => {
    const tokenValue = calculateTokenUsdValue(asset);
    return acc + tokenValue;
  }, 0);
  return roundToTwoDecimals(totalValue);
};
