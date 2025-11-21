<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center gap-4">
        <div class="text-lg font-medium text-gray-100">Assets</div>
        <UInput
          v-model="searchQuery"
          class="max-w-sm min-w-[12ch]"
          placeholder="Search tokens..."
          icon="i-lucide-search"
          size="md"
          clearable
          @update:model-value="handleSearchInput"
        />
      </div>
    </template>
    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:pagination="pagination"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :data="filteredTokens"
      :columns="columns"
      :loading="isLoading"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
    >
      <template #expanded="{ row }">
        <div class="px-4 py-4 space-y-3">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-400">Network:</span>
              <span class="ml-2 font-medium">{{ row.original.network }}</span>
            </div>
            <div>
              <span class="text-gray-400">Token Address:</span>
              <span class="ml-2 font-mono text-xs">
                {{ row.original.tokenAddress || "Native Token" }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">Balance:</span>
              <span class="ml-2 font-medium">
                {{ formatBalance(row.original.tokenBalance) }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">Price:</span>
              <span class="ml-2 font-medium">
                {{ formatCurrency(row.original.tokenPrice) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </UTable>
    <template #footer>
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent, computed, onBeforeUnmount } from "vue";
import { debounce } from "lodash-es";
import type { TableColumn } from "@nuxt/ui";
import ChainIcon from "./ChainIcon.vue";
import Token from "./Token.vue";
import { getPaginationRowModel } from "@tanstack/vue-table";

const props = defineProps<{
  tokens: TokenDto[];
  isLoading: boolean;
}>();

const table = useTemplateRef("table");

const searchQuery = ref<string>("");
const debouncedSearchQuery = ref<string>("");
const expanded = ref<Record<string, boolean>>({});
const pagination = ref<{ pageIndex: number; pageSize: number }>({
  pageIndex: 0,
  pageSize: 10,
});
const filteredTokens = computed<TokenDto[]>(() => {
  if (!debouncedSearchQuery.value.trim()) {
    return props.tokens;
  }

  const searchLower = debouncedSearchQuery.value.toLowerCase().trim();

  return props.tokens.filter(token => {
    const name = token.tokenMetadata?.name?.toLowerCase() || "";
    const symbol = token.tokenMetadata?.symbol?.toLowerCase() || "";

    return name.includes(searchLower) || symbol.includes(searchLower);
  });
});

const formatBalance = (balance: number): string => {
  if (balance === 0) return "0";
  if (balance < 0.0001) return balance.toExponential(2);
  if (balance < 1) return balance.toFixed(6);
  if (balance < 1000) return balance.toFixed(4);
  return balance.toFixed(2);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const updateDebouncedSearch = debounce((value: string) => {
  debouncedSearchQuery.value = value;
}, 300);

const handleSearchInput = (value: string) => {
  if (!value.trim()) {
    updateDebouncedSearch.cancel();
    debouncedSearchQuery.value = "";
    pagination.value.pageIndex = 0; // Reset to first page when search is cleared
    return;
  }
  pagination.value.pageIndex = 0; // Reset to first page when search changes
  updateDebouncedSearch(value);
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
    accessorKey: "network",
    header: "Chain",
    cell: ({ row }) => {
      return h(ChainIcon, {
        network: row.getValue("network") as NetworkId,
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
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Value",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const amount = row.getValue("tokenValue") as number;
      return formatCurrency(amount);
    },
  },
];

onBeforeUnmount(() => {
  updateDebouncedSearch.cancel();
});
</script>
