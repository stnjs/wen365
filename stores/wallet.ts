// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";
import type { WalletInfo } from "~/types";

export const useWalletStore = defineStore("wallet", () => {
  // Only use Reown AppKit on client-side
  let open: (() => Promise<void>) | undefined;
  let accountInfo: any;
  let walletInfo: any;
  let state: any;
  let disconnect: (() => Promise<void>) | undefined;

  if (process.client) {
    const {
      useAppKitState,
      useAppKitAccount,
      useWalletInfo,
      useAppKit,
      useDisconnect,
    } = require("@reown/appkit/vue");

    // Reown AppKit modal
    const appKit = useAppKit();
    open = appKit?.open;

    // Wagmi hooks for wallet state
    accountInfo = useAppKitAccount();
    walletInfo = useWalletInfo();
    state = useAppKitState();
    const disconnectHook = useDisconnect();
    disconnect = disconnectHook?.disconnect;
  }

  const isConnecting = computed(
    () => accountInfo?.value?.status === "connecting"
  );
  const isConnected = computed(
    () => accountInfo?.value?.status === "connected"
  );
  const address = computed(() => accountInfo?.value?.address);
  const chainId = computed(() => state?.selectedNetworkId);
  // Local state
  const connectionError = ref<string | null>(null);

  // Actions
  const connectWallet = async () => {
    if (open) {
      await open();
    }
  };
  const disconnectWallet = async () => {
    if (disconnect) {
      await disconnect();
    }
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
