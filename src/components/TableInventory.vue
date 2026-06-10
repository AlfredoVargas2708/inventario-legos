<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { DataTablePageEvent } from "primevue/datatable";
import { useDataSharingService } from "@/api/data-sharing.service";
import { getInventario } from "@/api/api.service";

const { column, searchValue, valueInfo } = storeToRefs(useDataSharingService());

const inventoryData = ref<Record<string, unknown>[]>([]);
const loading = ref(false);
const first = ref(0);
const rows = ref(6);

const hasSearch = computed(() => valueInfo.value != null);

function onPage(event: DataTablePageEvent) {
  first.value = event.first;
  rows.value = event.rows;
}

async function fetchInventory() {
  if (!column.value || !searchValue.value.trim()) {
    inventoryData.value = [];
    first.value = 0;
    return;
  }

  loading.value = true;
  try {
    const results = await getInventario(column.value, searchValue.value.trim());
    inventoryData.value = results?.inventario ?? [];
    first.value = 0;
  } catch (error) {
    console.error(error);
    inventoryData.value = [];
    first.value = 0;
  } finally {
    loading.value = false;
  }
}

watch([column, searchValue], fetchInventory, { immediate: true });

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
</script>

<template>
  <Card v-if="hasSearch" class="table-card">
    <template #title>
      <span class="table-card-title">Inventario</span>
    </template>
    <template #content>
      <DataTable
        v-model:first="first"
        :value="inventoryData"
        :rows="rows"
        :loading="loading"
        paginator
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
</style>
