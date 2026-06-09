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
          <Tag value="Set LEGO" severity="secondary" class="info-type-tag" />
          <h2 class="info-title">{{ legoInfo.title }}</h2>
          <p class="info-subtitle">{{ legoInfo.subtitle }}</p>
          <p class="info-meta">
            {{ legoInfo.year }} · {{ legoInfo.theme }} · {{ legoInfo.numParts }} piezas
          </p>
          <Tag :value="`${totalResults} pedidos`" severity="info" class="info-count-tag" />
        </div>
      </div>

      <div v-else-if="piezaInfo" class="info-layout">
        <div class="info-media">
          <img :src="piezaInfo.img" :alt="piezaInfo.title" class="info-img" />
        </div>
        <div class="info-body">
          <Tag value="Pieza" severity="secondary" class="info-type-tag" />
          <h2 class="info-title">{{ piezaInfo.title }}</h2>
          <p class="info-subtitle">Elemento {{ piezaInfo.subtitle }}</p>
          <p class="info-meta info-meta--color">
            <span
              class="color-swatch"
              :style="{ backgroundColor: `#${piezaInfo.colorRgb}` }"
            />
            {{ piezaInfo.colorName }} · Part {{ piezaInfo.partNum }}
          </p>
          <Tag :value="`${totalResults} pedidos`" severity="info" class="info-count-tag" />
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
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
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
  min-width: 0;
}

.info-type-tag {
  margin-bottom: 0.5rem;
}

.info-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.info-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  color: var(--p-text-muted-color, #64748b);
}

.info-meta {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--p-text-color, #334155);
}

.info-meta--color {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.info-count-tag {
  margin-top: 0.75rem;
}

.color-swatch {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid rgb(15 23 42 / 15%);
  flex-shrink: 0;
}

@media (min-width: 576px) {
  .info-layout {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 1.25rem;
  }

  .info-media {
    width: 8.5rem;
    height: 8.5rem;
  }

  .info-title {
    font-size: 1.375rem;
  }
}
</style>
