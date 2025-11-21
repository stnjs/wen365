<template>
  <NuxtLayout name="landing-page">
    <!-- Hero Section -->
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-fade-up opacity-0"
          :style="{ animationDelay: '0ms' }"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
            />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span class="text-xs text-zinc-300 font-medium tracking-wide uppercase"
            >v2.0 Now Live</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl font-medium text-white tracking-tighter mb-6 leading-[1.1] animate-fade-up opacity-0"
          :style="{ animationDelay: '100ms' }"
        >
          Portfolio clarity.<br />
          <span class="text-zinc-500">Tax optimized.</span>
        </h1>

        <p
          class="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up opacity-0"
          :style="{ animationDelay: '200ms' }"
        >
          Visualize asset flows across chains and optimize your tax burden with intelligent holding
          time tracking. The operating system for your web3 wealth.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0"
          :style="{ animationDelay: '300ms' }"
        >
          <UButton
            class="group relative h-10 px-6 rounded-full bg-white text-black font-medium text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 w-full sm:w-auto hover:bg-zinc-200"
            @click="handleConnectWallet"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span class="relative flex items-center justify-center gap-2">
              Connect Wallet
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </span>
          </UButton>
          <UButton
            class="h-10 px-6 rounded-full border border-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-900 hover:text-white transition-all w-full sm:w-auto"
            @click="handleViewDemo"
          >
            View Demo
          </UButton>
        </div>
      </div>

      <!-- Hero Visual: Dashboard Interface -->
      <div
        class="mt-24 relative max-w-6xl mx-auto animate-fade-up opacity-0 group cursor-default"
        :style="{ animationDelay: '400ms' }"
      >
        <!-- Glow effect behind -->
        <div
          class="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[80px] rounded-full"
        />

        <!-- Browser Frame - with Magnify Effect on Hover -->
        <div
          class="border border-white/10 bg-[#0c0c0e] backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-black relative z-10 ring-1 ring-white/5 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        >
          <!-- Browser Chrome/Header -->
          <div
            class="h-11 bg-zinc-900/80 border-b border-white/5 flex items-center px-4 justify-between sticky top-0 z-20"
          >
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div class="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div class="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div
              class="flex items-center justify-center gap-2 bg-black/40 border border-white/5 rounded px-4 md:px-32 py-1"
            >
              <UIcon name="i-lucide-lock" class="w-3 h-3 text-zinc-500" />
              <span class="text-xs text-zinc-500 font-medium">wen365.app/dashboard</span>
            </div>
            <div class="w-14" />
          </div>

          <!-- App Container - Non-interactive internal content -->
          <div class="flex min-h-[600px] pointer-events-none select-none">
            <!-- Sidebar - Clean with Blurred Bars -->
            <div class="w-64 border-r border-white/5 bg-zinc-900/30 hidden md:flex flex-col p-6">
              <div class="flex items-center gap-2 mb-10">
                <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div class="w-3 h-3 bg-black rounded-full" />
                </div>
                <span class="text-white font-bold text-lg tracking-tight">wen365</span>
              </div>

              <div class="space-y-6">
                <!-- Search Input Placeholder -->
                <div
                  class="h-9 bg-zinc-800/50 rounded-lg w-full flex items-center px-3 gap-2 border border-white/5"
                >
                  <UIcon name="i-lucide-search" class="w-3.5 h-3.5 text-zinc-600" />
                  <span class="text-xs text-zinc-600">Search...</span>
                </div>

                <!-- Actual Dashboard Link - Monochrome Style -->
                <div
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-medium"
                >
                  <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4" />
                  Dashboard
                </div>

                <!-- Blurred Skeleton Bars for other links -->
                <div class="space-y-4 pt-2">
                  <div v-for="i in 4" :key="i" class="h-8 w-full flex items-center px-3 gap-3">
                    <div class="w-4 h-4 rounded-sm bg-zinc-800/50" />
                    <div class="h-3 w-24 bg-zinc-800/50 rounded-sm blur-[2px]" />
                  </div>
                </div>
              </div>

              <!-- Bottom Sidebar Skeleton -->
              <div class="mt-auto space-y-4">
                <div class="h-8 w-full flex items-center px-3 gap-3">
                  <div class="w-4 h-4 rounded-sm bg-zinc-800/50" />
                  <div class="h-3 w-20 bg-zinc-800/50 rounded-sm blur-[2px]" />
                </div>
              </div>
            </div>

            <!-- Main Content Area - Detailed Dashboard Layout -->
            <div class="flex-1 bg-[#0c0c0e] flex flex-col">
              <!-- Top Section: Net Worth & Graph -->
              <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5 h-64">
                <!-- Stats -->
                <div
                  class="p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden"
                >
                  <div class="relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider"
                        >Total Net Worth</span
                      >
                    </div>
                    <div class="text-4xl text-white font-semibold tracking-tight mb-2">
                      $1,240,592<span class="text-zinc-500 text-2xl">.45</span>
                    </div>
                    <div
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                    >
                      <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                      +$12,405 (2.4%)
                    </div>
                  </div>
                  <!-- Subtle grid in stats bg -->
                  <div
                    class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
                  />
                </div>

                <!-- Graph -->
                <div
                  class="col-span-2 relative h-full flex items-end p-0 overflow-hidden group bg-[#0c0c0e]"
                >
                  <div class="absolute top-6 right-6 flex gap-2 z-10">
                    <div class="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded">1D</div>
                    <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1W</div>
                    <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1M</div>
                  </div>

                  <!-- SVG Line Graph -->
                  <svg
                    class="w-full h-[80%] absolute bottom-0 left-0"
                    preserveAspectRatio="none"
                    viewBox="0 0 600 200"
                  >
                    <defs>
                      <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(16, 185, 129, 0.1)" />
                        <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                    </defs>
                    <!-- Fill Area -->
                    <path
                      d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40 V200 H0 Z"
                      fill="url(#graphGradient)"
                    />
                    <!-- Line -->
                    <path
                      d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40"
                      fill="none"
                      stroke="#10b981"
                      stroke-width="2"
                      class="animate-draw"
                    />
                  </svg>
                </div>
              </div>

              <!-- Middle Section: Asset Maturity & Allocation -->
              <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5">
                <div
                  class="col-span-1 lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-white/5"
                >
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-medium text-zinc-400"
                      >Asset Maturity (Tax Status)</span
                    >
                    <span class="text-[10px] text-zinc-600">Threshold: 365 Days</span>
                  </div>

                  <!-- Maturity Bars -->
                  <div class="space-y-5">
                    <!-- Bitcoin -->
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <div class="flex items-center gap-2 text-white">
                          <UIcon name="i-lucide-bitcoin" class="w-3.5 h-3.5 text-orange-500" />
                          Bitcoin
                        </div>
                        <span class="text-emerald-400 font-medium">Long Term (420 days)</span>
                      </div>
                      <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 w-full" />
                      </div>
                    </div>

                    <!-- Ethereum -->
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <div class="flex items-center gap-2 text-white">
                          <UIcon name="i-lucide-layers" class="w-3.5 h-3.5 text-blue-500" />
                          Ethereum
                        </div>
                        <span class="text-zinc-400">Short Term (215 / 365)</span>
                      </div>
                      <div
                        class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative"
                      >
                        <!-- Marker for 365 -->
                        <div class="absolute right-0 top-0 h-full w-px bg-white/20 z-10" />
                        <div class="h-full bg-zinc-500 w-[58%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Allocation Donut (Simulated) -->
                <div class="p-6 flex flex-col justify-center items-center relative">
                  <div
                    class="w-24 h-24 rounded-full border-[6px] border-zinc-800 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-orange-500 rotate-45"
                  />
                  <div class="absolute inset-0 flex items-center justify-center flex-col">
                    <span class="text-white text-sm font-medium">4</span>
                    <span class="text-[10px] text-zinc-500 uppercase">Assets</span>
                  </div>
                </div>
              </div>

              <!-- Bottom Section: Asset Table -->
              <div class="bg-zinc-900/20 flex-1">
                <div
                  class="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-[10px] uppercase tracking-wider font-medium text-zinc-500"
                >
                  <div class="col-span-5">Asset</div>
                  <div class="col-span-4 text-right">Value</div>
                  <div class="col-span-3 text-right">Status</div>
                </div>

                <!-- Row 1 -->
                <div
                  class="px-6 py-3 border-b border-white/5 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors group"
                >
                  <div class="col-span-5 flex items-center gap-3">
                    <div
                      class="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20"
                    >
                      <UIcon name="i-lucide-bitcoin" class="w-3 h-3" />
                    </div>
                    <div>
                      <div class="text-sm text-white font-medium">Bitcoin</div>
                    </div>
                  </div>
                  <div class="col-span-4 text-right text-sm text-white font-medium">
                    $156,345.20
                  </div>
                  <div class="col-span-3 flex justify-end">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >Long Term</span
                    >
                  </div>
                </div>

                <!-- Row 2 -->
                <div
                  class="px-6 py-3 border-b border-white/5 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors group"
                >
                  <div class="col-span-5 flex items-center gap-3">
                    <div
                      class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20"
                    >
                      <UIcon name="i-lucide-layers" class="w-3 h-3" />
                    </div>
                    <div>
                      <div class="text-sm text-white font-medium">Ethereum</div>
                    </div>
                  </div>
                  <div class="col-span-4 text-right text-sm text-white font-medium">$45,504.32</div>
                  <div class="col-span-3 flex justify-end">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-white/10"
                      >Short Term</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="py-24 px-6 max-w-7xl mx-auto" id="features">
      <div class="mb-16">
        <h2 class="text-3xl md:text-4xl font-medium text-white tracking-tight mb-4">
          Everything in one timeline.
        </h2>
        <p class="text-zinc-400 text-lg max-w-2xl">
          wen365 unifies your fragmented crypto existence into a singular, coherent stream of value
          and time.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Multi-Wallet -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group overflow-hidden relative"
        >
          <div
            class="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <UIcon name="i-lucide-globe" class="w-64 h-64 text-white stroke-1" />
          </div>
          <div class="relative z-10">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-white border border-white/10"
            >
              <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-white mb-2">Multi-Chain Aggregation</h3>
            <p class="text-zinc-400 text-sm leading-relaxed max-w-md">
              Connect EVM, Solana, Bitcoin, and Cosmos wallets. We index your entire history,
              normalizing transaction data into a standardized format for effortless analysis.
            </p>
            <div class="mt-8 flex gap-2">
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-white/10 rounded bg-black/50 text-zinc-400"
                >ETH</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-white/10 rounded bg-black/50 text-zinc-400"
                >SOL</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-white/10 rounded bg-black/50 text-zinc-400"
                >BTC</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-white/10 rounded bg-black/50 text-zinc-400"
                >ARB</span
              >
            </div>
          </div>
        </div>

        <!-- Card 2: Tax Optimization -->
        <div
          class="md:col-span-1 p-8 rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors relative group overflow-hidden"
        >
          <div
            class="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all"
          />
          <div class="relative z-10 h-full flex flex-col">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-white border border-white/10"
            >
              <UIcon name="i-lucide-piggy-bank" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-white mb-2">Tax Efficiency</h3>
            <p class="text-zinc-400 text-sm leading-relaxed mb-6">
              Track holding periods per UTXO or Token ID. Identify which assets have matured to
              long-term capital gains status.
            </p>

            <!-- Mini Visual -->
            <div class="mt-auto bg-black/50 rounded-lg p-3 border border-white/5">
              <div class="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Holding Time</span>
                <span class="text-emerald-400">366 Days</span>
              </div>
              <div class="w-full h-1 bg-zinc-800 rounded-full">
                <div class="h-1 bg-emerald-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: Asset Flows -->
        <div
          class="md:col-span-1 p-8 rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group"
        >
          <div
            class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-white border border-white/10"
          >
            <UIcon name="i-lucide-workflow" class="w-5 h-5" />
          </div>
          <h3 class="text-xl font-medium text-white mb-2">Visual Flows</h3>
          <p class="text-zinc-400 text-sm leading-relaxed">
            See where your money goes. Sankey diagrams trace the movement of liquidity from fiat
            on-ramps to DeFi protocols.
          </p>
        </div>

        <!-- Card 4: Notifications -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row items-center gap-8 overflow-hidden"
        >
          <div class="flex-1">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-white border border-white/10"
            >
              <UIcon name="i-lucide-bell-ring" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-white mb-2">Maturity Notifications</h3>
            <p class="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Never miss a tax window. Get notified the exact moment a significant position
              qualifies for long-term tax rates.
            </p>
          </div>
          <div class="w-full md:w-1/2">
            <!-- Notification UI -->
            <div
              class="bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500"
            >
              <div class="flex gap-3">
                <div
                  class="w-8 h-8 rounded bg-white text-black flex items-center justify-center flex-shrink-0"
                >
                  <UIcon name="i-lucide-clock" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-sm font-medium text-white">Asset Matured</div>
                  <div class="text-xs text-zinc-400 mt-1">
                    10.5 ETH held for &gt; 1 year. Tax liability reduced by 15%.
                  </div>
                  <div class="text-[10px] text-zinc-600 mt-2">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Ticker (Subtle) -->
    <section class="py-12 border-y border-white/5 bg-black/50">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <p class="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-8">
          Seamlessly Integrated With
        </p>
        <div class="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 grayscale">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-dollar-sign" class="w-5 h-5" />
            <span class="font-semibold">Coinbase</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            <span class="font-semibold">Metamask</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shield" class="w-5 h-5" />
            <span class="font-semibold">Ledger</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-key" class="w-5 h-5" />
            <span class="font-semibold">Trezor</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-zap" class="w-5 h-5" />
            <span class="font-semibold">Zapper</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 px-6 text-center relative overflow-hidden">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-medium text-white tracking-tighter mb-6">
          Ready to clarify your crypto?
        </h2>
        <p class="text-zinc-400 text-lg mb-10">
          Join the waitlist for wen365 and take control of your financial timeline. Built for the
          modern web3 native.
        </p>

        <form
          class="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
          @submit.prevent="handleWaitlistSubmit"
        >
          <input
            v-model="email"
            type="email"
            placeholder="alice@example.com"
            class="flex-1 bg-zinc-900/50 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all placeholder:text-zinc-600"
            required
          />
          <UButton
            type="submit"
            class="bg-white text-black font-medium text-sm px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors whitespace-nowrap"
          >
            Request Access
          </UButton>
        </form>
        <p class="text-xs text-zinc-600 mt-6">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppKitAccount, useAppKit } from "@reown/appkit/vue";

const router = useRouter();
const accountData = useAppKitAccount();
const email = ref("");

// Navigate to dashboard after wallet connection
watch(
  () => accountData.value?.isConnected,
  newValue => {
    if (newValue) {
      router.push("/dashboard");
    }
  },
);

// Trigger fade-up animations on mount
onMounted(() => {
  const elements = document.querySelectorAll(".animate-fade-up");
  elements.forEach((el, index) => {
    const delay = index * 100;
    setTimeout(() => {
      el.classList.remove("opacity-0");
    }, delay);
  });
});

const { open } = useAppKit();

const handleConnectWallet = () => {
  open({ view: "Connect" });
};

const handleViewDemo = () => {
  // Navigate to dashboard or show demo
  router.push("/dashboard");
};

const handleWaitlistSubmit = () => {
  // Handle waitlist submission
  console.log("Waitlist submission:", email.value);
  // TODO: Implement actual waitlist API call
  email.value = "";
};
</script>
