import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  arbitrum,
  mainnet,
  polygon,
  base,
  type AppKitNetwork,
} from "@reown/appkit/networks";

export const projectId = "d83d9895fdd368edad57303bce75c013";

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  polygon,
  base,
  arbitrum,
];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});
