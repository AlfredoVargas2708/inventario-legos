<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "primevue/card";
import Tag from "primevue/tag";
import DataView from "primevue/dataview";
import Button from "primevue/button";
import type { Instrucciones } from "@/api/api.service";
import { useDataSharingService } from "@/api/data-sharing.service";
import LegoInstructions from "@/components/info/LegoInstructions.vue";
import Image from "primevue/image";

type InfoItem =
  | { label: string; type: "text"; value: string | number }
  | { label: string; type: "tag"; value: string; severity: "secondary" | "info" }
  | { label: string; type: "color"; value: string; rgb: string };

const { column, valueInfo } = storeToRefs(useDataSharingService());
const route = useRoute();
const router = useRouter();

const isPedidos = computed(() => route.name === "pedidos");
const isInventario = computed(() => route.name === "inventario");
const isLego = computed(() => column.value === "lego");
const isPieza = computed(() => column.value === "pieza");

const totalResults = computed(() => valueInfo.value?.pagination?.total ?? 0);
const minifigurasTotal = computed(() => valueInfo.value?.minifiguras?.total ?? 0);

const instrucciones = computed<Instrucciones | undefined>(
  () => (isLego.value ? valueInfo.value?.instrucciones : undefined),
);

const legoInfo = computed(() => {
  if (!isLego.value || !valueInfo.value) return null;
  const info = valueInfo.value;
  return {
    img: info.set_img_url,
    title: info.name,
    subtitle: info.set_num,
    year: info.year,
    theme: info.theme?.at(-1)?.name,
    numParts: info.num_parts,
  };
});

const piezaInfo = computed(() => {
  if (!isPieza.value || !valueInfo.value) return null;
  const info = valueInfo.value;
  return {
    img: info.element_img_url,
    title: info.part?.name,
    subtitle: info.element_id,
    partNum: info.part?.part_num,
    colorName: info.color?.name,
    colorRgb: info.color?.rgb,
    designId: info.design_id,
  };
});

const infoItems = computed((): InfoItem[] => {
  if (legoInfo.value) {
    const l = legoInfo.value;
    return [
      { label: "Tipo", type: "tag", value: "Set LEGO", severity: "secondary" },
      { label: "Nombre", type: "text", value: l.title },
      { label: "Set N°", type: "text", value: l.subtitle },
      { label: "Año", type: "text", value: l.year },
      { label: "Tema", type: "text", value: l.theme },
      { label: "Piezas", type: "text", value: `${l.numParts} piezas` },
      ...(minifigurasTotal.value > 0
        ? [
          {
            label: "Minifiguras",
            type: "tag" as const,
            value: `${minifigurasTotal.value} minifiguras`,
            severity: "info" as const,
          },
        ]
        : []),
      {
        label: "Pedidos",
        type: "tag",
        value: `${totalResults.value} pedidos`,
        severity: "info",
      },
    ];
  }

  if (piezaInfo.value) {
    const p = piezaInfo.value;
    return [
      { label: "Tipo", type: "tag", value: "Pieza", severity: "secondary" },
      { label: "Nombre", type: "text", value: p.title },
      { label: "Elemento", type: "text", value: p.subtitle },
      { label: "Color", type: "color", value: p.colorName, rgb: p.colorRgb },
      { label: "Part N°", type: "text", value: p.partNum },
      { label: "Design ID", type: "text", value: p.designId },
      {
        label: "Pedidos",
        type: "tag",
        value: `${totalResults.value} pedidos`,
        severity: "info",
      },
    ];
  }

  return [];
});

function goToVista(name: "pedidos" | "inventario") {
  router.push({ name });
}

const showLegoInstructions = computed(() => isLego.value);

const displayImage = computed(() => legoInfo.value?.img ?? piezaInfo.value?.img ?? "");
const displayAlt = computed(() => legoInfo.value?.title ?? piezaInfo.value?.title ?? "");
</script>

