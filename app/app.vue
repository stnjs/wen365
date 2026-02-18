<template>
  <UApp :locale="en">
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { createAppKit } from "@reown/appkit/vue";
import { networks } from "./config/wagmi";
import { siweConfig } from "./config/siwe";
import { en } from "@nuxt/ui/locale";

useHead({
  bodyAttrs: {
    class: "theme-dark",
  },
});

const { $wagmiAdapter, $reownProjectId } = useNuxtApp();

const colorMode = useColorMode();
colorMode.preference = "dark";

createAppKit({
  adapters: [$wagmiAdapter],
  networks,
  projectId: $reownProjectId,
  metadata: {
    name: "wen365",
    description:
      "Portfolio tracker and tax status tracker for crypto assets across multiple chains.",
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.svg`],
  },
  themeMode: "dark",
  themeVariables: {
    "--apkt-font-family": "Inter, system-ui, sans-serif",
    "--apkt-color-mix": "#a1a1aa",
    "--apkt-color-mix-strength": 5,
    "--apkt-border-radius-master": "4px",
  },
  features: {
    analytics: true,
    swaps: false,
    onramp: false,
    connectMethodsOrder: ["wallet"],
  },
  siweConfig,
});
</script>
