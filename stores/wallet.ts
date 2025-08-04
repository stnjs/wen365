// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";
import {
  useAppKitState,
  useAppKitAccount,
  useWalletInfo,
  useAppKit,
  useDisconnect,
  useAppKitBalance,
} from "@reown/appkit/vue";
import type { WalletInfo } from "~/types";

export const useWalletStore = defineStore("wallet", () => {
  // Reown AppKit modal
  const { open } = useAppKit();

  // Wagmi hooks for wallet state
  const accountInfo = useAppKitAccount();
  const walletInfo = useWalletInfo();
  const state = useAppKitState();
  const { disconnect } = useDisconnect();

  const isConnecting = computed(
    () => accountInfo.value.status === "connecting"
  );
  const isConnected = computed(() => accountInfo.value.status === "connected");
  const address = computed(() => accountInfo.value.address);
  const chainId = computed(() => state.selectedNetworkId);
  // Local state
  const connectionError = ref<string | null>(null);

  // Actions
  const connectWallet = async () => {
    await open();
  };
  const disconnectWallet = async () => {
    await disconnect();
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
  };
});
