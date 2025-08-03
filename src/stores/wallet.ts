import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAppKit } from "@reown/appkit/vue";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { WalletInfo } from "@/types";

export const useWalletStore = defineStore("wallet", () => {
  // Reown AppKit modal
  const { open } = useAppKit();

  // Wagmi hooks for wallet state
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Local state
  const connectionError = ref<string | null>(null);

  // Computed
  const walletInfo = computed<WalletInfo | null>(() => {
    if (!isConnected || !address) return null;

    return {
      address: address,
      chainId: chainId || 1,
      isConnected: isConnected,
      balance: "0.0", // Will be updated when we add balance fetching
    };
  });

  const isConnecting = computed(() => isPending);

  // Actions
  const connectWallet = async () => {
    try {
      connectionError.value = null;
      await open();
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
    console.log("Wallet info updated:", info);
  };

  return {
    // State
    walletInfo,
    isConnecting,
    connectionError,

    // Getters
    isConnected,
    address,
    chainId,

    // Actions
    connectWallet,
    disconnectWallet,
    updateWalletInfo,
  };
});
