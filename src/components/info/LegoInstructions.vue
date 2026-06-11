<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import type { Instrucciones } from "@/api/api.service";
import { hasInstrucciones } from "@/utils/instructions";

const props = withDefaults(
  defineProps<{
    instrucciones: Instrucciones | null | undefined;
    variant?: "sidebar" | "icon";
    setLabel?: string;
  }>(),
  {
    variant: "sidebar",
  },
);

const dialogVisible = ref(false);

const showTrigger = computed(() => hasInstrucciones(props.instrucciones));
const manualCount = computed(() => props.instrucciones?.manuales.length ?? 0);

const dialogHeader = computed(() =>
  props.setLabel ? `Instrucciones · ${props.setLabel}` : "Instrucciones de montaje",
);
</script>

<template>
  <template v-if="showTrigger">
    <div v-if="variant === 'sidebar'" class="instructions-section">
      <Button
        label="Instrucciones"
        icon="pi pi-file-pdf"
        size="small"
        severity="info"
        outlined
        class="instructions-btn instructions-btn--sidebar"
        @click="dialogVisible = true"
      />
    </div>
    <Button
      v-else
      icon="pi pi-file-pdf"
      severity="info"
      outlined
      rounded
      size="small"
      aria-label="Ver instrucciones"
      :title="setLabel ? `Instrucciones de ${setLabel}` : 'Ver instrucciones'"
      class="action-btn action-btn--instructions"
      @click="dialogVisible = true"
    />

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="dialogHeader"
      :style="{ width: '28rem' }"
      :breakpoints="{ '575px': '92vw' }"
      :close-on-escape="true"
      :dismissable-mask="true"
    >
      <p class="instructions-intro">
        {{ manualCount }} manual{{ manualCount === 1 ? "" : "es" }} disponible{{
          manualCount === 1 ? "" : "s"
        }}. Se abren en una pestaña nueva.
      </p>

      <ul class="instructions-list">
        <li
          v-for="manual in instrucciones?.manuales"
          :key="manual.url"
          class="instructions-item"
        >
          <a
            :href="manual.url"
            target="_blank"
            rel="noopener noreferrer"
            class="instructions-link"
          >
            <i class="pi pi-file-pdf" aria-hidden="true" />
            <span class="instructions-link-text">
              <span class="instructions-link-label">{{ manual.etiqueta }}</span>
              <span class="instructions-link-hint">PDF · LEGO.com</span>
            </span>
            <i class="pi pi-external-link instructions-link-icon" aria-hidden="true" />
          </a>
        </li>

        <li v-if="instrucciones?.folleto" class="instructions-item">
          <a
            :href="instrucciones.folleto.url"
            target="_blank"
            rel="noopener noreferrer"
            class="instructions-link instructions-link--booklet"
          >
            <i class="pi pi-book" aria-hidden="true" />
            <span class="instructions-link-text">
              <span class="instructions-link-label">{{ instrucciones.folleto.etiqueta }}</span>
              <span class="instructions-link-hint">
                {{ instrucciones.folleto.idioma }} · Folleto digital
              </span>
            </span>
            <i class="pi pi-external-link instructions-link-icon" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </Dialog>
  </template>
</template>

<style scoped>
.instructions-section {
  width: 100%;
}

.instructions-btn--sidebar {
  width: 100%;
}

.instructions-btn--sidebar :deep(.p-button) {
  width: 100%;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
  border-radius: 8px;
}

.action-btn--instructions :deep(.p-button:not(:disabled):hover) {
  background: var(--p-blue-50, #eff6ff);
}

.instructions-intro {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: var(--p-text-muted-color, #64748b);
}

.instructions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instructions-item {
  margin: 0;
}

.instructions-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 8px;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  background: var(--p-surface-50, #f8fafc);
  color: inherit;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.instructions-link:hover {
  background: var(--p-blue-50, #eff6ff);
  border-color: var(--p-blue-200, #bfdbfe);
  transform: translateY(-1px);
}

.instructions-link--booklet {
  background: var(--p-surface-100, #f1f5f9);
}

.instructions-link-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.instructions-link-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.instructions-link-hint {
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #64748b);
}

.instructions-link-icon {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #64748b);
}
</style>
