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
import LegoInstructions from "@/components/info/LegoInstructions.vue";
import MinifigurasDialog from "@/components/minifiguras/MinifigurasDialog.vue";
import { getInventoryInstrucciones } from "@/utils/instructions";
import type { Minifigura } from "@/api/api.service";
import Image from "primevue/image";

const { column, searchValue, valueInfo } = storeToRefs(useDataSharingService());
const toast = useToast();

const addDialogVisible = ref(false);
const selectedItem = ref<Record<string, unknown> | null>(null);
const minifigDialogVisible = ref(false);
const selectedMinifiguras = ref<Minifigura[]>([]);
const minifigDialogHeader = ref("Minifiguras");

const setMinifiguras = computed(() => {
  const data = valueInfo.value?.minifiguras as { results?: Minifigura[] } | undefined;
  return data?.results ?? [];
});

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
  initializeInventory,
  catalogFilter,
  onPage,
  onSort,
  clearFilter,
  onFilterInput,
  onFilterFieldChange,
} = useInventoryTable(column, searchValue);

onMounted(() => {
  initializeInventory();
});

function getValue<T>(row: T, legoGetter: (row: T) => unknown, piezaGetter: (row: T) => unknown) {
  return getValueByColumn(column.value, row, legoGetter, piezaGetter);
}

function agregarElemento(row: Record<string, unknown>) {
  selectedItem.value = row;
  addDialogVisible.value = true;
}

function verMinifiguras(row: Record<string, unknown>) {
  const minifiguras = (row.minifiguras as { results?: Minifigura[] } | undefined)?.results ?? [];
  selectedMinifiguras.value = minifiguras;
  minifigDialogHeader.value = `Minifiguras · ${String(row.name ?? row.set_num ?? "")}`;
  minifigDialogVisible.value = true;
}

function verMinifigurasDelSet() {
  selectedMinifiguras.value = setMinifiguras.value;
  minifigDialogHeader.value = `Minifiguras · ${setNombre.value || searchValue.value}`;
  minifigDialogVisible.value = true;
}

