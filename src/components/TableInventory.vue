<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { DataTablePageEvent } from "primevue/datatable";
import { useDataSharingService, type PaginationInfo } from "@/api/data-sharing.service";
import { getInventario, type InventoryFilters } from "@/api/api.service";
import Button from "primevue/button";
import Select from "primevue/select";
import InputText from "primevue/inputtext";

const { column, searchValue, valueInfo } = storeToRefs(useDataSharingService());

const inventoryData = ref<Record<string, unknown>[]>([]);
const pagination = ref<PaginationInfo | null>(null);
const loading = ref(false);
const filterField = ref("");
const filterValue = ref("");

let filterDebounce: ReturnType<typeof setTimeout> | null = null;

const legoFilterOptions = [
  { label: "Código", value: "element_id" },
  { label: "Nombre", value: "part.name" },
  { label: "Color", value: "color.name" },
  { label: "Cantidad", value: "quantity" },
  { label: "Nº pieza", value: "part.part_num" },
];

const piezaFilterOptions = [
  { label: "Código", value: "set_num" },
  { label: "Nombre", value: "name" },
  { label: "Piezas", value: "num_parts" },
  { label: "Tema", value: "theme.name" },
  { label: "Año", value: "year" },
];

const filterOptions = computed(() =>
  column.value === "lego" ? legoFilterOptions : piezaFilterOptions,
);

const hasActiveFilter = computed(
  () => Boolean(filterField.value && filterValue.value.trim()),
);

const hasSearch = computed(() => valueInfo.value != null);
const rows = computed(() => pagination.value?.pageSize ?? 6);
const totalRecords = computed(() => pagination.value?.total ?? 0);
const first = computed(() => {
  const page = pagination.value?.page ?? 1;
  return (page - 1) * rows.value;
});

function onPage(event: DataTablePageEvent) {
  fetchInventory(event.page + 1, event.rows);
}

function buildFilters(): InventoryFilters {
  const field = filterField.value;
  const value = filterValue.value.trim();
  if (!field || !value) return {};
  return { [field]: value };
}

function clearFilter() {
  filterField.value = "";
  filterValue.value = "";
  fetchInventory(1, pagination.value?.pageSize ?? 6);
}

function onFilterInput() {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    if (!filterField.value) return;
    fetchInventory(1, pagination.value?.pageSize ?? 6);
  }, 500);
}

function onFilterFieldChange() {
  if (!filterField.value || filterValue.value.trim()) {
    fetchInventory(1, pagination.value?.pageSize ?? 6);
  }
}

