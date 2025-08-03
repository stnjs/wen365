<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gradient">🧾 HODLTracker</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              v-if="!isConnected"
              @click="connectWallet"
              :disabled="isConnecting"
              class="btn-primary"
            >
              <span v-if="isConnecting">Connecting...</span>
              <span v-else>Connect Wallet</span>
            </button>
            <div v-else class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">{{ shortAddress }}</span>
              <button @click="disconnectWallet" class="btn-secondary text-sm">
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Track Your Crypto
          <span class="text-gradient">Tax-Free Journey</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Monitor your crypto holdings with FIFO logic and know exactly when your assets become tax-free. 
          Perfect for DeFi users and tax planning in countries like Germany.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            v-if="!isConnected"
            @click="connectWallet"
            :disabled="isConnecting"
            class="btn-primary text-lg px-8 py-4"
          >
            <span v-if="isConnecting">Connecting...</span>
            <span v-else>🚀 Get Started</span>
          </button>
          <router-link 
            v-else
            to="/dashboard"
            class="btn-primary text-lg px-8 py-4"
          >
            📊 View Dashboard
          </router-link>
          <a 
            href="#features" 
            class="btn-secondary text-lg px-8 py-4"
          >
            📖 Learn More
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary-600 mb-2">365</div>
            <div class="text-gray-600">Days to Tax-Free</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-crypto-green mb-2">FIFO</div>
            <div class="text-gray-600">First-In-First-Out Logic</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-crypto-purple mb-2">🔔</div>
            <div class="text-gray-600">Smart Alerts</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">
          Why Choose HODLTracker?
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card">
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="text-xl font-semibold mb-3">Connect Any Wallet</h3>
            <p class="text-gray-600">
              Connect MetaMask, WalletConnect, or any Ethereum wallet to automatically import your transactions.
            </p>
          </div>
          
          <div class="card">
            <div class="text-4xl mb-4">📊</div>
            <h3 class="text-xl font-semibold mb-3">FIFO Tracking</h3>
            <p class="text-gray-600">
              View per-token acquisition timeline using First-In-First-Out logic for accurate tax calculations.
            </p>
          </div>
          
          <div class="card">
            <div class="text-4xl mb-4">⏳</div>
            <h3 class="text-xl font-semibold mb-3">Tax-Free Countdown</h3>
            <p class="text-gray-600">
              See exactly when your assets become tax-free with countdown timers and visual indicators.
            </p>
          </div>
          
          <div class="card">
            <div class="text-4xl mb-4">🔔</div>
            <h3 class="text-xl font-semibold mb-3">Smart Alerts</h3>
            <p class="text-gray-600">
              Get email or Telegram notifications when tokens pass the tax-free threshold.
            </p>
          </div>
          
          <div class="card">
            <div class="text-4xl mb-4">📤</div>
            <h3 class="text-xl font-semibold mb-3">Export Data</h3>
            <p class="text-gray-600">
              Export CSV reports for your tax advisor with detailed holding information.
            </p>
          </div>
          
          <div class="card">
            <div class="text-4xl mb-4">🛠️</div>
            <h3 class="text-xl font-semibold mb-3">DeFi Ready</h3>
            <p class="text-gray-600">
              Manual classification for bridge, staking, and liquidity pool transactions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-purple-600">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Track Your Crypto Tax Journey?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Join thousands of DeFi users who trust HODLTracker for their tax planning.
        </p>
        <button 
          v-if="!isConnected"
          @click="connectWallet"
          :disabled="isConnecting"
          class="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span v-if="isConnecting">Connecting...</span>
          <span v-else>Connect Wallet Now</span>
        </button>
        <router-link 
          v-else
          to="/dashboard"
          class="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block"
        >
          Go to Dashboard
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

const isConnected = computed(() => walletStore.isConnected)
const isConnecting = computed(() => walletStore.isConnecting)
const address = computed(() => walletStore.address)

const shortAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
  }
}

const disconnectWallet = () => {
  walletStore.disconnectWallet()
}
</script> 