import { z } from "zod";

/**
 * Valid network identifiers
 */
export const NETWORK_IDS = [
  "eth-mainnet",
  "matic-mainnet",
  "base-mainnet",
  "arb-mainnet",
  "opt-mainnet",
  "zksync-mainnet",
  "avax-mainnet",
  "linea-mainnet",
  "scroll-mainnet",
  "bnb-mainnet",
] as const;

/**
 * Zod schema for NetworkId
 */
export const NetworkIdSchema = z.enum(NETWORK_IDS);
export type NetworkId = (typeof NETWORK_IDS)[number];
