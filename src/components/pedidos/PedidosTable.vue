<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useDataSharingService } from "@/api/data-sharing.service";
import { deletePedido, type PedidoRow } from "@/api/api.service";
import { usePedidosTable } from "@/composables/usePedidosTable";
import FilterBar from "@/components/common/FilterBar.vue";
import { getValueByColumn, yesNoSeverity } from "@/utils/lego-helpers";
import TableCard from "@/components/common/TableCard.vue";
import ServerDataTable from "@/components/common/ServerDataTable.vue";
import EditarPedido from "@/components/pedidos/EditarPedido.vue";
import LegoInstructions from "@/components/info/LegoInstructions.vue";
import MinifigurasDialog from "@/components/minifiguras/MinifigurasDialog.vue";
import { getPedidoInstrucciones } from "@/utils/instructions";
import {
  getPedidoMinifigCount,
  getPedidoMinifigLabel,
  getPedidoMinifiguras,
} from "@/utils/minifiguras";
import type { Minifigura } from "@/api/api.service";

const dataService = useDataSharingService();
const { tableData, column, pagination, loading, valueInfo } = storeToRefs(dataService);
const confirm = useConfirm();
const toast = useToast();

const data = computed(() => (Array.isArray(tableData.value) ? tableData.value : []));
const hasSearch = computed(() => valueInfo.value != null);

const {
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
  fetchPedidos,
  onPage,
  onSort,
  clearFilter,
  onFilterInput,
  onFilterFieldChange,
} = usePedidosTable();

const editDialogVisible = ref(false);
const selectedPedido = ref<PedidoRow | null>(null);
const minifigDialogVisible = ref(false);
const selectedMinifiguras = ref<Minifigura[]>([]);
const minifigDialogHeader = ref("Minifiguras");

function getValue<T>(row: T, legoGetter: (row: T) => unknown, piezaGetter: (row: T) => unknown) {
  return getValueByColumn(column.value, row, legoGetter, piezaGetter);
}

function openEdit(row: PedidoRow) {
  selectedPedido.value = row;
  editDialogVisible.value = true;
}

function verMinifiguras(row: PedidoRow) {
  selectedMinifiguras.value = getPedidoMinifiguras(row);
  minifigDialogHeader.value = `Minifiguras · ${getPedidoMinifigLabel(row)}`;
  minifigDialogVisible.value = true;
}

function onPedidoUpdated() {
  editDialogVisible.value = false;
  selectedPedido.value = null;
  toast.add({
    severity: "success",
    summary: "Elemento Editado",
    detail: "Elemento editado correctamente. Revise la tabla",
    life: 4000,
  });
}

function confirmDelete(row: PedidoRow) {
  confirm.require({
    message: `¿Eliminar el pedido Lego ${row.lego} / Pieza ${row.pieza} (bolsa ${row.task})? Esta acción no se puede deshacer.`,
    header: "Confirmar eliminación",
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancelar",
    acceptLabel: "Eliminar",
    rejectProps: {
      label: "Cancelar",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Eliminar",
      severity: "danger",
    },
    accept: async () => {
      await deletePedido(row.id);
      const page = pagination.value?.page ?? 1;
      const pageSize = pagination.value?.pageSize ?? 6;
      const isLastItemOnPage = data.value.length === 1 && page > 1;
      await fetchPedidos(isLastItemOnPage ? page - 1 : page, pageSize);
      toast.add({
        severity: "success",
        summary: "Elemento Eliminado",
        detail: "Elemento eliminado correctamente. Revise la tabla",
        life: 4000,
      });
    },
  });
}
</script>

