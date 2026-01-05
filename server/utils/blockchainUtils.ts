import type { AlchemyToken } from "@server/types/alchemy";
import { formatUnits } from "viem";
import { roundToTwoDecimals } from "./formatterUtils";

/**
 * Convert hex balance to number using token decimals
 * @param balanceHex - Token balance as hex string
 * @param decimals - Number of decimals (defaults to 18 if null)
 * @returns Token balance as decimal number
 */
export function convertTokenBalanceToNumber(balanceHex: string, decimals: number | null): number {
  const balanceBigInt = BigInt(balanceHex);
  return parseFloat(formatUnits(balanceBigInt, decimals ?? 18));
}

/**
 * Extract USD price from token prices array
 * Falls back to first price if USD not found
 * @param tokenPrices - Array of token price objects
 * @returns USD price as number (0 if no prices available)
 */
export function extractUsdPrice(tokenPrices: Array<{ currency: string; value: string }>): number {
  const usdPrice = tokenPrices.find(p => p.currency.toLowerCase() === "usd") || tokenPrices[0];
  return usdPrice ? parseFloat(usdPrice.value) : 0;
}

/**
 * Calculate token value in USD
 * @param balanceHex - Token balance as hex string
 * @param decimals - Number of decimals (defaults to 18 if null)
 * @param tokenPrices - Array of token price objects
 * @returns Token value in USD (0 on error)
 */
export function calculateTokenValue(
  balanceHex: string,
  decimals: number | null,
  tokenPrices: Array<{ currency: string; value: string }>,
): number {
  try {
    const balance = convertTokenBalanceToNumber(balanceHex, decimals);
    const price = extractUsdPrice(tokenPrices);
    return balance * price;
  } catch {
    return 0;
  }
}

/**
 * Convert token balance to number from AlchemyToken object
 * Convenience wrapper for backwards compatibility
 * @param token - Alchemy token object
 * @returns Token balance as decimal number
 */
export function convertTokenBalanceToNumberFromToken(token: AlchemyToken): number {
  return convertTokenBalanceToNumber(token.tokenBalance, token.tokenMetadata.decimals);
}

/**
 * Calculate USD value of a token from AlchemyToken object
 * Convenience wrapper for backwards compatibility
 * @param token - Alchemy token object
 * @returns Token value in USD (0 on error)
 */
export function calculateTokenUsdValue(token: AlchemyToken): number {
  return calculateTokenValue(token.tokenBalance, token.tokenMetadata.decimals, token.tokenPrices);
}

/**
 * Calculates the total USD value of all tokens in the portfolio
 * @param assets - Array of Alchemy token objects
 * @returns The total USD value of all tokens (rounded to 2 decimals)
 */
export function calculatePortfolioTotalValue(assets: AlchemyToken[]): number {
  const totalValue = assets.reduce((acc, asset) => {
    const tokenValue = calculateTokenUsdValue(asset);
    return acc + tokenValue;
  }, 0);
  return roundToTwoDecimals(totalValue);
}
