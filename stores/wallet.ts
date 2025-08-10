// Pinia is auto-imported by Nuxt
import { ref, computed, watch } from "vue";
import { useAppKit } from "@reown/appkit/vue";

export const useWalletStore = defineStore("wallet", () => {
  console.log("Wallet store is being initialized");

  // State
  const isConnecting = ref(false);
  const isConnected = ref(false);
  const address = ref<string | null>(null);
  const chainId = ref<number | null>(null);
  const connectionError = ref<string | null>(null);

  const { open } = useAppKit();

  // Actions
  const connectWallet = () => {
    try {
      connectionError.value = null;
      console.log("Connecting wallet...");
      isConnecting.value = true;

      // Open the connect modal
      open({ view: "Connect" });
    } catch (error) {
      console.error("Wallet connection error:", error);
      connectionError.value =
        error instanceof Error ? error.message : "Connection failed";
    } finally {
      isConnecting.value = false;
    }
  };

  const openAccountModal = () => {
    try {
      open({ view: "Account" });
    } catch (error) {
      connectionError.value =
        error instanceof Error ? error.message : "Disconnection failed";
    }
  };

  // Initialize account watching
  /*   const initializeAccountWatching = async () => {
    try {
      const { useAccount } = await import("@wagmi/vue");
      const accountData = useAccount();

      // Watch for account changes
      watch(
        accountData,
        (newAccount: any) => {
          console.log("Account changed:", newAccount);
          if (newAccount?.address) {
            isConnected.value = true;
            address.value = newAccount.address;
            chainId.value = newAccount.chainId || null;
          } else {
            isConnected.value = false;
            address.value = null;
            chainId.value = null;
          }
        },
        { immediate: true }
      );
    } catch (error) {
      console.log(
        "Wagmi not available, skipping account watching initialization"
      );
    }
  }; */

  // Initialize on mount
  /*   onMounted(() => {
    initializeAccountWatching();
  }); */

  return {
    // State
    isConnecting,
    isConnected,
    address,
    chainId,
    connectionError,

    // Actions
    connectWallet,
    openAccountModal,
  };
});
