import { computed, ref, type Ref } from "vue";
import type { DataTablePageEvent } from "primevue/datatable";
import type { PaginationInfo } from "@/api/data-sharing.service";

export function useServerPagination(
  pagination: Ref<PaginationInfo | null>,
  defaultPageSize = 6,
) {
  const rows = computed(() => pagination.value?.pageSize ?? defaultPageSize);
  const totalRecords = computed(() => pagination.value?.total ?? 0);
  const first = ref(0);

  function resetFirst() {
    first.value = 0;
  }

  function applyPageEvent(event: DataTablePageEvent) {
    first.value = event.first;
  }

  function isDuplicatePageEvent(event: DataTablePageEvent, loading: Ref<boolean>) {
    if (loading.value) return true;

    const nextPage = event.page + 1;
    const currentPage = pagination.value?.page ?? 1;
    const currentSize = pagination.value?.pageSize ?? defaultPageSize;

    return nextPage === currentPage && event.rows === currentSize;
  }

  return {
    rows,
    totalRecords,
    first,
    resetFirst,
    applyPageEvent,
    isDuplicatePageEvent,
  };
}
