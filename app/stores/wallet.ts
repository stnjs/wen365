// Wallet state is now managed by Reown AppKit composables directly
// This store is kept for potential future use but currently unused
export const useWalletStore = defineStore("wallet", () => {
  // Store is empty - wallet state managed via useAppKitAccount() composable
  return {};
});
