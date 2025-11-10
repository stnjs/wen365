<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <UPageHero>
      <template #headline>
        Track Your Crypto
        <span
          class="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent"
        >
          Portfolio
        </span>
      </template>
      <template #title>
        Monitor your crypto assets across multiple chains in one place. Real-time prices, token
        details, and portfolio insights.
      </template>
      <template #links>
        <UButton
          v-if="!isConnected"
          @click="connectWallet"
          :disabled="isConnecting"
          color="primary"
          size="xl"
        >
          <span v-if="isConnecting">Connecting...</span>
          <span v-else>Connect Wallet</span>
        </UButton>
        <UButton v-else to="/portfolio" color="primary" size="xl" variant="solid">
          View Portfolio
        </UButton>
      </template>
    </UPageHero>

    <!-- Stats Section -->
    <UPageSection>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <UCard class="text-center">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Multi-Chain
          </div>
          <div class="text-gray-600 dark:text-gray-400">Support for 10+ Networks</div>
        </UCard>
        <UCard class="text-center">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Real-Time
          </div>
          <div class="text-gray-600 dark:text-gray-400">Live Price Updates</div>
        </UCard>
        <UCard class="text-center">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">Secure</div>
          <div class="text-gray-600 dark:text-gray-400">Non-Custodial Tracking</div>
        </UCard>
      </div>
    </UPageSection>

    <!-- Features Section -->
    <UPageSection class="bg-white dark:bg-gray-800">
      <template #title>Why Choose Portfolio Tracker?</template>
      <template #description>
        Everything you need to track and manage your crypto assets across multiple blockchains.
      </template>

      <UPageGrid>
        <UPageFeature
          icon="i-lucide-wallet"
          title="Connect Any Wallet"
          description="Connect MetaMask, WalletConnect, or any Ethereum-compatible wallet to automatically import your tokens and balances."
        />
        <UPageFeature
          icon="i-lucide-network"
          title="Multi-Chain Support"
          description="Track assets across Ethereum, Polygon, Base, Arbitrum, Optimism, and more. All in one unified view."
        />
        <UPageFeature
          icon="i-lucide-trending-up"
          title="Real-Time Prices"
          description="Get up-to-date token prices and portfolio values. See your total portfolio value in USD with live updates."
        />
        <UPageFeature
          icon="i-lucide-coins"
          title="Token Details"
          description="View detailed information about each token including balance, price, value, and metadata with beautiful token logos."
        />
        <UPageFeature
          icon="i-lucide-shield-check"
          title="Secure & Private"
          description="Your wallet stays in your control. We never store your private keys or have access to your funds."
        />
        <UPageFeature
          icon="i-lucide-zap"
          title="Fast & Reliable"
          description="Built with Nuxt 4 and modern web technologies for a fast, responsive experience across all devices."
        />
      </UPageGrid>
    </UPageSection>

    <!-- CTA Section -->
    <UPageSection class="bg-gradient-to-r from-primary-600 to-purple-600">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-6">Ready to Track Your Portfolio?</h2>
        <p class="text-xl text-white/90 mb-8">
          Connect your wallet and start tracking your crypto assets across multiple chains today.
        </p>
        <UButton
          v-if="!isConnected"
          @click="connectWallet"
          :disabled="isConnecting"
          color="white"
          variant="solid"
          size="xl"
        >
          <span v-if="isConnecting">Connecting...</span>
          <span v-else>Connect Wallet Now</span>
        </UButton>
        <UButton v-else to="/portfolio" color="white" variant="solid" size="xl">
          Go to Portfolio
        </UButton>
      </div>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";

const router = useRouter();
const accountData = useAppKitAccount();
const { open } = useAppKit();

const isConnected = computed(() => accountData.value?.isConnected);
const isConnecting = computed(() => accountData.value?.status === "connecting");

// Navigate to portfolio after wallet connection
watch(isConnected, newValue => {
  if (newValue) {
    router.push("/portfolio");
  }
});

const connectWallet = async () => {
  try {
    open({ view: "Connect" });
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
};
</script>
