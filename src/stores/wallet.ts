import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAppKit } from "@reown/appkit-vue";
import type { WalletInfo } from "@/types";

export const useWalletStore = defineStore("wallet", () => {
	// Reown AppKit hooks
	const { account, isConnected, chainId, connect, disconnect, isConnecting } =
		useAppKit();

	// Local state
	const connectionError = ref<string | null>(null);

	// Computed
	const walletInfo = computed<WalletInfo | null>(() => {
		if (!isConnected.value || !account.value) return null;

		return {
			address: account.value.address,
			chainId: chainId.value || 1,
			isConnected: isConnected.value,
			balance: account.value.balance || "0.0",
		};
	});

	// Actions
	const connectWallet = async () => {
		try {
			connectionError.value = null;
			await connect();
		} catch (error) {
			connectionError.value =
				error instanceof Error ? error.message : "Failed to connect wallet";
			throw error;
		}
	};

	const disconnectWallet = () => {
		disconnect();
		connectionError.value = null;
	};

	const updateWalletInfo = (info: Partial<WalletInfo>) => {
		// This is now handled by Reown AppKit
		console.log("Wallet info updated:", info);
	};

	return {
		// State
		walletInfo,
		isConnecting,
		connectionError,

		// Getters
		isConnected,
		address: computed(() => account.value?.address || null),
		chainId,

		// Actions
		connectWallet,
		disconnectWallet,
		updateWalletInfo,
	};
});
