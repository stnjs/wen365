<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <h1
          class="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6"
        >
          Track Your Crypto
          <span
            class="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent"
            >Tax-Free Journey</span
          >
        </h1>
        <p
          class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          Monitor your crypto holdings with FIFO logic and know exactly when
          your assets become tax-free. Perfect for DeFi users and tax planning
          in countries like Germany.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <UButton
            v-if="!isConnected"
            @click="connectWallet"
            :disabled="isConnecting"
            color="primary"
            size="lg"
          >
            <span v-if="isConnecting">Connecting...</span>
            <span v-else>🚀 Get Started</span>
          </UButton>
          <UButton
            v-else
            to="/dashboard"
            color="primary"
            size="lg"
            variant="solid"
          >
            📊 View Dashboard
          </UButton>
          <UButton href="#features" color="gray" variant="outline" size="lg">
            📖 Learn More
          </UButton>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <UCard class="text-center">
            <div
              class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2"
            >
              365
            </div>
            <div class="text-gray-600">Days to Tax-Free</div>
          </UCard>
          <UCard class="text-center">
            <div
              class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2"
            >
              FIFO
            </div>
            <div class="text-gray-600">First-In-First-Out Logic</div>
          </UCard>
          <UCard class="text-center">
            <div
              class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2"
            >
              🔔
            </div>
            <div class="text-gray-600">Smart Alerts</div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      id="features"
      class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800"
    >
      <div class="max-w-7xl mx-auto">
        <h2
          class="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-16"
        >
          Why Choose HODLTracker?
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard>
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="text-xl font-semibold mb-3">Connect Any Wallet</h3>
            <p class="text-gray-600">
              Connect MetaMask, WalletConnect, or any Ethereum wallet to
              automatically import your transactions.
            </p>
          </UCard>

          <UCard>
            <div class="text-4xl mb-4">📊</div>
            <h3 class="text-xl font-semibold mb-3">FIFO Tracking</h3>
            <p class="text-gray-600">
              View per-token acquisition timeline using First-In-First-Out logic
              for accurate tax calculations.
            </p>
          </UCard>

          <UCard>
            <div class="text-4xl mb-4">⏳</div>
            <h3 class="text-xl font-semibold mb-3">Tax-Free Countdown</h3>
            <p class="text-gray-600">
              See exactly when your assets become tax-free with countdown timers
              and visual indicators.
            </p>
          </UCard>

          <UCard>
            <div class="text-4xl mb-4">🔔</div>
            <h3 class="text-xl font-semibold mb-3">Smart Alerts</h3>
            <p class="text-gray-600">
              Get email or Telegram notifications when tokens pass the tax-free
              threshold.
            </p>
          </UCard>

          <UCard>
            <div class="text-4xl mb-4">📤</div>
            <h3 class="text-xl font-semibold mb-3">Export Data</h3>
            <p class="text-gray-600">
              Export CSV reports for your tax advisor with detailed holding
              information.
            </p>
          </UCard>

          <UCard>
            <div class="text-4xl mb-4">🛠️</div>
            <h3 class="text-xl font-semibold mb-3">DeFi Ready</h3>
            <p class="text-gray-600">
              Manual classification for bridge, staking, and liquidity pool
              transactions.
            </p>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-purple-600"
    >
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Track Your Crypto Tax Journey?
        </h2>
        <p class="text-xl text-white/90 mb-8">
          Join thousands of DeFi users who trust HODLTracker for their tax
          planning.
        </p>
        <UButton
          v-if="!isConnected"
          @click="connectWallet"
          :disabled="isConnecting"
          color="white"
          variant="solid"
          size="lg"
        >
          <span v-if="isConnecting">Connecting...</span>
          <span v-else>Connect Wallet Now</span>
        </UButton>
        <UButton v-else to="/dashboard" color="white" variant="solid" size="lg">
          Go to Dashboard
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";

const accountData = useAppKitAccount();
const { open } = useAppKit();

const isConnected = computed(() => accountData.value?.isConnected);
const isConnecting = computed(() => accountData.value?.status === "connecting");

const connectWallet = async () => {
  try {
    open({ view: "Connect" });
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
};
</script>
