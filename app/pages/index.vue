<template>
  <NuxtLayout name="landing-page">
    <!-- Hero Section -->
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-default bg-white/5 backdrop-blur-sm mb-8 animate-fade-up"
          :style="{ animationDelay: '0ms' }"
        >
          <UIcon name="i-lucide-code-2" class="w-3.5 h-3.5 text-default" />
          <span class="text-xs text-default font-medium tracking-wide uppercase"
            >Open-Source Demo</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl font-medium text-default tracking-tighter mb-6 leading-[1.1] animate-fade-up"
          :style="{ animationDelay: '100ms' }"
        >
          Portfolio clarity.<br />
          <span class="text-dimmed">Multi-chain tracking.</span>
        </h1>

        <p
          class="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
          :style="{ animationDelay: '200ms' }"
        >
          A full-stack crypto portfolio tracker with SIWE authentication, multi-chain aggregation,
          and historical snapshots. Built with Nuxt 4.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          :style="{ animationDelay: '300ms' }"
        >
          <ConnectWalletButton
            v-if="!isConnected"
            class="transition-all sm:w-auto"
            label="Get Started"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          />
          <UButton
            v-else
            to="/dashboard"
            class="rounded-full transition-all sm:w-auto"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          >
            Go to Dashboard
          </UButton>
          <UButton
            class="rounded-full transition-all sm:w-auto"
            color="primary"
            size="lg"
            @click="handleViewDemo"
          >
            View Demo
          </UButton>
        </div>
      </div>
      <DashboardPreview />
    </section>

    <!-- Features Bento Grid -->
    <section id="features" class="py-24 px-6 max-w-7xl mx-auto">
      <div class="mb-16">
        <h2 class="text-3xl md:text-4xl font-medium text-default tracking-tight mb-4">
          Everything in one timeline.
        </h2>
        <p class="text-muted text-lg max-w-2xl">
          Track token balances across EVM chains, visualize portfolio performance over time, and
          authenticate securely with your wallet.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Multi-Wallet -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors group overflow-hidden relative"
        >
          <div
            class="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <UIcon name="i-lucide-globe" class="w-64 h-64 text-default stroke-1" />
          </div>
          <div class="relative z-10">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">Multi-Chain Aggregation</h3>
            <p class="text-muted text-sm leading-relaxed max-w-md">
              Connect EVM, Solana, Bitcoin, and Cosmos wallets. We index your entire history,
              normalizing transaction data into a standardized format for effortless analysis.
            </p>
            <div class="mt-8 flex gap-2">
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >ETH</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >SOL</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >BTC</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >ARB</span
              >
            </div>
          </div>
        </div>

        <!-- Card 2: Tax Optimization -->
        <div
          class="md:col-span-1 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors relative group overflow-hidden"
        >
          <div
            class="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all"
          />
          <div class="relative z-10 h-full flex flex-col">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-piggy-bank" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">Tax Efficiency</h3>
            <p class="text-muted text-sm leading-relaxed mb-6">
              Track holding periods per UTXO or Token ID. Identify which assets have matured to
              long-term capital gains status.
            </p>

            <!-- Mini Visual -->
            <div class="mt-auto bg-app-overlay rounded-lg p-3 border border-default">
              <div class="flex justify-between text-xs text-muted mb-1">
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
          class="md:col-span-1 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors group"
        >
          <div
            class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
          >
            <UIcon name="i-lucide-workflow" class="w-5 h-5" />
          </div>
          <h3 class="text-xl font-medium text-default mb-2">Visual Flows</h3>
          <p class="text-muted text-sm leading-relaxed">
            See where your money goes. Sankey diagrams trace the movement of liquidity from fiat
            on-ramps to DeFi protocols.
          </p>
        </div>

        <!-- Card 4: Notifications -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row items-center gap-8 overflow-hidden"
        >
          <div class="flex-1">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-bell-ring" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">Maturity Notifications</h3>
            <p class="text-muted text-sm leading-relaxed max-w-sm">
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
                  <div class="text-sm font-medium text-default">Asset Matured</div>
                  <div class="text-xs text-muted mt-1">
                    10.5 ETH held for &gt; 1 year. Tax liability reduced.
                  </div>
                  <div class="text-[10px] text-toned mt-2">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section id="tech" class="py-12 border-y border-default bg-app-overlay">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <p class="text-xs font-medium text-dimmed uppercase tracking-widest mb-8">Built With</p>
        <div class="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-layers" class="w-5 h-5" />
            <span class="font-semibold">Nuxt 4</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-code-2" class="w-5 h-5" />
            <span class="font-semibold">TypeScript</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-database" class="w-5 h-5" />
            <span class="font-semibold">Supabase</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            <span class="font-semibold">SIWE Auth</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-link" class="w-5 h-5" />
            <span class="font-semibold">Alchemy API</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 px-6 text-center relative overflow-hidden">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 bg-white/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-medium text-default tracking-tighter mb-6">
          Explore the source code.
        </h2>
        <p class="text-muted text-lg mb-10">
          This project is open-source. Dive into the codebase to see how SIWE authentication,
          multi-chain portfolio aggregation, and historical snapshots are implemented.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            to="https://github.com/mtp721/wen365"
            target="_blank"
            class="rounded-full transition-all"
            color="neutral"
            size="lg"
            leading-icon="i-lucide-github"
          >
            View on GitHub
          </UButton>
          <ConnectWalletButton
            v-if="!isConnected"
            class="transition-all sm:w-auto"
            label="Try the Demo"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          />
          <UButton
            v-else
            to="/dashboard"
            class="rounded-full transition-all"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          >
            Go to Dashboard
          </UButton>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAppKitAccount } from "@reown/appkit/vue";
import DashboardPreview from "~/components/landingPage/DashboardPreview.vue";

const router = useRouter();
const accountData = useAppKitAccount();

const isConnected = computed<boolean>(() => accountData.value?.isConnected || false);

const handleViewDemo = () => {
  router.push("/dashboard");
};
</script>
