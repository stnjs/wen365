<template>
  <UApp :locale="en">
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { createAppKit } from "@reown/appkit/vue";
import { projectId, wagmiAdapter, networks } from "./config/wagmi";
import { siweConfig } from "./config/siwe";
import { en } from "@nuxt/ui/locale";

const colorMode = useColorMode();
colorMode.preference = "dark";

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "wen365",
    description:
      "A comprehensive portfolio tracker, tax status tracker for held assets, and asset visualization tool.",
    url: "http://localhost:3030",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  themeMode: "dark",
  themeVariables: {
    // "--apkt-font-family": "Inter, system-ui, sans-serif",
    // "--apkt-accent": "#9f9fa9 !important", // primary accent color
    // "--apkt-color-mix": "#9f9fa9 !important", // blend color
    // "--apkt-border-radius-master": "9999px",
  },
  siweConfig,
});
</script>
