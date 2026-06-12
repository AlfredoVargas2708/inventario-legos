<script setup lang="ts">
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { ref, type ComponentPublicInstance } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useDataSharingService } from "@/api/data-sharing.service";
import { SEARCH_TYPE_OPTIONS } from "@/constants/search";

const selected = ref("");
const inputValue = ref("");
const inputRef = ref<ComponentPublicInstance | null>(null);
const dataService = useDataSharingService();
const { loading, pagination } = storeToRefs(dataService);
const toast = useToast();
const router = useRouter();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function search() {
  if (!selected.value || !inputValue.value.trim()) return;

  const query = inputValue.value.trim();
  const typeLabel = selected.value === "lego" ? "Set" : "Pieza";

  dataService.setColumn(selected.value);
  dataService.setSearchValue(query);
  dataService.resetPedidosQuery();

  try {
    await dataService.fetchSearch(1, 6, { throwOnError: true, filters: {}, sort: null });
    await router.push({ name: "pedidos" });

    if ((pagination.value?.total ?? 0) === 0) {
      toast.add({
        severity: "warn",
        summary: "Sin resultados",
        detail: `No se encontraron pedidos para el ${typeLabel} "${query}".`,
        life: 4000,
      });
    }
  } catch {
    toast.add({
      severity: "error",
      summary: "No encontrado",
      detail: `${typeLabel} "${query}" no existe o no se pudo consultar.`,
      life: 4000,
    });
  }
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(search, 1000);
}

function onSelect() {
  inputValue.value = "";
  dataService.clearResults();
  dataService.setColumn(selected.value);
  setTimeout(() => {
    (inputRef.value?.$el as HTMLInputElement | undefined)?.focus();
  }, 500);
}
</script>

<template>
  <header class="app-header">
    <div class="header-top">
      <div>
        <h1 class="header-title">Inventario de Legos</h1>
        <p class="header-subtitle">Busca por set o pieza para ver pedidos e inventario</p>
      </div>
    </div>

    <div class="search-bar">
      <div class="search-field search-field--type">
        <label for="search-type" class="field-label">Tipo</label>
        <Select
          id="search-type"
          v-model="selected"
          :options="SEARCH_TYPE_OPTIONS"
          placeholder="Elige una opción"
          option-label="label"
          option-value="value"
          class="w-full"
          @change="onSelect"
        />
      </div>

      <div class="search-field search-field--query">
        <label for="search-query" class="field-label">Valor</label>
        <IconField class="w-full">
          <InputIcon class="pi pi-search" />
          <InputText
            id="search-query"
            ref="inputRef"
            v-model="inputValue"
            :placeholder="`Ingrese código de ${selected}`"
            :disabled="!selected"
            class="w-full"
            @input="onInput"
          />
        </IconField>
      </div>

      <div v-if="loading" class="search-spinner" aria-label="Buscando">
        <ProgressSpinner
          style="width: 1.75rem; height: 1.75rem"
          stroke-width="6"
          fill="transparent"
          animation-duration=".5s"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.header-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color, #64748b);
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.search-field--type {
  flex: 0 0 100%;
}

.search-field--query {
  flex: 1 1 12rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color, #64748b);
}

.search-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0.5rem;
}

@media (min-width: 576px) {
  .header-title {
    font-size: 1.75rem;
  }

  .search-field--type {
    flex: 0 0 12rem;
  }
}

@media (min-width: 768px) {
  .app-header {
    padding: 1.5rem 1.75rem;
  }

  .header-title {
    font-size: 2rem;
  }
}
</style>
