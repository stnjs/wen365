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
        <a href="#tech" class="hover:text-default transition-colors">Tech Stack</a>
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
            A full-stack crypto portfolio tracker.<br />
            Built as an open-source technical demo.
          </p>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com/mtp721/wen365"
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed hover:text-default transition-colors"
              aria-label="View source on GitHub"
            >
              <UIcon name="i-lucide-github" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </template>

      <template #right>
        <div class="flex gap-16">
          <div class="flex flex-col gap-3">
            <span class="text-xs font-medium text-default uppercase tracking-widest mb-1"
              >Explore</span
            >
            <a href="#features" class="text-dimmed text-xs hover:text-default transition-colors"
              >Features</a
            >
            <a href="#tech" class="text-dimmed text-xs hover:text-default transition-colors"
              >Tech Stack</a
            >
            <a
              href="https://github.com/mtp721/wen365"
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed text-xs hover:text-default transition-colors"
              >Source Code</a
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
