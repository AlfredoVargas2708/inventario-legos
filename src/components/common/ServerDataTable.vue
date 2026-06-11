<script setup lang="ts">
import { computed } from "vue";
import type { DataTablePageEvent, DataTableSortEvent } from "primevue/datatable";
import DataTable from "primevue/datatable";
import {
  DATA_TABLE_PAGE_REPORT,
  DATA_TABLE_PAGINATOR_TEMPLATE,
  ROWS_PER_PAGE_OPTIONS,
} from "@/constants/inventory";

const props = defineProps<{
  value: unknown[];
  rows: number;
  totalRecords: number;
  first: number;
  loading?: boolean;
  sortField?: string;
  sortOrder?: 1 | -1 | 0;
  minWidth?: string;
}>();

defineEmits<{
  page: [event: DataTablePageEvent];
  sort: [event: DataTableSortEvent];
}>();

const tableSort = computed(() => {
  if (!props.sortField || props.sortOrder == null || props.sortOrder === 0) {
    return {};
  }

  return {
    sortField: props.sortField,
    sortOrder: props.sortOrder,
  };
});
</script>

<template>
  <DataTable
    v-bind="tableSort"
    :value="value"
    lazy
    paginator
    :rows="rows"
    :total-records="totalRecords"
    :first="first"
    :loading="loading"
    :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
    :current-page-report-template="DATA_TABLE_PAGE_REPORT"
    :template="DATA_TABLE_PAGINATOR_TEMPLATE"
    striped-rows
    size="small"
    class="inventory-table"
    :pt="{ table: { style: `min-width: ${minWidth ?? '40rem'}` } }"
    @page="$emit('page', $event)"
    @sort="$emit('sort', $event)"
  >
    <slot />
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </DataTable>
</template>

<style scoped src="@/assets/styles/table.css"></style>
