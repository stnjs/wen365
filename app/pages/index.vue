<template>
  <div class="min-h-screen relative overflow-hidden flex items-center justify-center">
    <!-- Animated Background with Crypto Coins -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 dark:from-primary-950 dark:via-primary-900 dark:to-black animate-gradient"
    >
      <!-- Crypto Coin Icons -->
      <img
        src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
        alt="Bitcoin"
        class="crypto-coin crypto-coin-btc animate-float"
      />
      <img
        src="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
        alt="Ethereum"
        class="crypto-coin crypto-coin-eth animate-float-reverse"
      />
      <img
        src="https://assets.coingecko.com/coins/images/4128/large/solana.png"
        alt="Solana"
        class="crypto-coin crypto-coin-sol animate-float"
      />
      <img
        src="https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
        alt="XRP"
        class="crypto-coin crypto-coin-xrp animate-float-reverse"
      />
      <img
        src="https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
        alt="BNB"
        class="crypto-coin crypto-coin-bnb animate-glow"
      />
      <img
        src="https://assets.coingecko.com/coins/images/6319/large/usdc.png"
        alt="USDC"
        class="crypto-coin crypto-coin-usdc animate-float"
      />
      <img
        src="https://assets.coingecko.com/coins/images/325/large/Tether.png"
        alt="USDT"
        class="crypto-coin crypto-coin-usdt animate-float-reverse"
      />
    </div>

    <!-- Hero Section -->
    <div class="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
      <!-- Badge -->
      <div class="mb-6">
        <span
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 text-sm font-medium text-white"
        >
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Portfolio Tracker
        </span>
      </div>

      <!-- Headline -->
      <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
        <span class="text-white">Track Your Crypto</span>
        <br />
        <span
          class="bg-gradient-to-r from-primary-400 via-purple-400 to-primary-400 bg-clip-text text-transparent animate-gradient"
        >
          Portfolio
        </span>
      </h1>

      <!-- Subtitle -->
      <p
        class="text-xl sm:text-2xl text-gray-200 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
      >
        A comprehensive portfolio tracker, tax status tracker for held assets, and asset
        visualization tool.
      </p>

      <!-- CTA Button -->
      <div class="flex justify-center gap-4">
        <UButton
          v-if="!isConnected"
          :disabled="isConnecting"
          :loading="isConnecting"
          color="primary"
          size="xl"
          class="px-8 py-6 text-lg font-semibold purple-glow-strong"
          @click="connectWallet"
        >
          {{ isConnecting ? "Connecting..." : "Connect Wallet" }}
        </UButton>
        <UButton
          v-else
          color="primary"
          size="xl"
          class="px-8 py-6 text-lg font-semibold purple-glow-strong"
          to="/portfolio"
        >
          View Portfolio
        </UButton>
      </div>
    </div>
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
