import { z } from "zod";
import { NETWORKS, type NetworkId } from "#shared/config/networks";

// Re-exported here so Nuxt 4 auto-imports `NetworkId` everywhere.
export type { NetworkId };

// Tuple-typed so z.enum accepts it.
export const NETWORK_IDS = NETWORKS.map(n => n.alchemySlug) as [
  NetworkId,
  ...NetworkId[],
];

export const NetworkIdSchema = z.enum(NETWORK_IDS);
