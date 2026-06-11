import { computed, ref, type Ref } from "vue";
import type { DataTablePageEvent, DataTableSortEvent } from "primevue/datatable";
import { getInventario, type InventoryFilters, type InventorySort } from "@/api/api.service";
import type { PaginationInfo } from "@/api/data-sharing.service";
import { LEGO_FILTER_OPTIONS, PIEZA_FILTER_OPTIONS } from "@/constants/inventory";
import { useServerPagination } from "@/composables/useServerPagination";

export function useInventoryTable(column: Ref<string>, searchValue: Ref<string>) {
  const inventoryData = ref<Record<string, unknown>[]>([]);
  const pagination = ref<PaginationInfo | null>(null);
  const loading = ref(false);
  const filterField = ref("");
  const filterValue = ref("");
  const sortField = ref<string | undefined>();
  const sortOrder = ref<1 | -1 | 0 | undefined>();

  let filterDebounce: ReturnType<typeof setTimeout> | null = null;

  const filterOptions = computed(() =>
    column.value === "lego"
      ? [...LEGO_FILTER_OPTIONS]
      : [...PIEZA_FILTER_OPTIONS],
  );

  const hasActiveFilter = computed(
    () => Boolean(filterField.value && filterValue.value.trim()),
  );

  const { rows, totalRecords, first, resetFirst, applyPageEvent, isDuplicatePageEvent } =
    useServerPagination(pagination);

  function resetSort() {
    sortField.value = undefined;
    sortOrder.value = undefined;
  }

  function resetQueryState() {
    filterField.value = "";
    filterValue.value = "";
    resetSort();
    resetFirst();
  }

  function buildSort(): InventorySort | null {
    if (!sortField.value || !sortOrder.value) return null;
    return {
      sortBy: sortField.value,
      sortOrder: sortOrder.value === -1 ? "desc" : "asc",
    };
  }

  function buildFilters(): InventoryFilters {
    const field = filterField.value;
    const value = filterValue.value.trim();
    if (!field || !value) return {};
    return { [field]: value };
  }

  async function fetchInventory(page = 1, pageSize = pagination.value?.pageSize ?? 6) {
    if (!column.value || !searchValue.value.trim()) {
      inventoryData.value = [];
      pagination.value = null;
      resetSort();
      return;
    }

    loading.value = true;
    try {
      const results = await getInventario(
        column.value,
        searchValue.value.trim(),
        page,
        pageSize,
        buildFilters(),
        buildSort(),
      );
      inventoryData.value = results?.inventario?.results ?? [];
      pagination.value = results?.inventario?.pagination ?? null;
    } catch (error) {
      console.error(error);
      inventoryData.value = [];
      pagination.value = null;
    } finally {
      loading.value = false;
    }
  }

  function onPage(event: DataTablePageEvent) {
    if (isDuplicatePageEvent(event, loading)) return;
    applyPageEvent(event);
    fetchInventory(event.page + 1, event.rows);
  }

  function onSort(event: DataTableSortEvent) {
    const field = event.sortField as string | undefined;
    const order = event.sortOrder ?? undefined;
    if (field === sortField.value && order === sortOrder.value) return;

    sortField.value = field;
    sortOrder.value = order;
    resetFirst();
    fetchInventory(1, pagination.value?.pageSize ?? 6);
  }

  function clearFilter() {
    filterField.value = "";
    filterValue.value = "";
    resetSort();
    resetFirst();
    fetchInventory(1, pagination.value?.pageSize ?? 6);
  }

  function onFilterInput() {
    if (filterDebounce) clearTimeout(filterDebounce);
    filterDebounce = setTimeout(() => {
      if (!filterField.value) return;
      resetSort();
      resetFirst();
      fetchInventory(1, pagination.value?.pageSize ?? 6);
    }, 500);
  }

  function onFilterFieldChange() {
    resetSort();
    resetFirst();
    if (!filterField.value || filterValue.value.trim()) {
      fetchInventory(1, pagination.value?.pageSize ?? 6);
    }
  }

  return {
    inventoryData,
    pagination,
    loading,
    filterField,
    filterValue,
    sortField,
    sortOrder,
    filterOptions,
    hasActiveFilter,
    rows,
    totalRecords,
    first,
    fetchInventory,
    resetQueryState,
    onPage,
    onSort,
    clearFilter,
    onFilterInput,
    onFilterFieldChange,
  };
}