<template>
  <Card v-if="infoItems.length" class="info-card">
    <template #content>
      <div class="info-layout">
        <div class="info-sidebar">
          <div class="info-media">
            <Image alt="Image" preview>
              <template #previewicon>
                <i class="pi pi-search"></i>
              </template>
              <template #image>
                <img :src="displayImage" :alt="displayAlt" class="info-img" />
              </template>
              <template #original="slotProps">
                <img :src="displayImage" :alt="displayAlt" :style="slotProps.style" class="preview-image"
                  @click="slotProps.previewCallback" />
              </template>
            </Image>
          </div>

          <Button v-if="!isPedidos" label="Pedidos" icon="pi pi-list" size="small" severity="success" outlined
            class="add-btn" @click="goToVista('pedidos')" />
          <Button v-if="!isInventario" label="Inventario" icon="pi pi-box" size="small" severity="success" outlined
            class="add-btn" @click="goToVista('inventario')" />

          <LegoInstructions v-if="showLegoInstructions" :instrucciones="instrucciones" />
        </div>

        <DataView :value="infoItems" layout="list" class="info-body">
          <template #list="{ items }">
            <ul class="info-list">
              <li v-for="item in items" :key="item.label" class="info-list-item">
                <span class="info-list-label">{{ item.label }}</span>
                <span class="info-list-value">
                  <Tag v-if="item.type === 'tag'" :value="item.value" :severity="item.severity" />
                  <span v-else-if="item.type === 'color'" class="info-color">
                    <span class="color-swatch" :style="{ backgroundColor: `#${item.rgb}` }" />
                    {{ item.value }}
                  </span>
                  <span v-else>{{ item.value }}</span>
                </span>
              </li>
            </ul>
          </template>
        </DataView>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.info-card {
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

.info-card :deep(.p-card-body) {
  padding: 0;
}

.info-card :deep(.p-card-content) {
  padding: 1.25rem;
}

.preview-image {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
  width: 80rem;
  height: 100%;
}

.info-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.25rem;
}

.info-sidebar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  flex-shrink: 0;
  width: 7.5rem;
}

@media (max-width: 575px) {
  .info-layout {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .preview-image {
    width: 90vw;
    height: auto;
  }

  .info-sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
  }

  .info-media {
    width: 6rem !important;
    height: 6rem !important;
  }

  .add-btn {
    flex: 1;
    min-width: 8rem;
  }
}

.info-media {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 7.5rem;
  padding: 0.5rem;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 10px;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
}

.add-btn {
  width: 100%;
}

.add-btn :deep(.p-button) {
  width: 100%;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.add-btn :deep(.p-button:not(:disabled):hover) {
  transform: translateY(-1px);
}

.add-btn :deep(.p-button:not(:disabled):active) {
  transform: translateY(0);
}

.info-img {
    width: 100%;
    height: 100%;
    max-width: 100px;
    object-fit: contain;
    max-height: 100px;
}

.info-body {
  flex: 1;
  min-width: 0;
}

.info-body :deep(.p-dataview-content) {
  padding: 0;
  background: transparent;
  border: none;
}

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 8px;
  overflow: hidden;
}

.info-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 0.875rem;
  background: var(--p-content-background, #fff);
  border-bottom: 1px solid var(--p-content-border-color, #e2e8f0);
}

.info-list-item:last-child {
  border-bottom: none;
}

.info-list-item:nth-child(even) {
  background: var(--p-surface-50, #f8fafc);
}

.info-list-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color, #64748b);
  flex-shrink: 0;
}

.info-list-value {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
  min-width: 0;
}

.info-color {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.color-swatch {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  border: 1px solid rgb(15 23 42 / 15%);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .info-sidebar {
    width: 8.5rem;
  }

  .info-media {
    height: 8.5rem;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .info-card :deep(.p-card-content) {
    padding: 1rem;
  }

  .info-sidebar {
    width: 7rem;
  }

  .preview-image {
    width: 70vw;
    height: auto;
  }

  .info-media {
    height: 7rem;
  }

  .add-btn {
    width: 100%;
  }
}

@media (max-width: 575px) {
  .info-card {
    border-radius: 8px;
  }

  .info-card :deep(.p-card-content) {
    padding: 0.75rem;
  }

  .info-layout {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .info-sidebar {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info-media {
    width: 100%;
    height: 6rem;
    flex-basis: 100%;
  }

  .add-btn {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 0;
  }

  .add-btn :deep(.p-button) {
    width: 100%;
  }

  .info-sidebar :deep(.instructions-section) {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 0;
  }

  .info-list-item {
    gap: 0.75rem;
    padding: 0.5rem 0.625rem;
    flex-wrap: wrap;
  }

  .info-list-label {
    font-size: 0.7rem;
    flex: 0 0 45%;
  }

  .info-list-value {
    font-size: 0.8125rem;
    flex: 0 0 55%;
    text-align: left;
  }
}

@media (min-width: 768px) and (max-width: 991px) {

  .preview-image {
    width: 60vw;
    height: auto;
  }
}

@media (min-width: 992px) {
  .info-card :deep(.p-card-content) {
    padding: 1.5rem;
  }

  .info-layout {
    gap: 1.5rem;
  }

  .preview-image {
    width: 50rem;
    height: 100%;
  }
}
</style>
