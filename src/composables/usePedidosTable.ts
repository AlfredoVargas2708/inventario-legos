import { computed, ref, watch } from "vue";
import type { DataTablePageEvent, DataTableSortEvent } from "primevue/datatable";
import { useDataSharingService } from "@/api/data-sharing.service";
import type { PedidosFilters, PedidosSort } from "@/api/api.service";
import {
  BOOLEAN_PEDIDOS_FILTER_FIELDS,
  LEGO_PEDIDOS_FILTER_OPTIONS,
  PIEZA_PEDIDOS_FILTER_OPTIONS,
  SI_NO_FILTER_OPTIONS,
} from "@/constants/pedidos";
import type { CatalogFilterConfig } from "@/constants/inventory";
import { useServerPagination } from "@/composables/useServerPagination";
import { storeToRefs } from "pinia";

function getFilterOptionsForColumn(column: string) {
  return column === "pieza"
    ? [...PIEZA_PEDIDOS_FILTER_OPTIONS]
    : [...LEGO_PEDIDOS_FILTER_OPTIONS];
}

export function usePedidosTable() {
  const dataService = useDataSharingService();
  const { pagination, loading, pedidosFilters, pedidosSort, column } =
    storeToRefs(dataService);

  const storedFilter = Object.entries(pedidosFilters.value)[0];

  const filterField = ref(storedFilter?.[0] ?? "");
  const filterValue = ref(storedFilter?.[1] ?? "");
  const sortField = ref<string | undefined>(pedidosSort.value?.sortBy);
  const sortOrder = ref<1 | -1 | 0 | undefined>(
    pedidosSort.value?.sortOrder === "desc"
      ? -1
      : pedidosSort.value?.sortOrder === "asc"
        ? 1
        : undefined,
  );

  let filterDebounce: ReturnType<typeof setTimeout> | null = null;

  const filterOptions = computed(() => getFilterOptionsForColumn(column.value));

  const hasActiveFilter = computed(() => Boolean(filterField.value && filterValue.value.trim()));

  const catalogFilter = computed((): CatalogFilterConfig | null => {
    if (
      filterField.value &&
      BOOLEAN_PEDIDOS_FILTER_FIELDS.has(filterField.value)
    ) {
      return {
        field: filterField.value,
        options: [...SI_NO_FILTER_OPTIONS],
        placeholder: "Elige Sí o No",
      };
    }

    return null;
  });

  const { rows, totalRecords, first, resetFirst, applyPageEvent, isDuplicatePageEvent } =
    useServerPagination(pagination, 6);

  watch(column, () => {
    const validFields = new Set<string>(
      filterOptions.value.map((option) => option.value),
    );
    if (filterField.value && !validFields.has(filterField.value)) {
      filterField.value = "";
      filterValue.value = "";
      resetSort();
      resetFirst();
      dataService.resetPedidosQuery();
    }
  });

  function resetSort() {
    sortField.value = undefined;
    sortOrder.value = undefined;
  }

  function resetQueryState() {
    filterField.value = "";
    filterValue.value = "";
    resetSort();
    resetFirst();
    dataService.resetPedidosQuery();
  }

  function buildSort(): PedidosSort | null {
    if (!sortField.value || !sortOrder.value) return null;
    return {
      sortBy: sortField.value,
      sortOrder: sortOrder.value === -1 ? "desc" : "asc",
    };
  }

  function buildFilters(): PedidosFilters {
    const field = filterField.value;
    const value = filterValue.value.trim();
    if (!field || !value) return {};
    return { [field]: value };
  }

  async function fetchPedidos(page = 1, pageSize = pagination.value?.pageSize ?? 6) {
    await dataService.fetchSearch(page, pageSize, {
      filters: buildFilters(),
      sort: buildSort(),
    });
  }

  function onPage(event: DataTablePageEvent) {
    if (isDuplicatePageEvent(event, loading)) return;
    applyPageEvent(event);
    fetchPedidos(event.page + 1, event.rows);
  }

  function onSort(event: DataTableSortEvent) {
    const field = event.sortField as string | undefined;
    const order = event.sortOrder ?? undefined;
    if (field === sortField.value && order === sortOrder.value) return;

    sortField.value = field;
    sortOrder.value = order;
    resetFirst();
    fetchPedidos(1, pagination.value?.pageSize ?? 6);
  }

  function clearFilter() {
    filterField.value = "";
    filterValue.value = "";
    resetSort();
    resetFirst();
    fetchPedidos(1, pagination.value?.pageSize ?? 6);
  }

  function onFilterInput() {
    if (filterDebounce) clearTimeout(filterDebounce);
    filterDebounce = setTimeout(() => {
      if (!filterField.value) return;
      resetSort();
      resetFirst();
      fetchPedidos(1, pagination.value?.pageSize ?? 6);
    }, 500);
  }

  function onFilterFieldChange() {
    filterValue.value = "";
    resetSort();
    resetFirst();
    if (!filterField.value) {
      fetchPedidos(1, pagination.value?.pageSize ?? 6);
    }
  }

  return {
    filterField,
    filterValue,
    sortField,
    sortOrder,
    filterOptions,
    hasActiveFilter,
    catalogFilter,
    rows,
    totalRecords,
    first,
    resetQueryState,
    fetchPedidos,
    onPage,
    onSort,
    clearFilter,
    onFilterInput,
    onFilterFieldChange,
  };
}
