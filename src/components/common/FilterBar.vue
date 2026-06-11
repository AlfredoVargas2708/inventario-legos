<script setup lang="ts">
import { computed } from "vue";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const props = defineProps<{
  filterField: string;
  filterValue: string;
  options: { label: string; value: string }[];
  hasActiveFilter: boolean;
  fieldId?: string;
  valueId?: string;
  colorOptions?: { label: string; value: string }[];
  colorFilterField?: string;
  colorsLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:filterField": [value: string];
  "update:filterValue": [value: string];
  clear: [];
  fieldChange: [];
  filterInput: [];
}>();

const isColorFilter = computed(
  () =>
    Boolean(props.colorFilterField) &&
    props.filterField === props.colorFilterField &&
    (props.colorOptions?.length ?? 0) > 0,
);
</script>

<template>
  <div class="filter-bar">
    <div class="filter-field filter-field--column">
      <label :for="fieldId ?? 'filter-field'" class="field-label">Filtrar por</label>
      <Select
        :id="fieldId ?? 'filter-field'"
        :model-value="filterField"
        :options="options"
        placeholder="Columna"
        option-label="label"
        option-value="value"
        show-clear
        class="w-full"
        @update:model-value="emit('update:filterField', $event ?? '')"
        @change="emit('fieldChange')"
      />
    </div>
    <div class="filter-field filter-field--value">
      <label :for="valueId ?? 'filter-value'" class="field-label">Valor</label>
      <Select
        v-if="isColorFilter"
        :id="valueId ?? 'filter-value'"
        :model-value="filterValue"
        :options="colorOptions"
        placeholder="Elige un color"
        option-label="label"
        option-value="value"
        show-clear
        filter
        :loading="colorsLoading"
        :disabled="!filterField"
        class="w-full"
        @update:model-value="emit('update:filterValue', $event ?? '')"
        @change="emit('filterInput')"
      />
      <InputText
        v-else
        :id="valueId ?? 'filter-value'"
        :model-value="filterValue"
        placeholder="Texto a buscar"
        :disabled="!filterField"
        class="w-full"
        @update:model-value="emit('update:filterValue', $event ?? '')"
        @input="emit('filterInput')"
      />
    </div>
    <Button
      v-if="hasActiveFilter"
      label="Limpiar"
      icon="pi pi-times"
      severity="secondary"
      outlined
      size="small"
      class="filter-clear-btn"
      @click="emit('clear')"
    />
  </div>
</template>

<style scoped src="@/assets/styles/table.css"></style>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0 0 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.filter-field--column {
  flex: 0 0 100%;
}

.filter-field--value {
  flex: 1 1 12rem;
}

.filter-clear-btn {
  margin-bottom: 0.125rem;
}

@media (min-width: 576px) {
  .filter-field--column {
    flex: 0 0 12rem;
  }
}
</style>
