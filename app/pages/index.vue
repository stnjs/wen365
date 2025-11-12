<template>
  <NuxtLayout name="landing-page">
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center">
      <!-- Animated Background with Crypto Coins -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 dark:from-primary-950 dark:via-primary-900 dark:to-black animate-gradient"
      >
        <!-- Crypto Coin Icons -->
        <img
          src="~/assets/images/coins/bitcoin.png"
          alt="Bitcoin"
          class="crypto-coin crypto-coin-btc coin-glow-btc"
        />
        <img
          src="~/assets/images/coins/ethereum.png"
          alt="Ethereum"
          class="crypto-coin crypto-coin-eth coin-glow-eth"
        />
        <img
          src="~/assets/images/coins/solana.png"
          alt="Solana"
          class="crypto-coin crypto-coin-sol coin-glow-sol"
        />
        <img
          src="~/assets/images/coins/xrp.png"
          alt="XRP"
          class="crypto-coin crypto-coin-xrp coin-glow-xrp"
        />
        <img
          src="~/assets/images/coins/bnb.png"
          alt="BNB"
          class="crypto-coin crypto-coin-bnb coin-glow-bnb"
        />
        <img
          src="~/assets/images/coins/usdc.png"
          alt="USDC"
          class="crypto-coin crypto-coin-usdc coin-glow-usdc"
        />
        <img
          src="~/assets/images/coins/usdt.png"
          alt="USDT"
          class="crypto-coin crypto-coin-usdt coin-glow-usdt"
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
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
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
          class="text-xl sm:text-2xl text-gray-200 dark:text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed"
        >
          Monitor your crypto assets across multiple blockchains. Real-time prices, portfolio
          insights, and comprehensive tracking all in one place.
        </p>

        <!-- CTA Button -->
        <div class="flex justify-center">
          <ConnectWalletButton trailing-icon="i-lucide-arrow-right" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useAppKitAccount } from "@reown/appkit/vue";

const router = useRouter();
const accountData = useAppKitAccount();

// Navigate to portfolio after wallet connection
watch(
  () => accountData.value?.isConnected,
  newValue => {
    if (newValue) {
      router.push("/portfolio");
    }
  },
);
</script>

<style scoped>
@keyframes float-underwater {
  0%,
  100% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-15px) translateX(10px) rotate(2deg) scale(1.02);
  }
  50% {
    transform: translateY(-25px) translateX(-5px) rotate(-2deg) scale(0.98);
  }
  75% {
    transform: translateY(-10px) translateX(-10px) rotate(1deg) scale(1.01);
  }
}

@keyframes float-underwater-reverse {
  0%,
  100% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(15px) translateX(-10px) rotate(-2deg) scale(0.98);
  }
  50% {
    transform: translateY(25px) translateX(5px) rotate(2deg) scale(1.02);
  }
  75% {
    transform: translateY(10px) translateX(10px) rotate(-1deg) scale(0.99);
  }
}

@keyframes coin-glow-pulse {
  0%,
  100% {
    filter: blur(var(--coin-blur)) drop-shadow(0 0 var(--coin-glow-base) currentColor);
    opacity: var(--coin-opacity);
  }
  50% {
    filter: blur(var(--coin-blur)) drop-shadow(0 0 var(--coin-glow-max) currentColor);
    opacity: var(--coin-opacity-pulse-max);
  }
}

/* Base coin styles */
.crypto-coin {
  position: absolute;
  width: 200px;
  height: 200px;
  filter: blur(var(--coin-blur));
  user-select: none;
  pointer-events: none;
  opacity: var(--coin-opacity);
  object-fit: contain;
  z-index: 3;
}

/* Bitcoin */
.crypto-coin-btc {
  top: 10%;
  left: 8%;
  width: 220px;
  height: 220px;
  animation: float-underwater 8s ease-in-out infinite;
  color: var(--coin-btc-color);
}

.coin-glow-btc {
  animation:
    float-underwater 8s ease-in-out infinite,
    coin-glow-pulse 4s ease-in-out infinite;
  filter: blur(var(--coin-blur))
    drop-shadow(0 0 30px rgba(247, 147, 26, var(--coin-glow-intensity)));
}

/* Ethereum */
.crypto-coin-eth {
  bottom: 15%;
  right: 12%;
  width: 200px;
  height: 200px;
  animation: float-underwater-reverse 10s ease-out infinite;
  color: var(--coin-eth-color);
}

.coin-glow-eth {
  animation:
    float-underwater-reverse 10s ease-out infinite,
    coin-glow-pulse 5s ease-in-out infinite;
  filter: blur(var(--coin-blur))
    drop-shadow(0 0 30px rgba(98, 126, 234, var(--coin-glow-intensity)));
}

/* Solana */
.crypto-coin-sol {
  top: 45%;
  left: 5%;
  width: 180px;
  height: 180px;
  animation: float-underwater 6s ease-in-out infinite;
  color: var(--coin-sol-color);
}

.coin-glow-sol {
  animation:
    float-underwater 6s ease-in-out infinite,
    coin-glow-pulse 3.5s ease-in-out infinite;
  filter: blur(var(--coin-blur)) drop-shadow(0 0 30px rgba(0, 255, 163, var(--coin-glow-intensity)));
}

/* XRP */
.crypto-coin-xrp {
  top: 20%;
  right: 8%;
  width: 190px;
  height: 190px;
  animation: float-underwater-reverse 12s ease-in-out infinite;
  color: var(--coin-xrp-color);
}

.coin-glow-xrp {
  animation:
    float-underwater-reverse 12s ease-in-out infinite,
    coin-glow-pulse 6s ease-in-out infinite;
  filter: blur(var(--coin-blur)) drop-shadow(0 0 30px rgba(34, 34, 34, 0.25));
}

/* BNB */
.crypto-coin-bnb {
  bottom: 10%;
  left: 15%;
  width: 210px;
  height: 210px;
  animation: float-underwater 9s ease-out infinite;
  color: var(--coin-bnb-color);
}

.coin-glow-bnb {
  animation:
    float-underwater 9s ease-out infinite,
    coin-glow-pulse 4.5s ease-in-out infinite;
  filter: blur(var(--coin-blur))
    drop-shadow(0 0 30px rgba(243, 186, 47, var(--coin-glow-intensity)));
}

/* USDC */
.crypto-coin-usdc {
  top: 60%;
  right: 20%;
  width: 180px;
  height: 180px;
  animation: float-underwater-reverse 11s ease-in-out infinite;
  color: var(--coin-usdc-color);
}

.coin-glow-usdc {
  animation:
    float-underwater-reverse 11s ease-in-out infinite,
    coin-glow-pulse 5.5s ease-in-out infinite;
  filter: blur(var(--coin-blur))
    drop-shadow(0 0 30px rgba(38, 132, 255, var(--coin-glow-intensity)));
}

/* USDT */
.crypto-coin-usdt {
  bottom: 30%;
  left: 25%;
  width: 200px;
  height: 200px;
  animation: float-underwater 7s ease-out infinite;
  color: var(--coin-usdt-color);
}

.coin-glow-usdt {
  animation:
    float-underwater 7s ease-out infinite,
    coin-glow-pulse 4s ease-in-out infinite;
  filter: blur(var(--coin-blur))
    drop-shadow(0 0 30px rgba(38, 161, 123, var(--coin-glow-intensity)));
}
</style>
