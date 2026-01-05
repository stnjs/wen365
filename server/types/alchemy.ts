/**
 * Zod schemas for Alchemy API responses
 * Validates external API data and transforms to internal DTOs
 */
import { z } from "zod";
import { NetworkIdSchema } from "#shared/types/NetworkId";
import {
  convertTokenBalanceToNumber,
  extractUsdPrice,
  calculateTokenValue,
} from "@server/utils/blockchainUtils";

/**
 * Token price information schema
 */
const AlchemyTokenPriceSchema = z.object({
  currency: z.string(),
  value: z.string(),
  lastUpdatedAt: z.string(),
});

/**
 * Token metadata schema
 */
const AlchemyTokenMetadataSchema = z.object({
  symbol: z.string().nullable(),
  decimals: z.number().nullable(),
  name: z.string().nullable(),
  logo: z.string().nullable(),
});

/**
 * Raw Alchemy token schema (before transformation)
 */
export const AlchemyTokenSchema = z.object({
  address: z.string(),
  network: NetworkIdSchema,
  tokenAddress: z.string().nullable(),
  tokenBalance: z.string(),
  tokenMetadata: AlchemyTokenMetadataSchema,
  tokenPrices: z.array(AlchemyTokenPriceSchema),
});

/**
 * Inferred type for raw Alchemy token (replaces manual interface)
 */
export type AlchemyToken = z.infer<typeof AlchemyTokenSchema>;

/**
 * Inferred type for Alchemy token metadata
 */
export type AlchemyTokenMetadata = z.infer<typeof AlchemyTokenMetadataSchema>;

/**
 * Transform schema: AlchemyToken -> TokenDto
 * Validates and transforms in one step
 */
export const TokenDtoFromAlchemySchema = AlchemyTokenSchema.transform(
  (raw): TokenDto => ({
    network: raw.network,
    tokenAddress: raw.tokenAddress,
    tokenBalance: convertTokenBalanceToNumber(raw.tokenBalance, raw.tokenMetadata.decimals),
    tokenMetadata: {
      symbol: raw.tokenMetadata.symbol,
      decimals: raw.tokenMetadata.decimals,
      name: raw.tokenMetadata.name,
      logo: raw.tokenMetadata.logo,
    },
    tokenPrice: extractUsdPrice(raw.tokenPrices),
    tokenValue: calculateTokenValue(raw.tokenBalance, raw.tokenMetadata.decimals, raw.tokenPrices),
    percentage: 0, // Calculated later by service
  }),
);

/**
 * Alchemy API response data schema
 */
const AlchemyTokensDataSchema = z.object({
  tokens: z.array(AlchemyTokenSchema),
  pageKey: z.string().nullable(),
});

/**
 * Complete Alchemy API response schema
 */
export const AlchemyTokensByAddressResponseSchema = z.object({
  data: AlchemyTokensDataSchema,
});

/**
 * Inferred type for Alchemy API response
 */
export type AlchemyTokensByAddressResponse = z.infer<typeof AlchemyTokensByAddressResponseSchema>;

/**
 * Parses and validates an array of raw Alchemy tokens, transforming them to TokenDtos
 */
export function parseAlchemyTokens(tokens: unknown[]): TokenDto[] {
  return tokens.map(token => TokenDtoFromAlchemySchema.parse(token));
}

/**
 * Validates an Alchemy API response
 */
export function parseAlchemyResponse(response: unknown): AlchemyTokensByAddressResponse {
  return AlchemyTokensByAddressResponseSchema.parse(response);
}
