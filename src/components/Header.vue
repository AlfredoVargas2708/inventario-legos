<script setup lang="ts">
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import { ref, type ComponentPublicInstance } from "vue";
import axios from "axios";
import { searchValue } from "@/api/api.service";

const selected = ref("");
const options = ref([
  { label: "Lego", value: "lego" },
  { label: "Pieza", value: "Pieza" },
]);

const inputValue = ref("");
const searchLoading = ref(false);
const inputRef = ref<ComponentPublicInstance | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

async function search() {
  if (!selected.value || !inputValue.value.trim()) return;
  abortController?.abort();
  abortController = new AbortController();
  searchLoading.value = true;
  try {
    const results = await searchValue(
      selected.value,
      inputValue.value,
      1,
      10,
      abortController.signal,
    );
    console.log(results);
  } catch (error) {
    if (!axios.isCancel(error)) console.error(error);
  } finally {
    setTimeout(() => {
      searchLoading.value = false;
    }, 1000);
  }
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(search, 1000);
}

function onSelect() {
  inputValue.value = "";
  setTimeout(() => {
    (inputRef.value?.$el as HTMLInputElement | undefined)?.focus();
  }, 1000);
}
</script>

<template>
  <header class="p-3 md:p-4">
    <div class="grid">
      <!-- Fila 1: título -->
      <div class="col-12">
        <h1 class="m-0 text-2xl md:text-3xl line-height-2">Inventario de Legos</h1>
      </div>

      <!-- Fila 2: Select -->
      <div class="col-12 md:col-4 lg:col-2">
        <Select
          v-model="selected"
          :options="options"
          placeholder="Elige una opción"
          option-label="label"
          option-value="value"
          class="w-full"
          @change="onSelect"
        />
      </div>

      <!-- Fila 2: Input + spinner (grid anidado) -->
      <div class="col-12 md:col-8 lg:col-3">
        <div class="grid align-items-center">
          <div class="col">
            <InputText
              ref="inputRef"
              v-model="inputValue"
              placeholder="Ingrese un valor"
              :disabled="!selected"
              class="w-full"
              @input="onInput"
            />
          </div>
          <div
            v-if="searchLoading"
            class="col-fixed flex align-items-center justify-content-center"
            style="width: 2.5rem"
          >
            <ProgressSpinner
              style="width: 2rem; height: 2rem"
              stroke-width="8"
              fill="transparent"
              animation-duration=".5s"
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
