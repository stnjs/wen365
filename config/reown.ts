import { createAppKit } from "@reown/appkit/vue";
import {
  mainnet,
  polygon,
  base,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Get projectId from Nuxt runtime config
const config = useRuntimeConfig();
const projectId = config.public.reownProjectId;

if (!projectId) {
  throw new Error(
    "VITE_REOWN_PROJECT_ID is required. Please add it to your .env file"
  );
}

// Create metadata object
const metadata = {
  name: "HODLTracker",
  description:
    "Crypto-native web app for tracking crypto asset holding periods with FIFO logic for tax exemptions",
  url: "http://localhost:3000", // Update this for production
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon, base];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

// Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

// Export for use in main.ts
export const appKitVue = appKit;
