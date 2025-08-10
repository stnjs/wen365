import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base } from "wagmi/chains";

export const projectId = process.env.APPKIT_PROJECT_ID || "YOUR_PROJECT_ID";

export const networks = [mainnet, arbitrum, base];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});
