<template>
  <div
    class="min-h-screen bg-app text-default selection:bg-white selection:text-black overflow-x-hidden relative"
  >
    <!-- Background Atmosphere -->
    <div
      class="fixed inset-0 z-0 pointer-events-none bg-grid [mask-image:linear-gradient(to_bottom,white,transparent)]"
    />
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full h-150 pointer-events-none z-0 blur-3xl bg-radial-glow"
    />

    <UHeader class="fixed w-full bg-app-overlay backdrop-blur-xl">
      <template #title>
        <Logo size="sm" />
      </template>

      <div class="hidden md:flex items-center gap-8 text-sm text-muted font-medium">
        <a href="#features" class="hover:text-default transition-colors">Features</a>
        <a href="#" class="hover:text-default transition-colors">Tax Engine</a>
        <a href="#" class="hover:text-default transition-colors">Chains</a>
        <a href="#" class="hover:text-default transition-colors">Pricing</a>
      </div>
      <template #right>
        <ConnectWalletButton />
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <slot />
    </UMain>

    <!-- Footer -->
    <UFooter class="border-t border-muted py-12 bg-app">
      <template #left>
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-white rounded-full" />
            <span class="text-default font-medium tracking-tighter">wen365</span>
          </div>
          <p class="text-dimmed text-xs max-w-50 mb-4">
            © 2025 wen365<br />
            Mastering time and value on-chain.
          </p>
          <div class="flex items-center gap-4">
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed hover:text-default transition-colors"
              aria-label="Follow us on X"
            >
              <UIcon name="i-lucide-twitter" class="w-5 h-5" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed hover:text-default transition-colors"
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
            <span class="text-xs font-medium text-default uppercase tracking-widest mb-1"
              >Product</span
            >
            <a href="#features" class="text-dimmed text-xs hover:text-default transition-colors"
              >Features</a
            >
            <a href="#" class="text-dimmed text-xs hover:text-default transition-colors"
              >Integrations</a
            >
            <a href="#" class="text-dimmed text-xs hover:text-default transition-colors">Pricing</a>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-xs font-medium text-default uppercase tracking-widest mb-1"
              >Legal</span
            >
            <NuxtLink to="/privacy" class="text-dimmed text-xs hover:text-default transition-colors"
              >Privacy</NuxtLink
            >
            <NuxtLink to="/terms" class="text-dimmed text-xs hover:text-default transition-colors"
              >Terms</NuxtLink
            >
            <NuxtLink
              to="/disclaimer"
              class="text-dimmed text-xs hover:text-default transition-colors"
              >Disclaimer</NuxtLink
            >
            <NuxtLink to="/cookies" class="text-dimmed text-xs hover:text-default transition-colors"
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
