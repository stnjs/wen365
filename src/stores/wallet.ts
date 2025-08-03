import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAccount, useConnect, useDisconnect, useBalance } from "@wagmi/vue";
import type { WalletInfo } from "@/types";

export const useWalletStore = defineStore("wallet", () => {
  // Wagmi hooks
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  // Local state
  const connectionError = ref<string | null>(null);

  // Computed
  const walletInfo = computed<WalletInfo | null>(() => {
    if (!isConnected.value || !address.value) return null;

    return {
      address: address.value,
      chainId: chainId.value || 1,
      isConnected: isConnected.value,
      balance: balance.value?.formatted || "0.0",
    };
  });

  const isConnecting = computed(() => isPending.value);

  // Actions
  const connectWallet = async () => {
    try {
      connectionError.value = null;

      // Use the first available connector (usually MetaMask)
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      } else {
        throw new Error("No wallet connectors available");
      }
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
    // This is now handled by wagmi hooks
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
