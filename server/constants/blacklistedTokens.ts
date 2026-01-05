import type { BlacklistedToken } from "@server/types/BlacklistedToken";
export const BLACKLISTED_TOKENS: BlacklistedToken[] = [
  {
    network: "matic-mainnet",
    address: "0x0b91b07beb67333225a5ba0259d55aee10e3a578",
    symbol: "MNEP",
  },
] as const;
