import { createAppKit } from "@reown/appkit";
import { createAppKitVue } from "@reown/appkit-vue";

// 1. Get projectId from Reown Cloud (formerly WalletConnect Cloud)
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "YOUR_PROJECT_ID"; // TODO: Replace with actual project ID

// 2. Create AppKit configuration
const appKitConfig = {
	projectId,
	metadata: {
		name: "HODLTracker",
		description: "Crypto tax tracking with FIFO logic",
		url: "https://hodltracker.com",
		icons: ["https://avatars.githubusercontent.com/u/37784886"],
	},
	chains: [
		{
			id: 1,
			name: "Ethereum",
			network: "ethereum",
			nativeCurrency: {
				name: "Ether",
				symbol: "ETH",
				decimals: 18,
			},
			rpcUrls: {
				default: { http: ["https://ethereum.publicnode.com"] },
				public: { http: ["https://ethereum.publicnode.com"] },
			},
		},
		{
			id: 11155111,
			name: "Sepolia",
			network: "sepolia",
			nativeCurrency: {
				name: "Sepolia Ether",
				symbol: "SEP",
				decimals: 18,
			},
			rpcUrls: {
				default: { http: ["https://sepolia.publicnode.com"] },
				public: { http: ["https://sepolia.publicnode.com"] },
			},
		},
	],
	features: {
		// Enable email and social login
		auth: {
			email: true,
			social: ["google", "twitter", "discord"],
		},
		// Enable on-ramp functionality
		onRamp: true,
		// Enable swaps
		swaps: true,
		// Enable smart accounts
		smartAccounts: true,
		// Enable notifications
		notifications: true,
	},
};

// 3. Create AppKit instance
export const appKit = createAppKit(appKitConfig);

// 4. Create Vue plugin
export const appKitVue = createAppKitVue(appKit);
