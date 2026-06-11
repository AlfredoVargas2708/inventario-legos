<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import { useDataSharingService } from "@/api/data-sharing.service";
import { useInventoryTable } from "@/composables/useInventoryTable";
import { getValueByColumn, getExternalIdEntries } from "@/utils/lego-helpers";
import TableCard from "@/components/common/TableCard.vue";
import FilterBar from "@/components/common/FilterBar.vue";
import ServerDataTable from "@/components/common/ServerDataTable.vue";
import AgregarPedido from "@/components/inventario/AgregarPedido.vue";

const { column, searchValue, valueInfo } = storeToRefs(useDataSharingService());
const toast = useToast();

const addDialogVisible = ref(false);
const selectedItem = ref<Record<string, unknown> | null>(null);

const setNombre = computed(() => {
  if (column.value === "lego") return valueInfo.value?.name ?? "";
  return "";
});

const hasSearch = computed(() => valueInfo.value != null);

const {
  inventoryData,
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
} = useInventoryTable(column, searchValue);

onMounted(() => {
  resetQueryState();
  fetchInventory();
});

function getValue<T>(row: T, legoGetter: (row: T) => unknown, piezaGetter: (row: T) => unknown) {
  return getValueByColumn(column.value, row, legoGetter, piezaGetter);
}

function agregarElemento(row: Record<string, unknown>) {
  selectedItem.value = row;
  addDialogVisible.value = true;
}

function onPedidoCreated() {
  addDialogVisible.value = false;
  selectedItem.value = null;
  toast.add({
    severity: "success",
    summary: "Pedido creado",
    detail: "El pedido se agregó correctamente. Revísalo en la vista de pedidos.",
    life: 4000,
  });
}
</script>

<template>
  <TableCard v-if="hasSearch">
    <template #title>Inventario</template>

    <FilterBar
      :filter-field="filterField"
      :filter-value="filterValue"
      :options="filterOptions"
      :has-active-filter="hasActiveFilter"
      field-id="inventory-filter-field"
      value-id="inventory-filter-value"
      @update:filter-field="filterField = $event"
      @update:filter-value="filterValue = $event"
      @clear="clearFilter"
      @field-change="onFilterFieldChange"
      @filter-input="onFilterInput"
    />

    <ServerDataTable
      :key="column"
      :value="inventoryData"
      :rows="rows"
      :total-records="totalRecords"
      :first="first"
      :loading="loading"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @page="onPage"
      @sort="onSort"
    >
      <Column
        v-if="column === 'pieza'"
        field="set_num"
        header="Código"
        sortable
        frozen
      >
        <template #body="{ data: row }">
          <span class="cell-code">{{ row.set_num }}</span>
        </template>
      </Column>
      <Column v-else header="Código" frozen>
        <template #body="{ data: row }">
          <span class="cell-code">{{ row.element_id }}</span>
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
              ) as string
            "
            alt="imagen"
            class="imagen-table"
            loading="lazy"
          />
        </template>
      </Column>

      <Column
        :field="column === 'lego' ? 'part.name' : 'name'"
        header="Nombre"
        sortable
        header-class="col-name"
        body-class="col-name"
      >
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
        v-if="column === 'lego'"
        field="color.name"
        header="Color"
        sortable
        header-class="col-optional"
        body-class="col-optional"
      >
        <template #body="{ data: row }">
          {{ row.color.name }}
        </template>
      </Column>
      <Column
        v-else
        header="Piezas"
        header-class="col-optional"
        body-class="col-optional"
      >
        <template #body="{ data: row }">
          {{ row.num_parts }}
        </template>
      </Column>

      <Column
        v-if="column === 'lego'"
        field="quantity"
        header="Cantidad en lego"
        sortable
        header-class="col-optional"
        body-class="col-optional"
      >
        <template #body="{ data: row }">
          {{ row.quantity }}
        </template>
      </Column>

      <Column
        v-if="column === 'pieza'"
        field="theme.name"
        header="Tema"
        sortable
        header-class="col-optional"
        body-class="col-optional"
      >
        <template #body="{ data: row }">
          {{ row.theme?.at(-1)?.name ?? "—" }}
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
    </ServerDataTable>

    <Dialog
      v-model:visible="addDialogVisible"
      modal
      header="Agregar pedido"
      :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      :close-on-escape="true"
      :dismissable-mask="true"
    >
      <AgregarPedido
        :visible="addDialogVisible"
        :item="selectedItem"
        :search-column="column"
        :search-value="searchValue"
        :set-nombre="setNombre"
        @close="addDialogVisible = false"
        @success="onPedidoCreated"
      />
    </Dialog>
  </TableCard>
</template>

<style scoped src="@/assets/styles/table.css"></style>

<style scoped>
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

.action-btn--add :deep(.p-button:not(:disabled):hover) {
  background: var(--p-blue-50, #eff6ff);
}
</style>
