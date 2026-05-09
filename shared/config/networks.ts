import type { TokenMetadataDto } from "#shared/types/TokenMetadataDto";

/**
 * Single source of truth for the EVM Networks supported by Wen365.
 * Adding a chain means appending to NETWORKS *and* adding the matching
 * viem chain to APP_KIT_CHAIN_BY_ID in app/config/wagmi.ts. See ADR-0006.
 */
export interface Network {
  alchemySlug: string;
  /** EIP-155 chain ID — the bridge to viem/wagmi */
  chainId: number;
  displayName: string;
  shortName: string;
  iconName: string;
  /** Used as fallback when Alchemy omits native-token metadata */
  nativeToken: TokenMetadataDto;
}

const ETH_LOGO =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

const ETH_NATIVE: TokenMetadataDto = {
  symbol: "ETH",
  name: "Ethereum",
  decimals: 18,
  logo: ETH_LOGO,
};

export const NETWORKS = [
  {
    alchemySlug: "eth-mainnet",
    chainId: 1,
    displayName: "Ethereum",
    shortName: "ETH",
    iconName: "i-token-branded-ethereum",
    nativeToken: ETH_NATIVE,
  },
  {
    alchemySlug: "base-mainnet",
    chainId: 8453,
    displayName: "Base",
    shortName: "BASE",
    iconName: "i-token-branded-base",
    nativeToken: ETH_NATIVE,
  },
  {
    alchemySlug: "arb-mainnet",
    chainId: 42161,
    displayName: "Arbitrum",
    shortName: "ARB",
    iconName: "i-token-branded-arbitrum-one",
    nativeToken: ETH_NATIVE,
  },
  {
    alchemySlug: "opt-mainnet",
    chainId: 10,
    displayName: "Optimism",
    shortName: "OP",
    iconName: "i-token-branded-optimism",
    nativeToken: ETH_NATIVE,
  },
  {
    alchemySlug: "matic-mainnet",
    chainId: 137,
    displayName: "Polygon",
    shortName: "POL",
    iconName: "i-token-branded-polygon",
    nativeToken: {
      symbol: "POL",
      name: "Polygon",
      decimals: 18,
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
    },
  },
] as const satisfies readonly Network[];

export type NetworkId = (typeof NETWORKS)[number]["alchemySlug"];

export const NETWORK_BY_ID: Record<NetworkId, Network> = Object.fromEntries(
  NETWORKS.map(n => [n.alchemySlug, n]),
) as Record<NetworkId, Network>;

export const NETWORK_BY_CHAIN_ID: Record<number, Network> = Object.fromEntries(
  NETWORKS.map(n => [n.chainId, n]),
);
