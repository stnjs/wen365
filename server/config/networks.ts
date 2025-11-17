/**
 * Valid NetworkId values for validation
 */
const VALID_NETWORK_IDS: NetworkId[] = [
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
];

/**
 * Default networks for development (fallback if env var not set)
 */
const DEFAULT_NETWORKS: NetworkId[] = ["eth-mainnet", "base-mainnet"];

/**
 * Parses and validates supported networks from environment variable
 * Format: SUPPORTED_NETWORKS=eth-mainnet,base-mainnet,matic-mainnet
 *
 * @returns Array of validated NetworkId values
 */
function parseSupportedNetworks(): NetworkId[] {
  const envNetworks = process.env.SUPPORTED_NETWORKS;

  // If no env var set, use defaults (development)
  if (!envNetworks) {
    return DEFAULT_NETWORKS;
  }

  // Parse comma-separated string
  const networks = envNetworks
    .split(",")
    .map(n => n.trim())
    .filter(n => n.length > 0);

  // Validate each network
  const validNetworks: NetworkId[] = [];
  const invalidNetworks: string[] = [];

  for (const network of networks) {
    if (VALID_NETWORK_IDS.includes(network as NetworkId)) {
      validNetworks.push(network as NetworkId);
    } else {
      invalidNetworks.push(network);
    }
  }

  // Warn about invalid networks but don't fail (graceful degradation)
  if (invalidNetworks.length > 0) {
    console.warn(
      `[Config] Invalid network IDs ignored: ${invalidNetworks.join(", ")}. ` +
        `Valid networks: ${VALID_NETWORK_IDS.join(", ")}`,
    );
  }

  // If no valid networks found, fall back to defaults
  if (validNetworks.length === 0) {
    console.warn(
      `[Config] No valid networks found in SUPPORTED_NETWORKS. Using defaults: ${DEFAULT_NETWORKS.join(", ")}`,
    );
    return DEFAULT_NETWORKS;
  }

  return validNetworks;
}

/**
 * Supported blockchain networks for fetching portfolio data
 * Configured via SUPPORTED_NETWORKS environment variable
 * Format: SUPPORTED_NETWORKS=eth-mainnet,base-mainnet,matic-mainnet
 */
export const SUPPORTED_NETWORKS: NetworkId[] = parseSupportedNetworks();
