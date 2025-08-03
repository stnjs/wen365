import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// Wagmi setup
import { createAppKit } from "@reown/appkit/vue";
import {
  arbitrum,
  base,
  mainnet,
  polygon,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Create wagmi config
// 1. Get projectId from https://dashboard.reown.com
const projectId = "YOUR_PROJECT_ID";

// 2. Create a metadata object
const metadata = {
  name: "HODLTracker",
  description: "HODLTracker",
  url: "https://hodltracker.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  polygon,
  base,
  arbitrum,
];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

// 5. Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

// Create Vue app
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);

// Mount app
app.mount("#app");
