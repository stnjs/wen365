<template>
  <div class="p-2 relative">
    <!-- Header: value change + time range selector -->
    <div class="flex items-center justify-between mb-4">
      <div v-if="history && history.snapshots.length >= 2" class="flex items-center gap-2">
        <span
          class="text-sm font-medium"
          :class="history.valueChange >= 0 ? 'text-emerald-400' : 'text-red-400'"
        >
          {{ history.valueChange >= 0 ? "+" : "" }}{{ formatCurrency(history.valueChange) }}
        </span>
        <span
          class="text-xs px-1.5 py-0.5 rounded"
          :class="
            history.valueChangePercent >= 0
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          "
        >
          <UIcon
            :name="
              history.valueChangePercent >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'
            "
            class="w-3 h-3 inline-block mr-0.5 align-text-bottom"
          />
          {{ Math.abs(history.valueChangePercent).toFixed(2) }}%
        </span>
      </div>
      <div v-else />

      <div class="flex gap-1">
        <UButton
          v-for="range in timeRanges"
          :key="range.label"
          size="xs"
          variant="ghost"
          active-variant="soft"
          color="neutral"
          :label="range.label"
          :active="selectedDays === range.days"
          @click="selectedDays = range.days"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="h-50 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-dimmed" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!chartData.length"
      class="h-50 flex items-center justify-center text-dimmed text-sm"
    >
      No snapshot data available yet
    </div>

    <!-- Chart -->
    <div v-else class="">
      <VisXYContainer
        :data="chartData"
        :padding="{ top: 4, right: 0, bottom: 0, left: 0 }"
        :svg-defs="svgDefs"
        class="h-50"
      >
        <VisArea :x="x" :y="y" color="url(#portfolioGradient)" curve-type="linear" />
        <VisLine :x="x" :y="y" :color="lineColor" :line-width="2" curve-type="linear" />
        <VisAxis
          type="x"
          :tick-format="tickFormat"
          :tick-values="tickValues"
          :grid-line="false"
          :tick-line="true"
          :domain-line="false"
          tick-text-color="var(--color-zinc-500)"
          tick-text-font-size="10px"
        />
        <VisCrosshair color="var(--color-emerald-500)" :template="template" />
        <VisTooltip />
      </VisXYContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisTooltip } from "@unovis/vue";
import { useQuery } from "@tanstack/vue-query";
import { usePortfolioHistory } from "~/composables/queries/usePortfolioHistory";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

interface ChartDatum {
  timestamp: number;
  value: number;
}

const props = defineProps<{
  address?: string;
  /** Current live portfolio value to append as the latest data point */
  currentValue?: number;
  /** Use mock endpoint instead of real data (dev only) */
  useMock?: boolean;
}>();

const timeRanges = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
] as const;

const selectedDays = ref<number>(30);

const mockQuery = useQuery<PortfolioHistoryDto>({
  queryKey: ["portfolioHistory", "mock", selectedDays],
  queryFn: () => $fetch("/api/portfolio/mock-history", { query: { days: selectedDays.value } }),
  enabled: computed(() => !!props.useMock),
  staleTime: 0,
});

const realQuery = usePortfolioHistory(
  computed(() => props.address ?? null),
  { days: selectedDays },
);

const history = computed(() => (props.useMock ? mockQuery.data.value : realQuery.data.value));
const isLoading = computed(() =>
  props.useMock ? mockQuery.isLoading.value : realQuery.isLoading.value,
);

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const chartData = computed<ChartDatum[]>(() => {
  if (!history.value?.snapshots.length) return [];

  const todayStart = startOfDay(Date.now());

  let points = history.value.snapshots.map(s => ({
    timestamp: startOfDay(new Date(s.timestamp).getTime()),
    value: s.totalValue,
  }));

  if (props.currentValue != null) {
    points = points.filter(p => p.timestamp < todayStart);
    points.push({ timestamp: todayStart, value: props.currentValue });
  }

  return points;
});

const x = (d: ChartDatum) => d.timestamp;
const y = (d: ChartDatum) => d.value;

const lineColor = computed(() =>
  history.value && history.value.valueChange >= 0
    ? "var(--color-emerald-500)"
    : "var(--color-red-500)",
);

const svgDefs = computed(() => {
  const stopColor = lineColor.value;
  return `
    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${stopColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${stopColor}" stop-opacity="0" />
    </linearGradient>
  `;
});

const tickValues = computed<number[]>(() => {
  const data = chartData.value;
  if (data.length === 0) return [];

  const maxTicks = selectedDays.value <= 7 ? data.length : 5;
  if (data.length <= maxTicks) return data.map(d => d.timestamp);

  const step = (data.length - 1) / (maxTicks - 1);
  return Array.from({ length: maxTicks }, (_, i) => {
    const point = data[Math.round(i * step)];
    return point ? point.timestamp : 0;
  });
});

const dataSpanDays = computed(() => {
  const data = chartData.value;
  const first = data.at(0);
  const last = data.at(-1);
  if (!first || !last) return 0;
  return (last.timestamp - first.timestamp) / (24 * 60 * 60 * 1000);
});

const tickFormat = (tick: number | Date): string => {
  const date = tick instanceof Date ? tick : new Date(tick);
  const span = dataSpanDays.value;
  if (span <= 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (span <= 90) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const template = (d: ChartDatum) => {
  const date = new Date(d.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `<div">
      <div class="text-xs text-zinc-400">${date}</div>
      <div class="text-sm text-white font-medium">${formatCurrency(d.value)}</div>
    </div>`;
};
</script>

<style lang="css" scoped>
.unovis-xy-container {
  --vis-font-family: var(--font-sans);
  --vis-dark-tooltip-background-color: var(--color-zinc-900);
  --vis-crosshair-line-stroke-color: var(--color-emerald-500);
  --vis-crosshair-circle-stroke-color: var(--color-emerald-500);
  --vis-dark-crosshair-line-stroke-color: var(--color-emerald-500);
  --vis-dark-crosshair-circle-stroke-color: var(--color-emerald-500);
}
</style>
