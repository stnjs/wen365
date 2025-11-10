<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Assets</h3>
    </template>

    <UTable
      v-model:expanded="expanded"
      :data="tokens"
      :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <div class="px-4 py-4 space-y-3">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Network:</span>
              <span class="ml-2 font-medium">{{ row.original.network }}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Token Address:</span>
              <span class="ml-2 font-mono text-xs">
                {{ row.original.tokenAddress || "Native Token" }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Balance:</span>
              <span class="ml-2 font-medium">
                {{ formatBalance(row.original.tokenBalance) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Price:</span>
              <span class="ml-2 font-medium">
                {{ formatCurrency(row.original.tokenPrice) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import Token from "./Token.vue";

const props = defineProps<{
  tokens: TokenDto[];
}>();

const expanded = ref<Record<string, boolean>>({});

// Format balance with appropriate decimals
const formatBalance = (balance: number): string => {
  if (balance === 0) return "0";
  if (balance < 0.0001) return balance.toExponential(2);
  if (balance < 1) return balance.toFixed(6);
  if (balance < 1000) return balance.toFixed(4);
  return balance.toFixed(2);
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const UButton = resolveComponent("UButton");
const columns: TableColumn<TokenDto>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "tokenMetadata",
    header: "Token",
    cell: ({ row }) => {
      return h(Token, {
        tokenMetadata: row.getValue("tokenMetadata") as TokenMetadataDto,
      });
    },
  },
  {
    accessorKey: "tokenBalance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("tokenBalance") as number;
      return formatBalance(balance);
    },
  },
  {
    accessorKey: "tokenPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("tokenPrice") as number;
      return formatCurrency(price);
    },
  },
  {
    accessorKey: "tokenValue",
    header: "Value",
    cell: ({ row }) => {
      const amount = row.getValue("tokenValue") as number;
      return formatCurrency(amount);
    },
  },
];
</script>