async function fetchInventory(page = 1, pageSize = pagination.value?.pageSize ?? 6) {
  if (!column.value || !searchValue.value.trim()) {
    inventoryData.value = [];
    pagination.value = null;
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

watch([column, searchValue], () => {
  filterField.value = "";
  filterValue.value = "";
  fetchInventory(1, pagination.value?.pageSize ?? 6);
}, { immediate: true });

const getValue = (row: any, legoGetter: (row: any) => any, setGetter: (row: any) => any) => {
  return column.value === "lego" ? legoGetter(row) : setGetter(row);
};

type ExternalIds = Record<string, string[]>;

function getExternalIdEntries(externalIds: unknown) {
  if (!externalIds || typeof externalIds !== "object") return [];

  return Object.entries(externalIds as ExternalIds)
    .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
    .map(([platform, ids]) => ({ platform, ids: ids.join(", ") }));
}

function agregarElemento(row: any) {
  console.log(row);
}
</script>

<template>
  <Card v-if="hasSearch" class="table-card">
    <template #title>
      <span class="table-card-title">Inventario</span>
    </template>
    <template #content>
      <div class="filter-bar">
        <div class="filter-field filter-field--column">
          <label for="inventory-filter-field" class="field-label">Filtrar por</label>
          <Select
            id="inventory-filter-field"
            v-model="filterField"
            :options="filterOptions"
            placeholder="Columna"
            option-label="label"
            option-value="value"
            show-clear
            class="w-full"
            @change="onFilterFieldChange"
          />
        </div>
        <div class="filter-field filter-field--value">
          <label for="inventory-filter-value" class="field-label">Valor</label>
          <InputText
            id="inventory-filter-value"
            v-model="filterValue"
            placeholder="Texto a buscar"
            :disabled="!filterField"
            class="w-full"
            @input="onFilterInput"
          />
        </div>
        <Button
          v-if="hasActiveFilter"
          label="Limpiar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          size="small"
          class="filter-clear-btn"
          @click="clearFilter"
        />
      </div>
      <DataTable
        :value="inventoryData"
        lazy
        paginator
        :rows="rows"
        :total-records="totalRecords"
        :first="first"
        :loading="loading"
        :rows-per-page-options="[3, 6, 9, 12, 15, 18, 20]"
        current-page-report-template="{first}–{last} de {totalRecords}"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        striped-rows
        size="small"
        class="inventory-table"
        :pt="{ table: { style: 'min-width: 40rem' } }"
        @page="onPage"
      >
        <Column header="Código" frozen>
          <template #body="{ data: row }">
            <span class="cell-code">{{
              getValue(
                row,
                (r) => r.element_id,
                (r) => r.set_num,
              )
            }}</span>
          </template>
        </Column>

        <Column header="Imagen">
          <template #body="{ data: row }">
            <img
              :src="
                getValue(
                  row,
                  (r) => r.part.part_img_url,
                  (r) => r.set_img_url,
                )
              "
              alt="imagen"
              class="imagen-table"
              loading="lazy"
            />
          </template>
        </Column>

        <Column header="Nombre" header-class="col-name" body-class="col-name">
          <template #body="{ data: row }">
            <span class="cell-name">{{
              getValue(
                row,
                (r) => r.part.name,
                (r) => r.name,
              )
            }}</span>
          </template>
        </Column>
        <Column
          :header="column === 'lego' ? 'Color' : 'Piezas'"
          header-class="col-optional"
          body-class="col-optional"
        >
          <template #body="{ data: row }">
            {{
              getValue(
                row,
                (r) => r.color.name,
                (r) => r.num_parts,
              )
            }}
          </template>
        </Column>

        <Column
          v-if="column === 'lego'"
          header="Cantidad en lego"
          header-class="col-optional"
          body-class="col-optional"
        >
          <template #body="{ data: row }">
            {{
              getValue(
                row,
                (r) => r.quantity,
                (r) => r,
              )
            }}
          </template>
        </Column>

        <Column
          v-if="column === 'pieza'"
          header="Tema"
          header-class="col-optional"
          body-class="col-optional"
        >
          <template #body="{ data: row }">
            {{
              getValue(
                row,
                (r) => r,
                (r) => r.theme[r.theme.length - 1].name,
              )
            }}
          </template>
        </Column>

        <Column
          v-if="column === 'lego'"
          header="IDs externos"
          header-class="col-external-ids"
          body-class="col-external-ids"
        >
          <template #body="{ data: row }">
            <ul v-if="getExternalIdEntries(row.part?.external_ids).length" class="external-ids">
              <li
                v-for="entry in getExternalIdEntries(row.part?.external_ids)"
                :key="entry.platform"
                class="external-ids-item"
              >
                <span class="external-ids-platform">{{ entry.platform }}</span>
                <span class="external-ids-value">{{ entry.ids }}</span>
              </li>
            </ul>
            <span v-else class="external-ids-empty">—</span>
          </template>
        </Column>
        <Column header="Acciones" header-class="col-actions" body-class="col-actions">
          <template #body="{ data: row }">
            <div class="action-group">
              <Button
                icon="pi pi-plus-circle"
                outlined
                rounded
                size="small"
                aria-label="Agregar"
                title="Agregar"
                class="action-btn action-btn--add"
                @click="agregarElemento(row)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <p class="empty-message">No hay elementos en inventario para esta búsqueda.</p>
        </template>
      </DataTable>
    </template>
  </Card>
</template>

<style scoped>
.table-card {
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

.table-card :deep(.p-card-body) {
  padding-top: 0;
}

.table-card :deep(.p-card-title) {
  padding: 1.25rem 1.25rem 0.75rem;
}

.table-card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0 0 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.filter-field--column {
  flex: 0 0 100%;
}

.filter-field--value {
  flex: 1 1 12rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color, #64748b);
}

.filter-clear-btn {
  margin-bottom: 0.125rem;
}

@media (min-width: 576px) {
  .filter-field--column {
    flex: 0 0 12rem;
  }
}

.inventory-table :deep(.p-datatable-thead > tr > th) {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.inventory-table :deep(.p-datatable-tbody > tr > td) {
  vertical-align: middle;
  font-size: 0.875rem;
}

.inventory-table :deep(.p-paginator) {
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  border: none;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
  background: var(--p-surface-50, #f8fafc);
}

.inventory-table :deep(.p-paginator-page),
.inventory-table :deep(.p-paginator-first),
.inventory-table :deep(.p-paginator-prev),
.inventory-table :deep(.p-paginator-next),
.inventory-table :deep(.p-paginator-last) {
  min-width: 2.125rem;
  height: 2.125rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.inventory-table :deep(.p-paginator-current) {
  font-size: 0.8125rem;
  color: var(--p-text-muted-color, #64748b);
  font-weight: 500;
}

.inventory-table :deep(.p-select) {
  border-radius: 8px;
  font-size: 0.8125rem;
}

.empty-message {
  margin: 0;
  padding: 1rem 0;
  text-align: center;
  color: var(--p-text-muted-color, #64748b);
  font-size: 0.875rem;
}
.imagen-table {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
  border-radius: 6px;
  background: var(--p-surface-50, #f8fafc);
}

.inventory-table :deep(.col-external-ids) {
  min-width: 10rem;
  max-width: 16rem;
}

.external-ids {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.375rem;
  width: 100%;
}

.external-ids-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  background: var(--p-surface-100, #f1f5f9);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  font-size: 0.75rem;
  line-height: 1.3;
}

.external-ids-platform {
  font-weight: 600;
  color: var(--p-text-muted-color, #64748b);
  white-space: nowrap;
}

.external-ids-platform::after {
  content: ":";
}

.external-ids-value {
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

.external-ids-empty {
  color: var(--p-text-muted-color, #64748b);
}
.action-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.action-btn :deep(.p-button) {
  width: 2rem;
  height: 2rem;
  padding: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.action-btn :deep(.p-button:not(:disabled):hover) {
  transform: scale(1.08);
}

.action-btn--add :deep(.p-button:not(:disabled):hover) {
  background: var(--p-blue-50, #eff6ff);
}
</style>
