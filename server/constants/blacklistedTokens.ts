import type { BlacklistedToken } from "@server/types/tokens";
export const BLACKLISTED_TOKENS: BlacklistedToken[] = [
  {
    network: "matic-mainnet",
    address: "0x0b91b07beb67333225a5ba0259d55aee10e3a578",
    symbol: "MNEP",
  },
  {
    network: "base-mainnet",
    address: "0x7e3bc46884146a93e10f1ff4ad25355b4aca8d7a",
  },
] as const;
