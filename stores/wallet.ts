// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";
import type { WalletInfo } from "~/types";

export const useWalletStore = defineStore("wallet", () => {
  console.log("Wallet store is being initialized");

  // Wagmi composables (only on client-side)
  let account: any = ref(null);
  let isConnecting = ref(false);
  let isConnected = ref(false);
  let address = ref<string | null>(null);
  let chainId = ref<number | null>(null);
  let connectionError = ref<string | null>(null);

  if (import.meta.client) {
    try {
      // Import Wagmi composables dynamically to avoid SSR issues
      const { useAccount, useConnect, useDisconnect } = require('@wagmi/vue');
      
      console.log("Wagmi composables loaded");
      
      // Use Wagmi composables
      const accountData = useAccount();
      const { connect, connectors, isPending } = useConnect();
      const { disconnect } = useDisconnect();

      // Watch for account changes
      watch(accountData, (newAccount) => {
        console.log("Account changed:", newAccount);
        account.value = newAccount;
        isConnected.value = !!newAccount?.address;
        address.value = newAccount?.address || null;
        chainId.value = newAccount?.chainId || null;
      }, { immediate: true });

      // Watch for connection status
      watch(isPending, (pending) => {
        console.log("Connection pending:", pending);
        isConnecting.value = pending;
      });

      // Actions
      const connectWallet = async () => {
        try {
          connectionError.value = null;
          console.log("Connecting wallet...");
          
          // Use the first available connector (usually MetaMask)
          const connector = connectors.value[0];
          if (connector) {
            await connect({ connector });
          } else {
            throw new Error("No wallet connectors available");
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
          connectionError.value = error instanceof Error ? error.message : "Connection failed";
        }
      };

      const disconnectWallet = async () => {
        try {
          console.log("Disconnecting wallet...");
          await disconnect();
        } catch (error) {
          console.error("Wallet disconnection error:", error);
          connectionError.value = error instanceof Error ? error.message : "Disconnection failed";
        }
      };

      return {
        // State
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
    } catch (error) {
      console.error("Error loading Wagmi composables:", error);
      
      // Fallback to simple implementation
      const connectWallet = async () => {
        console.log("Wagmi not available, using fallback");
        isConnecting.value = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        isConnected.value = true;
        address.value = "0x1234567890123456789012345678901234567890";
        isConnecting.value = false;
      };

      const disconnectWallet = async () => {
        console.log("Disconnecting wallet (fallback)...");
        isConnected.value = false;
        address.value = null;
      };

      return {
        isConnecting,
        connectionError,
        isConnected,
        address,
        chainId,
        connectWallet,
        disconnectWallet,
      };
    }
  } else {
    // Server-side fallback
    const connectWallet = async () => {
      console.log("Wallet connection not available on server-side");
    };

    const disconnectWallet = async () => {
      console.log("Wallet disconnection not available on server-side");
    };

    return {
      isConnecting,
      connectionError,
      isConnected,
      address,
      chainId,
      connectWallet,
      disconnectWallet,
    };
  }
});
