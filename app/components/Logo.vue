<template>
  <NuxtLink :to="to">
    <img :src="src" alt="Wen365 Logo" :style="style" />
  </NuxtLink>
</template>
<script setup lang="ts">
// Import assets statically so Nuxt can process them at build time
import logoDark from "~/assets/images/wen365-logo-dark.svg";
import logoLight from "~/assets/images/wen365-logo-light.svg";

// Original SVG dimensions: 202x64 (for logo), 64x64 (for icon)
const ORIGINAL_WIDTH = 202;
const ORIGINAL_HEIGHT = 64;

const SIZES_SCALE: Record<typeof props.size, number> = {
  sm: 0.5,
  md: 1.0,
  lg: 1.5,
  xl: 2.0,
};

const props = withDefaults(
  defineProps<{
    to?: string;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    size: "md",
    to: "/dashboard",
  },
);

const colorMode = useColorMode();
const src = computed<string>(() => (colorMode.value === "dark" ? logoDark : logoLight));

const style = computed(() => {
  return {
    width: `${ORIGINAL_WIDTH * SIZES_SCALE[props.size]}px`,
    height: `${ORIGINAL_HEIGHT * SIZES_SCALE[props.size]}px`,
  } as const;
});
</script>
