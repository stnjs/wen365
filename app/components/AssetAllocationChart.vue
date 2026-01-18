<template>
  <div class="h-58 w-full relative donut-chart-container" :class="{ 'has-selection': selectedAsset }">
    <VisSingleContainer :data="data" class="h-full" :events="containerEvents">
      <VisDonut :value="value" :color="color" :arc-width="25" :padding="{ top: 10, bottom: 10, left: 10, right: 10 }"
        :events="events" />
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

const selectedAsset = ref<TokenDto | undefined>();

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
 * Clear selection state from all segments
 */
const clearAllSelections = () => {
  const segments = document.querySelectorAll(".donut-chart-container path");
  segments.forEach(segment => {
    segment.classList.remove("is-selected");
  });
};

const events = {
  [Donut.selectors.segment]: {
    click: (
      d: { data: TokenDto },
      event: MouseEvent,
      _index: number,
      elements: SVGPathElement[]
    ) => {
      event.stopPropagation();
      const clickedElement = elements[_index];

      const currentSelectedAssetIdentifier = `${selectedAsset.value?.network}:${selectedAsset.value?.tokenAddress}`;
      const clickedAssetIdentifier = `${d.data.network}:${d.data.tokenAddress}`;

      // Toggle off if clicking the same segment
      if (currentSelectedAssetIdentifier === clickedAssetIdentifier) {
        clearAllSelections();
        selectedAsset.value = undefined;
      } else {
        // Clear previous selection and set new one
        clearAllSelections();
        clickedElement?.classList.add("is-selected");
        selectedAsset.value = d.data;
      }
    },
  },
};

const containerEvents = {
  click: () => {
    clearAllSelections();
    selectedAsset.value = undefined;
  },
};

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

/* Base segment styles */
:deep(path) {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
  transform-origin: center;
  transform-box: fill-box;
}

/* Hover effect - scale up the hovered segment */
:deep(path:hover) {
  transform: scale(1);
  filter: brightness(1.15);
}

/* Selected segment - keep it highlighted */
:deep(path.is-selected) {
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 2px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)) brightness(1.1);
}

/* When a selection exists, dim all non-selected segments */
/* .has-selection :deep(path:not(.is-selected)) {
    opacity: 0.3;
    filter: grayscale(0.4);
  } */

/* But keep the selected one fully visible */
/* .has-selection :deep(path.is-selected) {
    opacity: 1;
    filter: brightness(1.2);
  } */

/* Ensure hover still works even when dimmed */
/* .has-selection :deep(path:not(.is-selected):hover) {
    opacity: 0.6;
    filter: grayscale(0.2);
    transform: scale(1.03);
  }  */
</style>
