<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div
        class="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <!-- Logo and Navigation Links -->
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 text-xl font-bold text-gray-900"
        >
          <div
            class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">H</span>
          </div>
          <span>HODL Tracker</span>
        </NuxtLink>

        <div class="hidden md:flex items-center space-x-1">
          <NuxtLink
            to="/"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/portfolio"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Portfolio
          </NuxtLink>
          <NuxtLink
            to="/tax-free"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Tax Free
          </NuxtLink>
          <NuxtLink
            to="/export"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Export
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Settings
          </NuxtLink>

          <!-- Wallet Connection Status -->
          <appkit-account-button v-if="isConnected" balance="hide" />
          <appkit-connect-button v-else />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-gray-500 text-sm">
          <p>HODL Tracker - Crypto Tax Tracking with FIFO Logic</p>
          <p class="mt-1">
            For informational purposes only. Consult a tax professional.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWalletStore } from "~/stores/wallet";

const walletStore = useWalletStore();

const isConnected = computed(() => walletStore.isConnected);
</script>
