import type { NetworkId } from "#shared/types/NetworkId";
import type { AlchemyTokenMetadata } from "@server/types/alchemy";

/**
 * Native token metadata by network
 * Used as fallback when Alchemy doesn't provide metadata for native tokens
 * Networks not listed here will fallback to DEFAULT_ETH_METADATA
 */
export const NATIVE_TOKENS: Partial<Record<NetworkId, AlchemyTokenMetadata>> = {
  "matic-mainnet": {
    symbol: "MATIC",
    decimals: 18,
    name: "Polygon",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
  },
  "avax-mainnet": {
    symbol: "AVAX",
    decimals: 18,
    name: "Avalanche",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
  },
  "bnb-mainnet": {
    symbol: "BNB",
    decimals: 18,
    name: "BNB",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
  },
};

/**
 * Default ETH metadata used as fallback for any network not in NATIVE_TOKENS
 */
export const DEFAULT_ETH_METADATA: AlchemyTokenMetadata = {
  symbol: "ETH",
  decimals: 18,
  name: "Ethereum",
  logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
};
