<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Navigation -->
    <UHeader
      :class="[
        isLandingPage
          ? 'bg-transparent backdrop-blur-sm border-transparent'
          : 'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700',
      ]"
    >
      <template #title>
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          <div
            class="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">H</span>
          </div>
          <span>HODL Tracker</span>
        </NuxtLink>
      </template>

      <!-- Navigation Links - Only show on non-landing pages -->
      <div v-if="!isLandingPage" class="hidden md:flex items-center space-x-1">
        <UButton to="/" variant="ghost" color="gray"> Home </UButton>
        <UButton to="/portfolio" variant="ghost" color="gray"> Portfolio </UButton>
      </div>

      <template #right>
        <div class="flex items-center gap-2">
          <!-- Wallet Connection Status -->
          <appkit-button />
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain class="flex-1">
      <slot />
    </UMain>

    <!-- Footer -->
    <UFooter
      class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
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
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useColorMode } from "#imports";
import { useAppKitTheme } from "@reown/appkit/vue";

const route = useRoute();

// Check if we're on the landing page
const isLandingPage = computed(() => route.path === "/");

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
