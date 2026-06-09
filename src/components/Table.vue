<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useDataSharingService } from "@/api/data-sharing.service";
import { computed, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const dataService = useDataSharingService();
const { tableData, column } = storeToRefs(dataService);

const data = computed(() => (Array.isArray(tableData.value) ? tableData.value : []));

const getValue = (row: any, legoGetter: (row: any) => any, setGetter: (row: any) => any) => {
  return column.value === "lego" ? legoGetter(row) : setGetter(row);
};
</script>
<template>
  <DataTable :value="data" v-if="tableData && tableData.length > 0">
    <Column header="Código">
      <template #body="{ data }">
        {{
          getValue(
            data,
            (row) => row.pieza,
            (row) => row.lego,
          )
        }}
      </template>
    </Column>

    <Column header="Imágen">
      <template #body="{ data }">
        <img
          :src="
            getValue(
              data.rebrickData,
              (row) => row.element_img_url,
              (row) => row.set_img_url,
            )
          "
          alt="imagen"
          class="imagen-table"
        />
      </template>
    </Column>

    <Column header="Nombre Elemento">
      <template #body="{ data }">
        {{
          getValue(
            data.rebrickData,
            (row) => row.part.name,
            (row) => row.name,
          )
        }}
      </template>
    </Column>

    <Column :header="column === 'lego' ? 'Color Pieza' : 'N° de Piezas'">
      <template #body="{ data }">
        {{
          getValue(
            data.rebrickData,
            (row) => row.color.name,
            (row) => row.num_parts,
          )
        }}
      </template>
    </Column>
    <Column header="Tema" v-if="column === 'pieza'">
      <template #body="{ data }">
        {{
          getValue(
            data.rebrickData,
            (row) => row,
            (row) => row.theme[row.theme.length - 1].name,
          )
        }}
      </template>
    </Column>
    <Column header="Cantidad" field="cantidad"></Column>
    <Column header="N° Bolsa" field="task"></Column>
    <Column header="Pedido" field="esta_pedido"></Column>
    <Column header="Reemplazado">
      <template #body="slotProps">
        {{ slotProps.data.esta_reemplazado ?? "Sin Reemplazo" }}
      </template>
    </Column>
    <Column header="Completo">
      <template #body="slotProps">
        {{ slotProps.data.esta_completo ?? "No" }}
      </template>
    </Column>
    <Column header="Comentarios">
      <template #body="slotProps">
        {{ slotProps.data.comentarios ?? "Sin Comentarios" }}
      </template>
    </Column>
  </DataTable>
</template>
<style lang="css" scoped>
.imagen-table {
  width: 80px;
  height: 80px;
}
</style>