<template>
  <TableCard v-if="hasSearch">
    <template #title>Resultados</template>

    <FilterBar
      :key="column"
      :filter-field="filterField"
      :filter-value="filterValue"
      :options="filterOptions"
      :has-active-filter="hasActiveFilter"
      :catalog-filter="catalogFilter"
      field-id="pedidos-filter-field"
      value-id="pedidos-filter-value"
      @update:filter-field="filterField = $event"
      @update:filter-value="filterValue = $event"
      @clear="clearFilter"
      @field-change="onFilterFieldChange"
      @filter-input="onFilterInput"
    />

    <div class="table-scroll">
      <ServerDataTable
        :value="data"
        :rows="rows"
        :total-records="totalRecords"
        :first="first"
        :loading="loading"
        :sort-field="sortField"
        :sort-order="sortOrder"
        min-width="56rem"
        @page="onPage"
        @sort="onSort"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column header="Código" frozen>
          <template #body="{ data: row }">
            <span class="cell-code">{{
              getValue(
                row,
                (r) => r.pieza,
                (r) => r.lego,
              )
            }}</span>
          </template>
        </Column>

        <Column header="Imagen">
          <template #body="{ data: row }">
            <img
              :src="
                getValue(
                  row.rebrickData,
                  (r) => r.element_img_url,
                  (r) => r.set_img_url,
                ) as string
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
                row.rebrickData,
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
                row.rebrickData,
                (r) => r.color.name,
                (r) => r.num_parts,
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
                row.rebrickData,
                (r) => r,
                (r) => r.theme?.at(-1)?.name ?? "—",
              )
            }}
          </template>
        </Column>

        <Column
          header="Cant."
          field="cantidad"
          sortable
          header-class="col-qty"
          body-class="col-qty"
        />

        <Column
          header="Bolsa"
          field="task"
          sortable
          header-class="col-optional"
          body-class="col-optional"
        />

        <Column
          header="Pedido"
          field="esta_pedido"
          sortable
          header-class="col-status"
          body-class="col-status"
        >
          <template #body="{ data: row }">
            <Tag :value="row.esta_pedido" :severity="yesNoSeverity(row.esta_pedido)" />
          </template>
        </Column>

        <Column
          header="Reemplazado"
          field="esta_reemplazado"
          sortable
          header-class="col-optional"
          body-class="col-optional"
        >
          <template #body="{ data: row }">
            {{ row.esta_reemplazado ?? "Sin Reemplazo" }}
          </template>
        </Column>

        <Column
          header="Completo"
          field="esta_completo"
          sortable
          header-class="col-status"
          body-class="col-status"
        >
          <template #body="{ data: row }">
            <Tag :value="row.esta_completo ?? 'No'" :severity="yesNoSeverity(row.esta_completo)" />
          </template>
        </Column>

        <Column
          header="Comentarios"
          field="comentarios"
          sortable
          header-class="col-optional"
          body-class="col-optional"
        >
          <template #body="{ data: row }">
            <span class="cell-comments">{{ row.comentarios ?? "Sin Comentarios" }}</span>
          </template>
        </Column>

        <Column header="Acciones" header-class="col-actions" body-class="col-actions">
          <template #body="{ data: row }">
            <div class="action-group">
              <LegoInstructions
                v-if="column === 'pieza'"
                variant="icon"
                :instrucciones="getPedidoInstrucciones(row)"
                :set-label="String(row.lego ?? row.rebrickData?.name ?? '')"
              />
              <Button
                v-if="column === 'pieza'"
                icon="pi pi-users"
                outlined
                rounded
                size="small"
                severity="success"
                :aria-label="`Ver minifiguras (${getPedidoMinifigCount(row)})`"
                :title="`Ver minifiguras (${getPedidoMinifigCount(row)})`"
                class="action-btn action-btn--minifigs"
                @click="verMinifiguras(row)"
              />
              <Button
                icon="pi pi-pencil"
                severity="info"
                outlined
                rounded
                size="small"
                aria-label="Editar"
                title="Editar"
                class="action-btn action-btn--edit"
                @click="openEdit(row)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                outlined
                rounded
                size="small"
                aria-label="Eliminar"
                title="Eliminar"
                class="action-btn action-btn--delete"
                @click="confirmDelete(row)"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <p class="empty-message">No hay pedidos que coincidan con este filtro.</p>
        </template>
      </ServerDataTable>
    </div>

    <p class="table-hint">
      <i class="pi pi-arrows-h" aria-hidden="true" />
      Desliza horizontalmente para ver más columnas en pantallas pequeñas
    </p>

    <ConfirmDialog />

    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Editar pedido"
      :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      :close-on-escape="true"
      :dismissable-mask="true"
    >
      <EditarPedido
        :visible="editDialogVisible"
        :pedido="selectedPedido"
        @close="editDialogVisible = false"
        @success="onPedidoUpdated"
      />
    </Dialog>

    <MinifigurasDialog
      v-model:visible="minifigDialogVisible"
      :minifiguras="selectedMinifiguras"
      :header="minifigDialogHeader"
    />
  </TableCard>
</template>

<style scoped src="@/assets/styles/table.css"></style>

<style scoped>
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;
}

.cell-comments {
  display: block;
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-message {
  margin: 0;
  padding: 1rem 0;
  text-align: center;
  color: var(--p-text-muted-color, #64748b);
}

.action-btn--edit :deep(.p-button:not(:disabled):hover) {
  background: var(--p-blue-50, #eff6ff);
}

.action-btn--minifigs :deep(.p-button:not(:disabled):hover) {
  background: var(--p-green-50, #f0fdf4);
}

.action-btn--delete :deep(.p-button:not(:disabled):hover) {
  background: var(--p-red-50, #fef2f2);
}

.table-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #64748b);
}

@media (min-width: 992px) {
  .table-hint {
    display: none;
  }
}

@media (max-width: 768px) {
  .inventory-table :deep(.col-optional) {
    display: none;
  }

  .action-group {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 576px) {
  .inventory-table :deep(.col-name) {
    max-width: 8rem;
  }

  .cell-name {
    max-width: 8rem;
  }
}
</style>
