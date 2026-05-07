import { NETWORK_BY_ID, NETWORKS, type NetworkId } from "#shared/config/networks";
import { logWarn } from "@server/utils/logger";

const ALL_SUPPORTED_NETWORK_IDS: readonly NetworkId[] = NETWORKS.map(
  n => n.alchemySlug,
);

/**
 * Defaults to the full registry. `SUPPORTED_NETWORKS=eth-mainnet,base-mainnet`
 * narrows the active set — useful for keeping Alchemy compute units low in
 * dev/staging. Unknown slugs are warned and skipped; an all-invalid env var
 * falls back to the full registry rather than failing closed.
 */
function parseSupportedNetworks(): NetworkId[] {
  const envValue = process.env.SUPPORTED_NETWORKS;

  if (!envValue) {
    return [...ALL_SUPPORTED_NETWORK_IDS];
  }

  const candidates = envValue
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const valid: NetworkId[] = [];
  const invalid: string[] = [];

  for (const slug of candidates) {
    if (slug in NETWORK_BY_ID) {
      valid.push(slug as NetworkId);
    } else {
      invalid.push(slug);
    }
  }

  if (invalid.length > 0) {
    logWarn("Unknown SUPPORTED_NETWORKS entries ignored", {
      invalid,
      validOptions: ALL_SUPPORTED_NETWORK_IDS,
    });
  }

  if (valid.length === 0) {
    logWarn("SUPPORTED_NETWORKS yielded no valid entries; using registry default", {
      provided: envValue,
      defaultingTo: ALL_SUPPORTED_NETWORK_IDS,
    });
    return [...ALL_SUPPORTED_NETWORK_IDS];
  }

  return valid;
}

export const SUPPORTED_NETWORKS: NetworkId[] = parseSupportedNetworks();
