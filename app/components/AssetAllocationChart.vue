<template>
  <div class="h-48 w-full relative">
    <VisSingleContainer :data="data" class="h-full">
      <VisDonut
        :value="value"
        :color="color"
        :arc-width="12"
        :show-labels="false"
        :padding="{ top: 10, bottom: 10, left: 10, right: 10 }"
      />
      <VisTooltip :triggers="triggers" />
    </VisSingleContainer>

    <!-- Central text for the donut -->
    <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
      <span class="text-default text-sm font-medium">{{ data.length }}</span>
      <span class="text-[10px] text-dimmed uppercase">Assets</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";

defineProps<{ data: TokenDto[] }>();

// Value accessor for the segments
const value = (d: TokenDto) => d.percentage;

/**
 * Color palette for the segments using Tailwind 4 theme variables
 */
const colorPalette = [
  "var(--color-blue-500)",
  "var(--color-emerald-500)",
  "var(--color-amber-500)",
  "var(--color-violet-500)",
  "var(--color-pink-500)",
  "var(--color-red-500)",
  "var(--color-cyan-500)",
];

const color = (_d: TokenDto, i: number) => colorPalette[i % colorPalette.length];

/**
 * Tooltip triggers
 */
const triggers = {
  [Donut.selectors.segment]: (d: { data: TokenDto }) => {
    const token = d.data;
    const symbol = token.tokenMetadata.symbol || "Unknown";
    const percentage = token.percentage.toFixed(1);
    return `<div class="text-xs">
      <span class="font-bold text-white">${symbol}</span>: 
      <span class="text-zinc-400">${percentage}%</span>
    </div>`;
  },
};
</script>
