<template>
  <div
    class="min-h-screen bg-black text-zinc-300 font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden relative"
  >
    <!-- Background Atmosphere -->
    <div
      class="fixed inset-0 z-0 pointer-events-none bg-grid [mask-image:linear-gradient(to_bottom,white,transparent)]"
    />
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0 blur-3xl bg-radial-glow"
    />

    <UHeader class="fixed w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <template #title>
        <Logo size="sm" />
      </template>

      <div class="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
        <a href="#features" class="hover:text-white transition-colors">Features</a>
        <a href="#" class="hover:text-white transition-colors">Tax Engine</a>
        <a href="#" class="hover:text-white transition-colors">Chains</a>
        <a href="#" class="hover:text-white transition-colors">Pricing</a>
      </div>
      <template #right>
        <ConnectWalletButton
          size="sm"
          :show-connected="false"
          label="Connect Wallet"
          class="bg-white text-black text-xs font-medium px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors tracking-tight"
        />
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <slot />
    </UMain>

    <!-- Footer -->
    <UFooter class="border-t border-white/5 py-12 bg-black">
      <template #left>
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-white rounded-full" />
            <span class="text-white font-medium tracking-tighter">wen365</span>
          </div>
          <p class="text-zinc-500 text-xs max-w-[200px] mb-4">
            © 2025 wen365<br />
            Mastering time and value on-chain.
          </p>
          <div class="flex items-center gap-4">
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-500 hover:text-white transition-colors"
              aria-label="Follow us on X"
            >
              <UIcon name="i-lucide-twitter" class="w-5 h-5" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-500 hover:text-white transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <UIcon name="i-lucide-linkedin" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </template>

      <template #right>
        <div class="flex gap-16">
          <div class="flex flex-col gap-3">
            <span class="text-xs font-medium text-white uppercase tracking-widest mb-1"
              >Product</span
            >
            <a href="#features" class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Features</a
            >
            <a href="#" class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Integrations</a
            >
            <a href="#" class="text-zinc-500 text-xs hover:text-white transition-colors">Pricing</a>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-xs font-medium text-white uppercase tracking-widest mb-1">Legal</span>
            <NuxtLink to="/privacy" class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Privacy</NuxtLink
            >
            <NuxtLink to="/terms" class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Terms</NuxtLink
            >
            <NuxtLink
              to="/disclaimer"
              class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Disclaimer</NuxtLink
            >
            <NuxtLink to="/cookies" class="text-zinc-500 text-xs hover:text-white transition-colors"
              >Cookie Policy</NuxtLink
            >
          </div>
        </div>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAppKitTheme } from "@reown/appkit/vue";

const { setThemeMode } = useAppKitTheme();

onMounted(() => {
  setThemeMode("dark");
});
</script>
