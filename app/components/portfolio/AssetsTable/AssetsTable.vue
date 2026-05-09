<template>
  <UCard class="bg-app-card border-muted">
    <template #header>
      <div class="flex justify-between items-center gap-4">
        <div class="text-lg font-medium text-default">Assets</div>
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
      :column-visibility="columnVisibility"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :data="filteredTokens"
      :columns="columns"
      :loading="isLoading"
      :on-select="onRowSelect"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
    >
      <template #expanded="{ row }">
        <div class="py-4 space-y-3 md:hidden">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-muted">Name:</span>
              <span class="ml-2 font-medium text-default">
                {{ row.original.tokenMetadata.name ?? "" }}
              </span>
            </div>
            <div>
              <span class="text-muted">Chain:</span>
              <span class="ml-2 font-medium text-default">
                {{ networkToNameMap[row.original.network] }}
              </span>
            </div>
            <div class="col-span-2">
              <span class="text-muted">Contract:</span>
              <span class="ml-2 font-mono text-xs text-default break-all">
                {{
                  row.original.tokenAddress
                    ? truncateAddress(row.original.tokenAddress)
                    : "Native token"
                }}
              </span>
              <CopyToClipboardButton
                v-if="row.original.tokenAddress"
                :text="row.original.tokenAddress"
                copy-label="Copy contract address"
              />
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
import { h, resolveComponent, computed, onBeforeUnmount, watch } from "vue";
import { debounce } from "lodash-es";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import ChainIcon from "./ChainIcon.vue";
import Token from "./Token.vue";
import { networkToNameMap } from "./config";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { breakpointsTailwind } from "@vueuse/core";

const props = defineProps<{
  tokens: TokenDto[];
  isLoading: boolean;
}>();

const table = useTemplateRef("table");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isDesktop = breakpoints.greaterOrEqual("md");

const columnVisibility = computed<Record<string, boolean>>(() => {
  if (isDesktop.value) return {};
  const visibility: Record<string, boolean> = {
    chain: false,
    tokenBalance: false,
    tokenPrice: false,
  };
  return visibility;
});

const onRowSelect = computed<((event: Event, row: Row<TokenDto>) => void) | undefined>(() => {
  if (isDesktop.value) return undefined;
  return (_event, row) => row.toggleExpanded();
});

const searchQuery = ref<string>("");
const debouncedSearchQuery = ref<string>("");
const expanded = ref<Record<string, boolean>>({});
const pagination = ref<{ pageIndex: number; pageSize: number }>({
  pageIndex: 0,
  pageSize: 10,
});

watch(isDesktop, desktop => {
  if (desktop) expanded.value = {};
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

const updateDebouncedSearch = debounce((value: string) => {
  debouncedSearchQuery.value = value;
}, 300);

const handleSearchInput = (value: string) => {
  if (!value.trim()) {
    updateDebouncedSearch.cancel();
    debouncedSearchQuery.value = "";
    pagination.value.pageIndex = 0;
    return;
  }
  pagination.value.pageIndex = 0;
  updateDebouncedSearch(value);
};

const UButton = resolveComponent("UButton");

const columns: TableColumn<TokenDto>[] = [
  {
    id: "token",
    accessorKey: "tokenMetadata",
    header: "Token",
    cell: ({ row }) => {
      return h(Token, {
        tokenMetadata: row.getValue("token") as TokenMetadataDto,
        tokenAddress: row.original.tokenAddress,
        network: row.original.network,
        tokenBalance: row.original.tokenBalance,
        compact: !isDesktop.value,
      });
    },
  },
  {
    id: "chain",
    accessorKey: "network",
    header: "Chain",
    cell: ({ row }) => {
      return h(ChainIcon, {
        network: row.getValue("chain") as NetworkId,
      });
    },
  },
  {
    id: "tokenBalance",
    accessorKey: "tokenBalance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("tokenBalance") as number;
      return formatBalance(balance);
    },
  },
  {
    id: "tokenPrice",
    accessorKey: "tokenPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("tokenPrice") as number;
      return formatCurrency(price);
    },
  },
  {
    id: "tokenValue",
    accessorKey: "tokenValue",
    meta: {
      class: {
        th: "text-end",
        td: "text-end",
      },
    },
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
        class: "-me-2.5 -ms-0.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const value = row.getValue("tokenValue") as number;
      if (isDesktop.value) return formatCurrency(value);
      const price = row.original.tokenPrice;
      return h("div", { class: "flex flex-col items-end leading-tight" }, [
        h("span", { class: "font-medium text-default" }, formatCurrency(value)),
        h("span", { class: "text-xs text-muted" }, formatCurrency(price)),
      ]);
    },
  },
];

onBeforeUnmount(() => {
  updateDebouncedSearch.cancel();
});
</script>
