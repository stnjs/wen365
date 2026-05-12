<template>
  <div
    class="min-h-screen bg-app text-default selection:bg-white selection:text-black overflow-x-hidden relative"
  >
    <!-- Background Atmosphere -->
    <div
      class="fixed inset-0 z-0 pointer-events-none bg-grid mask-[linear-gradient(to_bottom,white,transparent)]"
    />
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full h-150 pointer-events-none z-0 blur-3xl bg-radial-glow"
    />

    <UHeader
      v-model:open="isMenuOpen"
      class="fixed w-full bg-app-overlay backdrop-blur-xl"
      mode="drawer"
    >
      <template #title>
        <Logo size="sm" />
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <ConnectWalletButton />
      </template>

      <template #body>
        <UNavigationMenu class="pb-5" :items="navItems" orientation="vertical" />
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
import { onMounted, ref } from "vue";
import type { NavigationMenuItem } from "@nuxt/ui";
import { useAppKitTheme } from "@reown/appkit/vue";

const isMenuOpen = ref<boolean>(false);

const closeMenu = (): void => {
  isMenuOpen.value = false;
};

const navItems: NavigationMenuItem[][] = [
  [
    { label: "Features", to: "#features", icon: "i-lucide-sparkles", onSelect: closeMenu },
    { label: "Architecture", to: "#architecture", icon: "i-lucide-layers", onSelect: closeMenu },
    { label: "Tech Stack", to: "#tech", icon: "i-lucide-blocks", onSelect: closeMenu },
  ],
  [
    {
      label: "GitHub",
      to: "https://github.com/stnjs/wen365",
      target: "_blank",
      icon: "i-lucide-github",
      onSelect: closeMenu,
    },
    {
      label: "LinkedIn",
      to: "https://www.linkedin.com/in/son-tung-nong-a49040206/",
      target: "_blank",
      icon: "i-lucide-linkedin",
      onSelect: closeMenu,
    },
  ],
];

const { setThemeMode } = useAppKitTheme();

onMounted(() => {
  setThemeMode("dark");
});
</script>