function minifigCount(row: Record<string, unknown>): number {
  return (row.minifiguras as { total?: number } | undefined)?.total ?? 0;
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
    <template #title>
      <div class="inventory-title">
        <span>Inventario</span>
        <Button v-if="column === 'lego' && setMinifiguras.length > 0" label="Minifiguras" icon="pi pi-users"
          size="small" severity="success" outlined @click="verMinifigurasDelSet" />
      </div>
    </template>

    <FilterBar :filter-field="filterField" :filter-value="filterValue" :options="filterOptions"
      :has-active-filter="hasActiveFilter" :catalog-filter="catalogFilter" field-id="inventory-filter-field"
      value-id="inventory-filter-value" @update:filter-field="filterField = $event"
      @update:filter-value="filterValue = $event" @clear="clearFilter" @field-change="onFilterFieldChange"
      @filter-input="onFilterInput" />

    <ServerDataTable :key="column" :value="inventoryData" :rows="rows" :total-records="totalRecords" :first="first"
      :loading="loading" :sort-field="sortField" :sort-order="sortOrder" @page="onPage" @sort="onSort"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="{first} to {last} of {totalRecords}">
      <Column v-if="column === 'pieza'" field="set_num" header="Código" sortable frozen>
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
          <Image alt="Image" preview>
            <template #previewicon>
              <i class="pi pi-search"></i>
            </template>
            <template #image>
              <img :src="getValue(
                row,
                (r) => r.part.part_img_url,
                (r) => r.set_img_url,
              ) as string
                " alt="imagen" class="imagen-table"  loading="lazy"/>
            </template>
            <template #original="slotProps">
              <img :src="getValue(
                row,
                (r) => r.part.part_img_url,
                (r) => r.set_img_url,
              ) as string
                " alt="imagen" :style="slotProps.style" class="preview-image" @click="slotProps.previewCallback" />
            </template>
          </Image>
        </template>
      </Column>

      <Column :field="column === 'lego' ? 'part.name' : 'name'" header="Nombre" sortable header-class="col-name"
        body-class="col-name">
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

      <Column v-if="column === 'lego'" field="color.name" header="Color" sortable header-class="col-optional"
        body-class="col-optional">
        <template #body="{ data: row }">
          {{ row.color.name }}
        </template>
      </Column>
      <Column v-else header="Piezas" header-class="col-optional" body-class="col-optional">
        <template #body="{ data: row }">
          {{ row.num_parts }}
        </template>
      </Column>

      <Column v-if="column === 'lego'" field="quantity" header="Cantidad en lego" sortable header-class="col-optional"
        body-class="col-optional">
        <template #body="{ data: row }">
          {{ row.quantity }}
        </template>
      </Column>

      <Column v-if="column === 'pieza'" field="theme.name" header="Tema" sortable header-class="col-optional"
        body-class="col-optional">
        <template #body="{ data: row }">
          {{ row.theme?.at(-1)?.name ?? "—" }}
        </template>
      </Column>

      <Column v-if="column === 'lego'" header="IDs externos" header-class="col-external-ids"
        body-class="col-external-ids">
        <template #body="{ data: row }">
          <ul v-if="getExternalIdEntries(row.part?.external_ids).length" class="external-ids">
            <li v-for="entry in getExternalIdEntries(row.part?.external_ids)" :key="entry.platform"
              class="external-ids-item">
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
            <LegoInstructions v-if="column === 'pieza'" variant="icon" :instrucciones="getInventoryInstrucciones(row)"
              :set-label="String(row.name ?? row.set_num ?? '')" />
            <Button v-if="column === 'pieza'" icon="pi pi-users" outlined rounded size="small" severity="success"
              :aria-label="`Ver minifiguras (${minifigCount(row)})`" :title="`Ver minifiguras (${minifigCount(row)})`"
              class="action-btn action-btn--minifigs" @click="verMinifiguras(row)" />
            <Button icon="pi pi-plus-circle" outlined rounded size="small" aria-label="Agregar" title="Agregar"
              class="action-btn action-btn--add" @click="agregarElemento(row)" />
          </div>
        </template>
      </Column>

      <template #empty>
        <p class="empty-message">No hay elementos en inventario para esta búsqueda.</p>
      </template>
    </ServerDataTable>

    <Dialog v-model:visible="addDialogVisible" modal header="Agregar pedido" :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" :close-on-escape="true" :dismissable-mask="true">
      <AgregarPedido :visible="addDialogVisible" :item="selectedItem" :search-column="column"
        :search-value="searchValue" :set-nombre="setNombre" @close="addDialogVisible = false"
        @success="onPedidoCreated" />
    </Dialog>

    <MinifigurasDialog v-model:visible="minifigDialogVisible" :minifiguras="selectedMinifiguras"
      :header="minifigDialogHeader" />
  </TableCard>
</template>

<style scoped src="@/assets/styles/table.css"></style>

<style scoped>
.inventory-table :deep(.col-external-ids) {
  min-width: 10rem;
  max-width: 16rem;
}

.preview-image {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
  width: 50rem;
  height: 100%;
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
  color: var(--app-text-muted);
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
  color: var(--app-text-muted);
}

.inventory-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Responsive Styles */

@media (max-width: 575px) {
  .inventory-table :deep(.col-external-ids) {
    min-width: 8rem;
    max-width: 12rem;
  }

  .preview-image {
    width: 90vw;
    height: auto;
  }

  .external-ids-item {
    gap: 0.2rem;
    padding: 0.1rem 0.375rem;
    font-size: 0.65rem;
  }

  .inventory-title {
    gap: 0.5rem;
  }

  .inventory-title > span {
    flex: 0 0 100%;
  }

  .inventory-title :deep(.p-button) {
    width: 100%;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .inventory-table :deep(.col-external-ids) {
    min-width: 9rem;
    max-width: 14rem;
  }

  .preview-image {
    width: 70vw;
    height: auto;
  }

  .inventory-title {
    gap: 0.625rem;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .inventory-table :deep(.col-external-ids) {
    min-width: 10rem;
    max-width: 15rem;
  }

  .preview-image {
    width: 60vw;
    height: auto;
  }
}

@media (min-width: 992px) {
  .inventory-table :deep(.col-external-ids) {
    min-width: 10rem;
    max-width: 16rem;
  }

  .preview-image {
    width: 50rem;
    height: 100%;
  }
}
</style>
