import { defineStore } from "pinia";
import { ref } from "vue";

export const useDataSharingService = defineStore("dataSharing", () => {
  const column = ref<string>("");
  const searchValue = ref<string>("");
  const tableData = ref<any[]>();

  function setColumn(columnValue: string) {
    column.value = columnValue;
  }

  function getColumn() {
    return column.value;
  }

  function setSearchValue(search: string) {
    searchValue.value = search;
  }

  function getSearchValue() {
    return searchValue.value;
  }

  function setTableData(data: any[]) {
    tableData.value = data;
  }

  function getTableData() {
    return tableData;
  }

  return {
    column,
    searchValue,
    tableData,
    setColumn,
    getColumn,
    setSearchValue,
    getSearchValue,
    setTableData,
    getTableData,
  };
});
