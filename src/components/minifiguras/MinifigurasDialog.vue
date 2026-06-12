<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import type { Minifigura } from "@/api/api.service";
import Image from "primevue/image";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    minifiguras: Minifigura[];
    header?: string;
  }>(),
  {
    header: "Minifiguras",
  },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});
</script>

<template>
  <Dialog v-model:visible="dialogVisible" modal :header="header" :style="{ width: '42rem' }"
    :breakpoints="{ '575px': '92vw' }">
    <DataTable :value="minifiguras" striped-rows size="small" class="inventory-table minifiguras-dialog-table"
      :pt="{ table: { style: 'min-width: 32rem' } }">
      <Column header="Imagen" style="width: 5rem">
        <template #body="{ data }">
          <Image alt="Image" preview>
            <template #previewicon>
              <i class="pi pi-search"></i>
            </template>
            <template #image>
              <img v-if="data.set_img_url" :src="data.set_img_url" :alt="data.set_name" class="imagen-table" />
            </template>
            <template #original="slotProps">
              <img v-if="data.set_img_url" :src="data.set_img_url" :alt="data.set_name" :style="slotProps.style"
                class="preview-image" @click="slotProps.previewCallback" />
            </template>
          </Image>
        </template>
      </Column>

      <Column field="set_num" header="Código" style="width: 7rem">
        <template #body="{ data }">
          <span class="cell-code">{{ data.set_num }}</span>
        </template>
      </Column>

      <Column field="set_name" header="Nombre">
        <template #body="{ data }">
          <span class="cell-name" :title="data.set_name">{{ data.set_name }}</span>
        </template>
      </Column>

      <Column field="quantity" header="Cant." style="width: 4rem; text-align: center">
        <template #body="{ data }">
          {{ data.quantity }}
        </template>
      </Column>

      <template #empty>
        <p class="empty-message">Este set no incluye minifiguras registradas.</p>
      </template>
    </DataTable>

    <template #footer>
      <Button label="Cerrar" severity="secondary" @click="dialogVisible = false" />
    </template>
  </Dialog>
</template>

<style scoped src="@/assets/styles/table.css"></style>

<style scoped>
.minifiguras-dialog-table :deep(.imagen-table) {
  width: 3.5rem;
  height: 3.5rem;
}
.preview-image {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
  width: 50rem;
  height: 100%;
}
</style>
