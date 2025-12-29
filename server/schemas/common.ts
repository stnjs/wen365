import { z } from "zod";
import { isAddress, getAddress } from "viem";

/**
 * Ethereum address schema with validation and checksum normalization
 */
export const EthereumAddressSchema = z
  .string()
  .refine(value => isAddress(value), {
    message: "Invalid Ethereum address format",
  })
  .transform(value => getAddress(value));

/**
 * Wallet address route params schema
 */
export const WalletAddressParamsSchema = z.object({
  walletAddress: EthereumAddressSchema,
});

export type WalletAddressParams = z.infer<typeof WalletAddressParamsSchema>;

/**
 * Pagination query parameters schema with sensible defaults and max bounds
 */
export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

export type Pagination = z.infer<typeof PaginationSchema>;
