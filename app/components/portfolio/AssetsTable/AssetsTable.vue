<template>
  <div class="w-full">
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
  </div>
</template>

<script setup lang="ts">
import { columns } from "./config";

const props = defineProps<{
  tokens: TokenDto[];
}>();

const expanded = ref<Record<string, boolean>>({});
</script>
