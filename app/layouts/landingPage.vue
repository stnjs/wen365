<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <UHeader class="bg-transparent backdrop-blur-sm border-transparent shadow-none py-4">
      <template #title>
        <Logo />
      </template>
      <template #right>
        <div class="flex items-center gap-2">
          <!-- Wallet Connection Status -->
          <ConnectWalletButton size="md" :show-connected="false" label="Connect" />
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <!-- Main Content -->
    <div class="absolute top-0 left-0 w-full h-full">
      <slot />
    </div>

    <!-- Footer -->
    <UFooter class="absolute bottom-0 left-0 w-full z-10">
      <UContainer>
        <div class="py-6">
          <div class="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Portfolio Tracker - Track Your Crypto Assets Across Multiple Chains</p>
          </div>
        </div>
      </UContainer>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useColorMode } from "#imports";
import { useAppKitTheme } from "@reown/appkit/vue";

// Sync AppKit theme with Nuxt UI color mode
const colorMode = useColorMode();
const { setThemeMode } = useAppKitTheme();

// Watch for color mode changes and sync AppKit
watch(
  () => colorMode.value,
  newMode => {
    // AppKit supports 'light' and 'dark', map system to resolved value
    const appKitMode = newMode === "dark" ? "dark" : "light";
    setThemeMode(appKitMode);
  },
  { immediate: true },
);
</script>
