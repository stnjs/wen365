import { NETWORKS } from "#shared/config/networks";

export const chainToIconMap: Record<NetworkId, string> = Object.fromEntries(
  NETWORKS.map(n => [n.alchemySlug, n.iconName]),
) as Record<NetworkId, string>;

export const networkToNameMap: Record<NetworkId, string> = Object.fromEntries(
  NETWORKS.map(n => [n.alchemySlug, n.displayName]),
) as Record<NetworkId, string>;
