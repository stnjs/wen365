<template>
  <UCard class="bg-app-card border-muted relative overflow-hidden">
    <div class="p-8 flex flex-col justify-between min-h-50 relative z-10">
      <div>
        <span class="text-xs font-medium text-dimmed uppercase tracking-wider"
          >Total Net Worth</span
        >
        <div class="text-4xl text-default font-semibold tracking-tight mt-1 mb-2">
          <span>{{ dollars }}</span
          ><span class="text-2xl">.{{ cents }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="hasChange"
            :color="isPositive ? 'success' : 'error'"
            variant="subtle"
            size="lg"
          >
            <UIcon
              :name="isPositive ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              class="size-5 mr-0.5"
            />
            {{ isPositive ? "+" : "" }}{{ formatCurrency(props.valueChange24h!) }} ({{
              Math.abs(props.valueChangePercent24h!).toFixed(2)
            }}%)
          </UBadge>
          <span class="text-xs font-medium text-dimmed uppercase tracking-wider">24h</span>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 bg-grid-sm pointer-events-none" />
  </UCard>
</template>

<script setup lang="ts">
interface NetWorthCardProps {
  totalValue?: number;
  valueChange24h?: number | null;
  valueChangePercent24h?: number | null;
}

const props = defineProps<NetWorthCardProps>();

// Round to integer cents once, then split — sidesteps the floating-point
// drift that makes `(100.05 % 1) * 100` evaluate to 4.999999…
const totalCents = computed<number>(() => Math.round((props.totalValue || 0) * 100));
const dollars = computed<string>(() =>
  formatCurrency(Math.trunc(totalCents.value / 100), { maximumFractionDigits: 0 }),
);
const cents = computed<string>(() =>
  Math.abs(totalCents.value % 100)
    .toString()
    .padStart(2, "0"),
);

const hasChange = computed<boolean>(
  () => props.valueChange24h != null && props.valueChangePercent24h != null,
);
const isPositive = computed<boolean>(() => (props.valueChange24h ?? 0) >= 0);
</script>
