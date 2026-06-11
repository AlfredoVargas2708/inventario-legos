import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { searchValue as searchApi } from "@/api/api.service";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const useDataSharingService = defineStore("dataSharing", () => {
  const column = ref<string>("");
  const searchValue = ref<string>("");
  const tableData = ref<any[]>([]);
  const valueInfo = ref<any>();
  const pagination = ref<PaginationInfo | null>(null);
  const loading = ref(false);

  let abortController: AbortController | null = null;

  async function fetchSearch(page = 1, pageSize = 6, options?: { throwOnError?: boolean }) {
    if (!column.value || !searchValue.value.trim()) return;

    abortController?.abort();
    abortController = new AbortController();
    loading.value = true;

    try {
      const results = await searchApi(
        column.value,
        searchValue.value,
        page,
        pageSize,
        abortController.signal,
      );

      tableData.value = results?.pedidos?.results ?? [];
      valueInfo.value = results;
      pagination.value = results?.pagination ?? null;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(error);
        clearResults();
        if (options?.throwOnError) throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  function setColumn(columnValue: string) {
    column.value = columnValue;
  }

  function setSearchValue(search: string) {
    searchValue.value = search;
  }

  function clearResults() {
    tableData.value = [];
    valueInfo.value = null;
    pagination.value = null;
  }

  async function refreshResults() {
    const page = pagination.value?.page ?? 1;
    const pageSize = pagination.value?.pageSize ?? 6;
    await fetchSearch(page, pageSize);
  }

  return {
    column,
    searchValue,
    tableData,
    valueInfo,
    pagination,
    loading,
    setColumn,
    setSearchValue,
    fetchSearch,
    refreshResults,
    clearResults,
  };
});
