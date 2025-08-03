import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// Wagmi setup
import { createWagmi } from "@wagmi/vue";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Create wagmi config
const config = createConfig({
	chains: [mainnet, sepolia],
	connectors: [
		injected(),
		walletConnect({
			projectId: import.meta.env.VITE_REOWN_PROJECT_ID || "YOUR_PROJECT_ID",
		}),
	],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});

// Create Vue app
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(createWagmi(config));

// Mount app
app.mount("#app");
