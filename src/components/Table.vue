<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDataSharingService } from '@/api/data-sharing.service'
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const dataService = useDataSharingService()
const { tableData, column } = storeToRefs(dataService)

const data = computed(() => (Array.isArray(tableData.value) ? tableData.value : []))
const hasData = computed(() => data.value.length > 0)

const getValue = (row: any, legoGetter: (row: any) => any, setGetter: (row: any) => any) => {
  return column.value === 'lego' ? legoGetter(row) : setGetter(row)
}

function yesNoSeverity(value: string | null | undefined) {
  return value === 'Si' ? 'success' : 'secondary'
}
</script>

<template>
  <Card v-if="hasData" class="table-card">
    <template #title>
      <span class="table-card-title">Resultados</span>
    </template>
    <template #content>
      <div class="table-scroll">
        <DataTable
          :value="data"
          striped-rows
          size="small"
          class="inventory-table"
          :pt="{ table: { style: 'min-width: 56rem' } }"
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
                  (r) => r.theme[r.theme.length - 1].name,
                )
              }}
            </template>
          </Column>

          <Column header="Cant." field="cantidad" header-class="col-qty" body-class="col-qty" />

          <Column
            header="Bolsa"
            field="task"
            header-class="col-optional"
            body-class="col-optional"
          />

          <Column header="Pedido" header-class="col-status" body-class="col-status">
            <template #body="{ data: row }">
              <Tag :value="row.esta_pedido" :severity="yesNoSeverity(row.esta_pedido)" />
            </template>
          </Column>

          <Column
            header="Reemplazado"
            header-class="col-optional"
            body-class="col-optional"
          >
            <template #body="{ data: row }">
              {{ row.esta_reemplazado ?? 'Sin Reemplazo' }}
            </template>
          </Column>

          <Column header="Completo" header-class="col-status" body-class="col-status">
            <template #body="{ data: row }">
              <Tag
                :value="row.esta_completo ?? 'No'"
                :severity="yesNoSeverity(row.esta_completo)"
              />
            </template>
          </Column>

          <Column header="Comentarios" header-class="col-optional" body-class="col-optional">
            <template #body="{ data: row }">
              <span class="cell-comments">{{ row.comentarios ?? 'Sin Comentarios' }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
      <p class="table-hint">
        <i class="pi pi-arrows-h" aria-hidden="true" />
        Desliza horizontalmente para ver más columnas en pantallas pequeñas
      </p>
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

.table-card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;
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

.imagen-table {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
  border-radius: 6px;
  background: var(--p-surface-50, #f8fafc);
}

.cell-code {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cell-name {
  display: block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-comments {
  display: block;
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
