<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Test</h3>
    </template>
    <!--     <div class="flex px-4 py-3.5">
      <UInput
        :model-value="(table?.tableApi?.getColumn('email')?.getFilterValue() as string)"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filter emails..."
        @update:model-value="
          table?.tableApi?.getColumn('email')?.setFilterValue($event)
        "
      />
    </div> -->

    <UTable
      v-model:expanded="expanded"
      :data="tokens"
      :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  tokens: TokenDto[];
}>();

const expanded = ref<Record<string, boolean>>({});

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
      return (row.getValue("tokenMetadata") as TokenMetadataDto).symbol || "ETH";
    },
  },
  {
    accessorKey: "tokenBalance",
    header: "Amount",
    cell: ({ row }) => {
      return row.getValue("tokenBalance") as string;
    },
  },
  {
    accessorKey: "tokenPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("tokenPrice") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return formatted;
    },
  },
  {
    accessorKey: "tokenValue",
    header: "Value",
    cell: ({ row }) => {
      const amount = row.getValue("tokenValue") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return formatted;
    },
  },
];
</script>
