import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { NETWORKS } from "#shared/config/networks";

// Adding a chain to the shared registry requires adding the matching
// viem/AppKit chain here — the only client-side coupling to viem chains.
const APP_KIT_CHAIN_BY_ID: Record<number, AppKitNetwork> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [polygon.id]: polygon,
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = NETWORKS.map(n => {
  const chain = APP_KIT_CHAIN_BY_ID[n.chainId];
  if (!chain) {
    throw new Error(
      `wagmi.ts: missing AppKitNetwork for chainId ${n.chainId} (${n.alchemySlug}). ` +
        `Add the import to APP_KIT_CHAIN_BY_ID.`,
    );
  }
  return chain;
}) as [AppKitNetwork, ...AppKitNetwork[]];
