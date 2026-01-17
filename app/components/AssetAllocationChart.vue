<template>
  <div class="h-58 w-full relative">
    <VisSingleContainer :data="data" class="h-full" :events="containerEvents">
      <VisDonut
        :value="value"
        :color="color"
        :arc-width="20"
        :show-labels="false"
        :padding="{ top: 10, bottom: 10, left: 10, right: 10 }"
        :events="events"
      />
      <VisTooltip :triggers="triggers" />
    </VisSingleContainer>

    <!-- Central text for the donut -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center flex-col gap-1">
      <template v-if="selectedAsset">
        <span class="text-xs text-dimmed font-light">{{ selectedAsset.tokenMetadata.symbol }}</span>
        <span class="text-default text-xl font-medium">{{ formatCurrency(selectedAsset.tokenValue) }}</span>
        <UBadge color="success" variant="subtle" size="md">{{ formatPercent(selectedAsset.percentage) }}</UBadge>
      </template>
      <template v-else>
        <span class="text-xs text-dimmed font-light">Total Portfolio Value:</span>
        <span class="text-default text-xl font-medium">{{ formatCurrency(props.totalValue || 0) }}</span>
        <UBadge color="success" variant="subtle" size="md">{{ formatPercent(100) }}</UBadge>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";

const props = defineProps<{ data: TokenDto[], totalValue?: number }>();

const selectedAsset = ref<TokenDto | null>(null);

const value = (d: TokenDto) => d.percentage;

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
 * Event handlers
 */
const events = {
  [Donut.selectors.segment]: {
    click: (d: { data: TokenDto }) => {
      // Toggle selection or select new
      if (selectedAsset.value?.tokenMetadata.symbol === d.data.tokenMetadata.symbol) {
        selectedAsset.value = null;
      } else {
        selectedAsset.value = d.data;
      }
    },
  },
};

const containerEvents = {
  click: () => {
    selectedAsset.value = null;
  },
};

/**
 * Attributes for highlighting selected segment
 */
// const donutAttributes = computed(() => ({
//   [Donut.selectors.segment]: {
//     style: (d: TokenDto) => ({
//       opacity: !selectedAsset.value || selectedAsset.value.tokenMetadata.symbol === d.tokenMetadata.symbol ? 1 : 0.3,
//       transition: "opacity 0.2s ease",
//       cursor: "pointer",
//     }),
//   },
// }));

/**
 * Tooltip triggers
 */
const triggers = {
  [Donut.selectors.segment]: (d: { data: TokenDto }) => {
    const token = d.data;
    const symbol = token.tokenMetadata.symbol || "Unknown";
    const percentage = formatPercent(token.percentage);
    return `<div class="text-xs">
      <span class="font-bold text-white">${symbol}</span>: 
      <span class="text-zinc-400">${percentage}</span>
    </div>`;
  },
};
</script>
<style lang="css" scoped>
  .unovis-single-container {
    --vis-font-family: var(--font-sans);
    --vis-dark-tooltip-background-color: var(--color-zinc-900);
  }
</style>
