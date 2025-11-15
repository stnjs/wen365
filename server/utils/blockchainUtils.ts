import type { AlchemyToken } from "../types";
import { formatUnits } from "viem";
import { roundToTwoDecimals } from "./formatterUtils";

export function convertTokenBalanceToNumber(token: AlchemyToken): number {
  const balanceHex = token.tokenBalance;
  const decimals = token.tokenMetadata.decimals ?? 18;
  const balanceBigInt = BigInt(balanceHex);
  return parseFloat(formatUnits(balanceBigInt, decimals));
}

/**
 * Calculates the USD value of a single token
 * @param token - The Alchemy token object with balance, decimals, and price info
 * @returns The USD value of the token balance
 */
export function calculateTokenUsdValue(token: AlchemyToken): number {
  try {
    const balance = convertTokenBalanceToNumber(token);
    const usdPrice = parseFloat(token.tokenPrices[0]?.value || "0");
    return balance * usdPrice;
  } catch {
    return 0;
  }
}

/**
 * Calculates the total USD value of all tokens in the portfolio
 * @param assets - Array of Alchemy token objects
 * @returns The total USD value of all tokens
 */
export function calculatePortfolioTotalValue(assets: AlchemyToken[]): number {
  const totalValue = assets.reduce((acc, asset) => {
    const tokenValue = calculateTokenUsdValue(asset);
    return acc + tokenValue;
  }, 0);
  return roundToTwoDecimals(totalValue);
}
