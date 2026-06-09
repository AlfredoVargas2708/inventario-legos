<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { useDataSharingService } from '@/api/data-sharing.service'

const { column, valueInfo } = storeToRefs(useDataSharingService())

const isLego = computed(() => column.value === 'lego')
const isPieza = computed(() => column.value === 'pieza')

const totalResults = computed(() => valueInfo.value?.pagination?.total ?? 0)

const legoInfo = computed(() => {
  if (!isLego.value || !valueInfo.value) return null
  const info = valueInfo.value
  return {
    img: info.set_img_url,
    title: info.name,
    subtitle: info.set_num,
    year: info.year,
    theme: info.theme?.at(-1)?.name,
    numParts: info.num_parts,
    url: info.set_url,
  }
})

const piezaInfo = computed(() => {
  if (!isPieza.value || !valueInfo.value) return null
  const info = valueInfo.value
  return {
    img: info.element_img_url,
    title: info.part?.name,
    subtitle: info.element_id,
    partNum: info.part?.part_num,
    colorName: info.color?.name,
    colorRgb: info.color?.rgb,
    designId: info.design_id,
  }
})
</script>

<template>
  <Card v-if="valueInfo && (legoInfo || piezaInfo)" class="info-card">
    <template #content>
      <div v-if="legoInfo" class="info-layout">
        <div class="info-media">
          <img :src="legoInfo.img" :alt="legoInfo.title" class="info-img" />
        </div>
        <div class="info-body">
          <Tag value="Set LEGO" severity="secondary" />
          <h2 class="info-title">{{ legoInfo.title }}</h2>
          <span class="info-subtitle">{{ legoInfo.subtitle }}</span>
          <span class="info-meta">
            {{ legoInfo.year }} · {{ legoInfo.theme }} · {{ legoInfo.numParts }} piezas
          </span>
          <Tag :value="`${totalResults} pedidos`" severity="info" />
        </div>
      </div>

      <div v-else-if="piezaInfo" class="info-layout">
        <div class="info-media">
          <img :src="piezaInfo.img" :alt="piezaInfo.title" class="info-img" />
        </div>
        <div class="info-body">
          <Tag value="Pieza" severity="secondary" />
          <h2 class="info-title">{{ piezaInfo.title }}</h2>
          <span class="info-subtitle">Elemento {{ piezaInfo.subtitle }}</span>
          <span class="info-meta info-meta--color">
            <span
              class="color-swatch"
              :style="{ backgroundColor: `#${piezaInfo.colorRgb}` }"
            />
            {{ piezaInfo.colorName }} · Part {{ piezaInfo.partNum }}
          </span>
          <Tag :value="`${totalResults} pedidos`" severity="info" />
        </div>
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

.info-layout {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25rem;
}

.info-media {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 7.5rem;
  height: 7.5rem;
  padding: 0.5rem;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 10px;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
}

.info-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-body {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.75rem;
  min-width: 0;
}

.info-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.info-subtitle {
  font-size: 0.875rem;
  color: var(--p-text-muted-color, #64748b);
  white-space: nowrap;
}

.info-meta {
  font-size: 0.875rem;
  color: var(--p-text-color, #334155);
  white-space: nowrap;
}

.info-meta--color {
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
  .info-media {
    width: 8.5rem;
    height: 8.5rem;
  }

  .info-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 575px) {
  .info-layout {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-body {
    width: 100%;
  }

  .info-title,
  .info-subtitle,
  .info-meta {
    white-space: normal;
  }
}
</style>
