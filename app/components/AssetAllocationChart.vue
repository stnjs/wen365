<template>
  <div
    class="h-58 w-full relative donut-chart-container"
    :class="{ 'has-selection': selectedItem }"
  >
    <VisSingleContainer :data="chartData" class="h-full" :events="containerEvents">
      <VisDonut
        :value="value"
        :color="color"
        :arc-width="20"
        :padding="{ top: 10, bottom: 10, left: 10, right: 10 }"
        :pad-angle="0.03"
        :corner-radius="6"
        :events="events"
      />
      <VisTooltip :triggers="triggers" />
    </VisSingleContainer>

    <!-- Central text for the donut -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center flex-col gap-1"
    >
      <UIcon v-if="props.isLoading" name="i-lucide-loader-circle" class="size-10 animate-spin" />
      <template v-else-if="selectedItem">
        <template v-if="selectedItem.type === 'token'">
          <span class="text-xs text-dimmed font-light">{{
            selectedItem.data.tokenMetadata.symbol
          }}</span>
          <span class="text-default text-xl font-medium">{{
            formatCurrency(selectedItem.data.tokenValue)
          }}</span>
          <UBadge color="success" variant="subtle" size="md">{{
            formatPercent(selectedItem.data.percentage)
          }}</UBadge>
        </template>
        <template v-else>
          <span class="text-xs text-dimmed font-light"
            >Other ({{ selectedItem.tokens.length }} assets)</span
          >
          <span class="text-default text-xl font-medium">{{
            formatCurrency(selectedItem.totalValue)
          }}</span>
          <UBadge color="success" variant="subtle" size="md">{{
            formatPercent(selectedItem.percentage)
          }}</UBadge>
        </template>
      </template>
      <template v-else>
        <span class="text-xs text-dimmed font-light">Total Portfolio Value:</span>
        <span class="text-default text-xl font-medium">{{
          formatCurrency(props.totalValue || 0)
        }}</span>
        <UBadge color="success" variant="subtle" size="md">{{ formatPercent(100) }}</UBadge>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";

const colorPalette = [
  "var(--color-emerald-400)",
  "var(--color-sky-400)",
  "var(--color-violet-400)",
  "var(--color-amber-400)",
  "var(--color-gray-400)",
];

type ChartDataItem =
  | { type: "token"; data: TokenDto }
  | { type: "other"; tokens: TokenDto[]; totalValue: number; percentage: number };

const props = defineProps<{ data: TokenDto[]; totalValue?: number; isLoading?: boolean }>();

const selectedItem = ref<ChartDataItem | undefined>();

// Process data: show top 4 assets, group rest as "Other"
const chartData = computed<ChartDataItem[]>(() => {
  const sorted = [...props.data].sort((a, b) => b.percentage - a.percentage);

  if (sorted.length <= 5) {
    return sorted.map(token => ({ type: "token" as const, data: token }));
  }

  const top4 = sorted.slice(0, 4).map(token => ({ type: "token" as const, data: token }));
  const others = sorted.slice(4);
  const otherItem: ChartDataItem = {
    type: "other" as const,
    tokens: others,
    totalValue: others.reduce((sum, t) => sum + t.tokenValue, 0),
    percentage: others.reduce((sum, t) => sum + t.percentage, 0),
  };

  return [...top4, otherItem];
});

const value = (d: ChartDataItem) => (d.type === "token" ? d.data.percentage : d.percentage);

const color = (_d: ChartDataItem, i: number) => colorPalette[i % colorPalette.length];

/**
 * Get unique identifier for a chart data item
 */
const getItemIdentifier = (item: ChartDataItem | undefined): string => {
  if (!item) return "";
  if (item.type === "other") return "other";
  return `${item.data.network}:${item.data.tokenAddress}`;
};

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
      d: { data: ChartDataItem },
      event: MouseEvent,
      _index: number,
      elements: SVGPathElement[],
    ) => {
      event.stopPropagation();
      const clickedElement = elements[_index];

      const currentIdentifier = getItemIdentifier(selectedItem.value);
      const clickedIdentifier = getItemIdentifier(d.data);

      // Toggle off if clicking the same segment
      if (currentIdentifier === clickedIdentifier) {
        clearAllSelections();
        selectedItem.value = undefined;
      } else {
        // Clear previous selection and set new one
        clearAllSelections();
        clickedElement?.classList.add("is-selected");
        selectedItem.value = d.data;
      }
    },
  },
};

const containerEvents = {
  click: () => {
    clearAllSelections();
    selectedItem.value = undefined;
  },
};

const triggers = {
  [Donut.selectors.segment]: (d: { data: ChartDataItem }) => {
    const item = d.data;
    if (item.type === "token") {
      const symbol = item.data.tokenMetadata.symbol || "Unknown";
      const percentage = formatPercent(item.data.percentage);
      return `<div class="text-xs">
        <span class="font-bold text-white">${symbol}</span>: 
        <span class="text-zinc-400">${percentage}</span>
      </div>`;
    } else {
      const percentage = formatPercent(item.percentage);
      return `<div class="text-xs">
        <span class="font-bold text-white">Other (${item.tokens.length})</span>: 
        <span class="text-zinc-400">${percentage}</span>
      </div>`;
    }
  },
};
</script>
<style lang="css" scoped>
.unovis-single-container {
  --vis-font-family: var(--font-sans);
  --vis-dark-tooltip-background-color: var(--color-zinc-900);
}

:deep(path) {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    filter 0.2s ease;
  transform-origin: center;
  transform-box: fill-box;
}

:deep(path:hover) {
  transform: scale(1);
  filter: brightness(1.15);
}

:deep(path.is-selected) {
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 3px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)) brightness(1.1);
}
</style>
