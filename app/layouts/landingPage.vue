<template>
  <div
    class="min-h-screen bg-black text-zinc-300 font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden"
  >
    <!-- Background Atmosphere -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900/0 to-transparent blur-3xl"
      />
    </div>

    <!-- Main Content -->
    <div class="relative z-10">
      <slot />
    </div>
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
