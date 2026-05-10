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
        <a href="#architecture" class="hover:text-default transition-colors">Architecture</a>
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
    <UFooter class="border-t border-muted py-12 px-6 bg-app">
      <template #left>
        <div class="flex flex-col gap-3">
          <div class="text-default font-medium tracking-tighter">wen365</div>
          <p class="text-dimmed text-xs">
            © {{ new Date().getFullYear() }} ·
            <a
              href="https://github.com/stnjs/wen365/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-default transition-colors"
            >
              MIT License
            </a>
            · Built by
            <a
              href="https://www.linkedin.com/in/son-tung-nong-a49040206/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-default transition-colors"
            >
              Son Tung Nong
            </a>
          </p>
          <p class="text-dimmed text-xs max-w-xs">
            Demo project for portfolio purposes. Not financial or tax advice.
          </p>
          <div class="flex items-center gap-3 mt-1">
            <a
              href="https://github.com/stnjs/wen365"
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed hover:text-default transition-colors"
              aria-label="View source on GitHub"
            >
              <UIcon name="i-lucide-github" class="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/son-tung-nong-a49040206/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-dimmed hover:text-default transition-colors"
              aria-label="LinkedIn profile"
            >
              <UIcon name="i-lucide-linkedin" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </template>
      <template #right>
        <div class="flex flex-row flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-3">
          <span
            class="hidden sm:block text-xs font-medium text-default uppercase tracking-widest mb-1"
          >
            Explore
          </span>
          <a href="#features" class="text-dimmed text-xs hover:text-default transition-colors">
            Features
          </a>
          <a href="#architecture" class="text-dimmed text-xs hover:text-default transition-colors">
            Architecture
          </a>
          <a href="#tech" class="text-dimmed text-xs hover:text-default transition-colors">
            Tech Stack
          </a>
          <a
            href="https://github.com/stnjs/wen365"
            target="_blank"
            rel="noopener noreferrer"
            class="text-dimmed text-xs hover:text-default transition-colors"
          >
            Source Code
          </a>
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
