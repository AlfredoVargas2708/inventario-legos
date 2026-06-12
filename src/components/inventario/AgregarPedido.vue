<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Message from "primevue/message";
import { createPedido, type PedidoPayload } from "@/api/api.service";
import { useDataSharingService } from "@/api/data-sharing.service";
import { buildPedidoDefaultsFromInventory } from "@/utils/inventory-pedido";

const props = defineProps<{
  visible: boolean;
  item: Record<string, unknown> | null;
  searchColumn: string;
  searchValue: string;
  setNombre?: string;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const dataService = useDataSharingService();

const submitting = ref(false);
const errorMessage = ref("");

const siNoOptions = [
  { label: "Sí", value: "Si" },
  { label: "No", value: "No" },
];

const preview = ref({
  label: "",
  image: "",
  detail: "",
});

const form = reactive({
  lego: "",
  pieza: "",
  cantidad: 1,
  task: "",
  esta_pedido: "No",
  esta_completo: "No",
  esta_reemplazado: "",
  comentarios: "",
  set_nombre: "",
});

const contextLabel = computed(() =>
  props.searchColumn === "lego" ? "pieza del set" : "set que incluye la pieza",
);

function loadForm() {
  errorMessage.value = "";

  if (!props.item || !props.searchValue.trim()) return;

  const defaults = buildPedidoDefaultsFromInventory(
    props.searchColumn,
    props.searchValue,
    props.item,
    props.setNombre,
  );

  form.lego = defaults.lego;
  form.pieza = defaults.pieza;
  form.cantidad = defaults.cantidad;
  form.set_nombre = defaults.set_nombre;
  form.task = "";
  form.esta_pedido = "No";
  form.esta_completo = "No";
  form.esta_reemplazado = "";
  form.comentarios = "";

  preview.value = {
    label: defaults.label,
    image: defaults.image,
    detail: defaults.detail,
  };
}

watch(
  () => [props.visible, props.item, props.searchColumn, props.searchValue] as const,
  ([visible]) => {
    if (visible) loadForm();
  },
  { immediate: true },
);

function buildPayload(): PedidoPayload {
  return {
    lego: form.lego.trim(),
    pieza: form.pieza.trim(),
    cantidad: String(form.cantidad),
    task: form.task.trim(),
    esta_pedido: form.esta_pedido,
    esta_completo: form.esta_completo,
    esta_reemplazado: form.esta_reemplazado.trim() || null,
    comentarios: form.comentarios.trim() || null,
    set_nombre: form.set_nombre.trim() || undefined,
  };
}

async function submit() {
  errorMessage.value = "";

  if (!form.lego.trim() || !form.pieza.trim() || !form.task.trim()) {
    errorMessage.value = "Lego, pieza y número de bolsa son obligatorios.";
    return;
  }

  submitting.value = true;
  try {
    await createPedido(buildPayload());
    await dataService.refreshResults();
    emit("success");
  } catch {
    errorMessage.value = "No se pudo crear el pedido. Intenta de nuevo.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="pedido-form" @submit.prevent="submit">
    <Message v-if="errorMessage" severity="error" :closable="false" class="form-message">
      {{ errorMessage }}
    </Message>

    <div v-if="preview.label" class="item-preview">
      <img
        v-if="preview.image"
        :src="preview.image"
        :alt="preview.label"
        class="item-preview-img"
      />
      <div class="item-preview-text">
        <p class="item-preview-label">{{ preview.label }}</p>
        <p v-if="preview.detail" class="item-preview-detail">{{ preview.detail }}</p>
        <p class="item-preview-context">{{ contextLabel }}</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="agregar-lego">Lego (set)</label>
        <InputText id="agregar-lego" v-model="form.lego" class="w-full" readonly />
      </div>

      <div class="field">
        <label for="agregar-pieza">Pieza</label>
        <InputText id="agregar-pieza" v-model="form.pieza" class="w-full" readonly />
      </div>

      <div class="field">
        <label for="agregar-cantidad">Cantidad</label>
        <InputNumber
          id="agregar-cantidad"
          v-model="form.cantidad"
          :min="1"
          :max="999"
          show-buttons
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="agregar-task">N° Bolsa</label>
        <InputText id="agregar-task" v-model="form.task" class="w-full" required autofocus />
      </div>

      <div class="field field--full">
        <label for="agregar-set-nombre">Nombre del set</label>
        <InputText id="agregar-set-nombre" v-model="form.set_nombre" class="w-full" />
      </div>

      <div class="field">
        <label for="agregar-pedido">¿Pedido?</label>
        <Select
          id="agregar-pedido"
          v-model="form.esta_pedido"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="agregar-completo">¿Completo?</label>
        <Select
          id="agregar-completo"
          v-model="form.esta_completo"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="agregar-reemplazado">Reemplazado</label>
        <InputText
          id="agregar-reemplazado"
          v-model="form.esta_reemplazado"
          placeholder="Opcional"
          class="w-full"
        />
      </div>

      <div class="field field--full">
        <label for="agregar-comentarios">Comentarios</label>
        <Textarea
          id="agregar-comentarios"
          v-model="form.comentarios"
          rows="3"
          placeholder="Opcional"
          class="w-full"
          auto-resize
        />
      </div>
    </div>

    <div class="form-actions">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        outlined
        :disabled="submitting"
        @click="emit('close')"
      />
      <Button
        type="submit"
        label="Agregar pedido"
        icon="pi pi-plus"
        :loading="submitting"
      />
    </div>
  </form>
</template>

<style scoped>
.pedido-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-message {
  margin: 0;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--p-content-border-color, #e2e8f0);
  background: var(--p-surface-50, #f8fafc);
}

.item-preview-img {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--p-content-background);
}

.item-preview-text {
  min-width: 0;
}

.item-preview-label {
  margin: 0;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--p-text-color);
}

.item-preview-detail {
  margin: 0.125rem 0 0;
  font-size: 0.8125rem;
  color: var(--app-text-muted);
}

.item-preview-context {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--app-text-muted);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--app-text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
}

@media (max-width: 575px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
